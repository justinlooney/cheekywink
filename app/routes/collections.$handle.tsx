import type {Route} from './+types/collections.$handle';
import {useLoaderData} from 'react-router';
import {PRODUCT_CARD_FRAGMENT} from '~/graphql/fragments';
import {ProductCard} from '~/components/ProductCard';
import {useScrollReveal} from '~/animation/useScrollReveal';
import {useTextReveal} from '~/animation/useTextReveal';

// Self-contained query (no pagination variables) — same fragment the homepage
// already renders successfully, so it's known-good against the live API.
const COLLECTION_PAGE_QUERY = `#graphql
  ${PRODUCT_CARD_FRAGMENT}
  query CollectionPage(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id
      title
      description
      handle
      products(first: 48) {
        nodes {
          ...ProductCard
        }
      }
    }
  }
` as const;

export const meta: Route.MetaFunction = ({data}) => [
  {title: `${data?.collection?.title ?? 'Shop'} — The Cheeky Wink`},
];

export async function loader({params, context}: Route.LoaderArgs) {
  const handle = params.handle;
  if (!handle) throw new Response('Not found', {status: 404});

  const {collection} = await context.storefront.query(COLLECTION_PAGE_QUERY, {
    variables: {handle},
  });

  if (!collection) {
    throw new Response('Collection not found', {status: 404});
  }
  return {collection};
}

export default function Collection() {
  const {collection} = useLoaderData<typeof loader>();
  const title = useTextReveal<HTMLHeadingElement>();
  const grid = useScrollReveal<HTMLDivElement>({selector: '.reveal-card'});
  const products = collection.products?.nodes ?? [];

  return (
    <div className="px-6 pb-24 pt-28 md:px-10">
      <header className="mb-12">
        <h1 ref={title} className="font-display text-fluid-lg text-blush">
          {collection.title}
        </h1>
        {collection.description ? (
          <p className="mt-4 max-w-xl text-cream/60">{collection.description}</p>
        ) : null}
      </header>

      {products.length === 0 ? (
        <p className="text-cream/60">
          Nothing in this collection yet.{' '}
          <a href="/collections/all" className="text-rose underline">
            Browse everything →
          </a>
        </p>
      ) : (
        <div
          ref={grid}
          className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6"
        >
          {products.map((product, i) => (
            <div className="reveal-card" key={product.id}>
              <ProductCard product={product} loading={i < 8 ? 'eager' : 'lazy'} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
