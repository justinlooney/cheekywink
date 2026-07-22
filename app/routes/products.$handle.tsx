import type {Route} from './+types/products.$handle';
import {useLoaderData, Link} from 'react-router';
import {useRef} from 'react';
import {
  getSelectedProductOptions,
  useOptimisticVariant,
  getAdjacentAndFirstAvailableVariants,
  useSelectedOptionInUrlParam,
  getProductOptions,
  Image,
  Money,
  Analytics,
} from '@shopify/hydrogen';
import {AddToCartButton} from '~/components/AddToCartButton';
import {gsap} from '~/animation/gsap';
import {useGsapContext} from '~/animation/useGsapContext';

const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment PdpVariant on ProductVariant {
    id
    title
    availableForSale
    selectedOptions { name value }
    image { id url altText width height }
    price { amount currencyCode }
    compareAtPrice { amount currencyCode }
    product { title handle }
  }
` as const;

const PRODUCT_FRAGMENT = `#graphql
  ${PRODUCT_VARIANT_FRAGMENT}
  fragment Pdp on Product {
    id
    title
    vendor
    handle
    descriptionHtml
    encodedVariantExistence
    encodedVariantAvailability
    options {
      name
      optionValues {
        name
        firstSelectableVariant { ...PdpVariant }
        swatch { color image { previewImage { url } } }
      }
    }
    media(first: 10) {
      nodes {
        __typename
        ... on MediaImage { id image { url altText width height } }
      }
    }
    selectedOrFirstAvailableVariant(
      selectedOptions: $selectedOptions
      ignoreUnknownOptions: true
      caseInsensitiveMatch: true
    ) { ...PdpVariant }
    adjacentVariants(selectedOptions: $selectedOptions) { ...PdpVariant }
    seo { title description }
  }
` as const;

const PRODUCT_QUERY = `#graphql
  ${PRODUCT_FRAGMENT}
  query Pdp(
    $handle: String!
    $selectedOptions: [SelectedOptionInput!]!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) { ...Pdp }
  }
` as const;

export const meta: Route.MetaFunction = ({data}) => [
  {title: `${data?.product?.title ?? 'Product'} — The Cheeky Wink`},
  {name: 'description', content: data?.product?.seo?.description ?? ''},
];

export async function loader({params, request, context}: Route.LoaderArgs) {
  const {handle} = params;
  if (!handle) throw new Response('Not found', {status: 404});

  const {product} = await context.storefront.query(PRODUCT_QUERY, {
    variables: {handle, selectedOptions: getSelectedProductOptions(request)},
  });

  if (!product?.id) throw new Response('Not found', {status: 404});
  return {product};
}

export default function Product() {
  const {product} = useLoaderData<typeof loader>();
  const scope = useRef<HTMLDivElement>(null);

  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );
  useSelectedOptionInUrlParam(selectedVariant.selectedOptions);

  const productOptions = getProductOptions({
    ...product,
    selectedOrFirstAvailableVariant: selectedVariant,
  });

  const images = product.media?.nodes?.filter(
    (m: any) => m.__typename === 'MediaImage' && m.image,
  );

  useGsapContext(scope, () => {
    gsap.from('.pdp-media', {autoAlpha: 0, y: 40, stagger: 0.1, duration: 1});
    gsap.from('.pdp-info > *', {autoAlpha: 0, y: 24, stagger: 0.08, delay: 0.15});
  });

  return (
    <div
      ref={scope}
      className="grid gap-10 px-6 pb-24 pt-28 md:grid-cols-2 md:gap-16 md:px-10"
    >
      {/* Media */}
      <div className="space-y-4">
        {selectedVariant?.image ? (
          <div className="pdp-media overflow-hidden rounded-2xl">
            <Image
              data={selectedVariant.image}
              sizes="(min-width:768px) 50vw, 100vw"
              className="w-full object-cover"
            />
          </div>
        ) : null}
        {images?.map((m: any) => (
          <div key={m.id} className="pdp-media overflow-hidden rounded-2xl">
            <Image data={m.image} sizes="(min-width:768px) 50vw, 100vw" />
          </div>
        ))}
      </div>

      {/* Info */}
      <div className="pdp-info md:sticky md:top-28 md:h-fit">
        {product.vendor ? (
          <p className="text-sm uppercase tracking-widest text-rose">{product.vendor}</p>
        ) : null}
        <h1 className="mt-2 font-display text-fluid-lg text-cream">{product.title}</h1>
        {selectedVariant?.price ? (
          <div className="mt-4 flex items-baseline gap-3">
            <Money data={selectedVariant.price} className="text-xl text-blush" />
            {selectedVariant.compareAtPrice &&
            Number(selectedVariant.compareAtPrice.amount) >
              Number(selectedVariant.price.amount) ? (
              <Money
                data={selectedVariant.compareAtPrice}
                className="text-ink/40 text-cream/40 line-through"
              />
            ) : null}
          </div>
        ) : null}

        {/* Variant options */}
        <div className="mt-8 space-y-6">
          {productOptions.map((option) => {
            if (option.optionValues.length === 1) return null;
            return (
              <div key={option.name}>
                <p className="mb-3 text-sm uppercase tracking-widest text-cream/60">
                  {option.name}
                </p>
                <div className="flex flex-wrap gap-2">
                  {option.optionValues.map((value) => {
                    const {
                      name,
                      handle,
                      variantUriQuery,
                      selected,
                      available,
                      exists,
                      isDifferentProduct,
                    } = value;
                    const className = `rounded-full border px-5 py-2 text-sm transition-colors ${
                      selected
                        ? 'border-rose bg-rose text-ink'
                        : 'border-cream/30 text-cream hover:border-cream'
                    } ${available ? '' : 'opacity-40'}`;
                    return isDifferentProduct ? (
                      <Link
                        key={option.name + name}
                        to={`/products/${handle}?${variantUriQuery}`}
                        prefetch="intent"
                        className={className}
                      >
                        {name}
                      </Link>
                    ) : (
                      <Link
                        key={option.name + name}
                        to={`?${variantUriQuery}`}
                        replace
                        preventScrollReset
                        aria-disabled={!exists}
                        className={className}
                      >
                        {name}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-10">
          <AddToCartButton
            disabled={!selectedVariant?.availableForSale}
            lines={
              selectedVariant
                ? [{merchandiseId: selectedVariant.id, quantity: 1}]
                : []
            }
          >
            {selectedVariant?.availableForSale ? 'Add to bag' : 'Sold out'}
          </AddToCartButton>
        </div>

        {product.descriptionHtml ? (
          <div
            className="mt-12 max-w-none text-cream/80 [&_a]:underline [&_li]:ml-5 [&_li]:list-disc"
            dangerouslySetInnerHTML={{__html: product.descriptionHtml}}
          />
        ) : null}
      </div>

      <Analytics.ProductView
        data={{
          products: [
            {
              id: product.id,
              title: product.title,
              price: selectedVariant?.price?.amount || '0',
              vendor: product.vendor,
              variantId: selectedVariant?.id || '',
              variantTitle: selectedVariant?.title || '',
              quantity: 1,
            },
          ],
        }}
      />
    </div>
  );
}
