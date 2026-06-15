import type {Route} from './+types/collections.$handle';
import {useLoaderData} from 'react-router';
import {getPaginationVariables, Pagination} from '@shopify/hydrogen';
import {COLLECTION_QUERY} from '~/graphql/collections';
import {ProductCard} from '~/components/ProductCard';
import {useScrollReveal} from '~/animation/useScrollReveal';
import {useTextReveal} from '~/animation/useTextReveal';

export const meta: Route.MetaFunction = ({data}) => [
  {title: `${data?.collection?.title ?? 'Shop'} — The Cheeky Wink`},
];

export async function loader({params, request, context}: Route.LoaderArgs) {
  const handle = params.handle ?? 'all';
  const paginationVariables = getPaginationVariables(request, {pageBy: 12});

  const {collection} = await context.storefront.query(COLLECTION_QUERY, {
    variables: {handle, ...paginationVariables},
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

  return (
    <div className="px-6 pb-24 pt-28 md:px-10">
      <header className="mb-12">
        <h1 ref={title} className="font-display text-fluid-lg text-blush">
          {collection.title}
        </h1>
        {collection.description && (
          <p className="mt-4 max-w-xl text-cream/60">{collection.description}</p>
        )}
      </header>

      <Pagination connection={collection.products}>
        {({nodes, isLoading, PreviousLink, NextLink}) => (
          <>
            <PreviousLink className="mx-auto mb-8 block w-fit text-sm uppercase tracking-widest text-cream/60">
              {isLoading ? 'Loading…' : '↑ Load previous'}
            </PreviousLink>
            <div
              ref={grid}
              className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6"
            >
              {nodes.map((product, i) => (
                <div className="reveal-card" key={product.id}>
                  <ProductCard product={product} loading={i < 8 ? 'eager' : 'lazy'} />
                </div>
              ))}
            </div>
            <NextLink className="mx-auto mt-12 block w-fit rounded-full border border-cream/30 px-8 py-3 text-sm uppercase tracking-widest text-cream hover:bg-cream hover:text-ink">
              {isLoading ? 'Loading…' : 'Load more'}
            </NextLink>
          </>
        )}
      </Pagination>
    </div>
  );
}
