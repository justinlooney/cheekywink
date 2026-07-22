import type {Route} from './+types/_index';
import {useLoaderData, Link} from 'react-router';
import {lazy, Suspense, useRef} from 'react';
import {
  FEATURED_COLLECTION_QUERY,
  HOME_COLLECTIONS_QUERY,
  MOMENTS_QUERY,
} from '~/graphql/collections';
import {ClientOnly} from '~/components/ClientOnly';
import {CategoryTiles, type CategoryTile} from '~/components/CategoryTiles';
import {ProductRow} from '~/components/ProductRow';
import {ShopTheMoment, type Moment} from '~/components/ShopTheMoment';
import {MagneticButton} from '~/components/MagneticButton';
import {useTextReveal} from '~/animation/useTextReveal';
import {gsap} from '~/animation/gsap';
import {useGsapContext} from '~/animation/useGsapContext';

// Lazy + client-only: keeps Three.js / react-reconciler out of the SSR bundle.
const HeroScene = lazy(() =>
  import('~/three/HeroScene').then((m) => ({default: m.HeroScene})),
);

// 👉 Collection featured in the 3D hero carousel. Full options if Best Sellers
// is sparse: 'home-page' (408), 'sale' (115), 'dresses-and-skirts' (61).
const FEATURED_HANDLE = 'best-sellers';

// Curated copy for the "Shop the Moment" scene, keyed by real collection
// handle. This WINS over the collection's own admin description — those are
// full SEO paragraphs meant for search engines, not punchy on-screen captions,
// and read as a wall of text on a phone. Falls back to the admin description
// only for a collection with no curated entry here.
const MOMENT_META: Record<string, {title: string; tagline: string}> = {
  'wedding-guest-collection': {
    title: 'Wedding Guest',
    tagline: 'Effortlessly elegant looks for every celebration.',
  },
  'vacation-ready-collection': {
    title: 'Vacation Ready',
    tagline: 'Pack light, look unforgettable.',
  },
  'concert-ready-collection': {
    title: 'Concert Ready',
    tagline: 'Bold pieces built for the front row.',
  },
  'formal-dresses': {
    title: 'Formal Dresses',
    tagline: 'Polished statements for black-tie moments.',
  },
};

export const meta: Route.MetaFunction = () => [
  {title: 'The Cheeky Wink — Elevate Your Everyday Style'},
  {
    name: 'description',
    content:
      'Dresses, denim, handbags, and accessories curated for the modern trendsetter.',
  },
];

export async function loader({context}: Route.LoaderArgs) {
  const {storefront} = context;
  // Hero feed + all merchandising collections + occasion scenes, in parallel.
  const [featuredRes, home, momentsRes] = await Promise.all([
    storefront.query(FEATURED_COLLECTION_QUERY, {
      variables: {handle: FEATURED_HANDLE},
    }),
    storefront.query(HOME_COLLECTIONS_QUERY),
    storefront.query(MOMENTS_QUERY),
  ]);

  const heroItems = (featuredRes.collection?.products?.nodes ?? [])
    .map((p) => ({url: p.featuredImage?.url ?? '', handle: p.handle, title: p.title}))
    .filter((i) => Boolean(i.url))
    .slice(0, 8);

  // Build category tiles (image falls back to the first product's photo).
  const tile = (col: any, title: string): CategoryTile | null =>
    col
      ? {handle: col.handle, title, image: col.image ?? col.products?.nodes?.[0]?.featuredImage ?? null}
      : null;
  const tiles = [
    tile(home.dresses, 'Dresses'),
    tile(home.handbags, 'Handbags'),
    tile(home.denim, 'Denim'),
    tile(home.shoes, 'Shoes'),
    tile(home.swimwear, 'Swimwear'),
    tile(home.accessories, 'Jewelry'),
    tile(home.tees, 'Tops'),
    tile(home.sale, 'Sale'),
  ].filter(Boolean) as CategoryTile[];

  // Build product rows (skips empty collections automatically).
  const row = (col: any, title: string) =>
    col?.products?.nodes?.length
      ? {title, handle: col.handle, products: col.products.nodes}
      : null;
  const rows = [
    row(home.newArrivals, 'New Arrivals'),
    row(home.bestSellers, 'Best Sellers'),
    row(home.dresses, 'Dresses & Skirts'),
    row(home.denim, 'The Denim Edit'),
  ].filter(Boolean) as {title: string; handle: string; products: any[]}[];

  // Build "Shop the Moment" panels — real collections, curated fallback copy.
  // A missing/renamed handle just drops out (never breaks the page).
  const buildMoment = (col: any): Moment | null => {
    if (!col) return null;
    const meta = MOMENT_META[col.handle];
    return {
      handle: col.handle,
      title: meta?.title ?? col.title,
      tagline: meta?.tagline || col.description || '',
      // Only use a REAL collection image (set in Shopify admin). A random
      // product photo as fallback crops unpredictably — the subject can be
      // anywhere in frame, and object-position is a per-image guess we have
      // no way to get right sight-unseen. No image → the panel just shows a
      // clean branded color instead of a badly-cropped photo.
      image: col.image ?? null,
    };
  };
  const moments = [
    momentsRes.weddingGuest,
    momentsRes.vacationReady,
    momentsRes.concertReady,
    momentsRes.formalDresses,
  ]
    .map(buildMoment)
    .filter(Boolean) as Moment[];

  return {heroItems, tiles, rows, moments};
}

