import {Link} from 'react-router';
import {ProductCard} from './ProductCard';
import {useScrollReveal} from '~/animation/useScrollReveal';
import type {ProductCardFragment} from 'storefrontapi.generated';

/**
 * A reusable merchandising row: a title + "View all" link over a horizontally
 * scroll-snapping strip of product cards that stagger in on scroll. Renders
 * nothing if the collection is empty (keeps the homepage clean automatically).
 */
export function ProductRow({
  title,
  handle,
  products,
}: {
  title: string;
  handle: string;
  products: ProductCardFragment[];
}) {
  const row = useScrollReveal<HTMLDivElement>({selector: '.row-card', y: 60});
  if (!products?.length) return null;

  return (
    <section className="px-6 py-14 md:px-10">
      <div className="mb-8 flex items-baseline justify-between">
        <h2 className="font-display text-fluid-lg text-blush">{title}</h2>
        <Link
          to={`/collections/${handle}`}
          prefetch="intent"
          className="text-sm uppercase tracking-widest text-cream/60 transition-colors hover:text-rose"
        >
          View all →
        </Link>
      </div>
      <div
        ref={row}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 md:gap-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {products.map((p) => (
          <div
            key={p.id}
            className="row-card w-[62vw] flex-none snap-start sm:w-[40vw] md:w-[23vw]"
          >
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </section>
  );
}
