import {Link} from 'react-router';
import {Image} from '@shopify/hydrogen';
import {useScrollReveal} from '~/animation/useScrollReveal';

export type CategoryTile = {
  handle: string;
  title: string;
  image?: {url: string; altText?: string | null; width?: number | null; height?: number | null} | null;
};

/**
 * "Shop by Category" — image tiles that funnel shoppers into the main buckets.
 * Each tile zooms its image on hover (CSS, GPU-cheap) and the whole grid
 * staggers in on scroll. The single highest-IA-value block for navigation.
 */
export function CategoryTiles({tiles}: {tiles: CategoryTile[]}) {
  const grid = useScrollReveal<HTMLDivElement>({selector: '.cat-tile', y: 60});
  if (!tiles.length) return null;

  return (
    <section className="px-6 py-20 md:px-10">
      <h2 className="mb-10 font-display text-fluid-lg text-blush">Shop by category</h2>
      <div ref={grid} className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
        {tiles.map((t) => (
          <Link
            key={t.handle}
            to={`/collections/${t.handle}`}
            prefetch="intent"
            className="cat-tile group relative aspect-[3/4] overflow-hidden rounded-xl bg-ink/40"
          >
            {t.image ? (
              <Image
                data={t.image}
                sizes="(min-width:768px) 25vw, 50vw"
                className="h-full w-full object-cover transition-transform duration-700 ease-expo-out group-hover:scale-110"
              />
            ) : null}
            <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent" />
            <span className="absolute bottom-4 left-4 font-display text-xl text-cream md:text-2xl">
              {t.title}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