export default function Homepage() {
  const {heroItems, tiles, rows, moments} = useLoaderData<typeof loader>();
  const hero = useRef<HTMLDivElement>(null);
  const title = useTextReveal<HTMLHeadingElement>();

  useGsapContext(hero, () => {
    gsap.to('.hero-copy', {
      yPercent: -40,
      ease: 'none',
      scrollTrigger: {
        trigger: hero.current!,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
    });
  });

  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section
        ref={hero}
        className="relative flex h-[100svh] items-end overflow-hidden px-6 pb-20 md:px-10"
      >
        <ClientOnly>
          {() => (
            <Suspense fallback={null}>
              <HeroScene items={heroItems} />
            </Suspense>
          )}
        </ClientOnly>
        {/* Text-protection scrim: sits above the 3D canvas, below the copy, so
            the headline/subtitle stay readable no matter what product photo
            happens to be spinning behind them (bright cards were washing out
            the light-colored copy on mobile). */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] h-3/4 bg-gradient-to-t from-ink via-ink/70 to-transparent"
        />
        <div className="hero-copy relative z-10 max-w-2xl">
          <p className="mb-4 text-sm uppercase tracking-[0.3em] text-gold/90">
            New Season · Editorial
          </p>
          <h1
            ref={title}
            className="font-display text-fluid-xl font-semibold leading-[0.95] text-cream"
          >
            Elevate Your Everyday Style
          </h1>
          <p className="mt-6 max-w-md font-body text-fluid-md font-light text-blush/80">
            Dresses, denim, handbags, and accessories curated for the modern
            trendsetter.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <MagneticButton
              as="a"
              href="/collections/new-arrivals"
              className="inline-block rounded-full bg-gold px-10 py-4 text-sm font-medium uppercase tracking-widest text-ink transition-colors hover:bg-cream"
            >
              Shop New Arrivals
            </MagneticButton>
            <a
              href="/collections/handbags-and-totes"
              className="inline-block rounded-full border border-cream/40 px-10 py-4 text-sm uppercase tracking-widest text-cream backdrop-blur-sm transition-colors hover:bg-cream hover:text-ink"
            >
              Explore Handbags
            </a>
          </div>
        </div>
      </section>

      {/* ── Shop the moment (cinematic, pinned on desktop) ──────── */}
      <ShopTheMoment moments={moments} />

      {/* ── Shop by category ─────────────────────────────────── */}
      <CategoryTiles tiles={tiles} />

      {/* ── Merchandised product rows ────────────────────────── */}
      {rows.slice(0, 2).map((r) => (
        <ProductRow key={r.handle} title={r.title} handle={r.handle} products={r.products} />
      ))}

      {/* ── Sale banner ──────────────────────────────────────── */}
      <section className="px-6 py-10 md:px-10">
        <Link
          to="/collections/sale"
          prefetch="intent"
          className="group relative flex h-[40vh] items-center justify-center overflow-hidden rounded-2xl bg-wine text-center"
        >
          <div className="relative z-10">
            <p className="mb-3 text-sm uppercase tracking-[0.3em] text-blush/80">
              Up to 50% off
            </p>
            <h2 className="font-display text-fluid-lg text-cream">The Sale Edit</h2>
            <span className="mt-6 inline-block text-sm uppercase tracking-widest text-cream/80 underline-offset-4 group-hover:underline">
              Shop the sale →
            </span>
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-wine via-rose/30 to-wine opacity-60 transition-opacity duration-700 group-hover:opacity-90" />
        </Link>
      </section>

      {/* ── Remaining rows ───────────────────────────────────── */}
      {rows.slice(2).map((r) => (
        <ProductRow key={r.handle} title={r.title} handle={r.handle} products={r.products} />
      ))}
    </>
  );
}
