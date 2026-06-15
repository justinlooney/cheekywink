import type {Route} from './+types/_index';
import {useLoaderData} from 'react-router';
import {lazy, Suspense, useRef} from 'react';
import {FEATURED_COLLECTION_QUERY} from '~/graphql/collections';
import {ClientOnly} from '~/components/ClientOnly';
import {ProductCard} from '~/components/ProductCard';
import {MagneticButton} from '~/components/MagneticButton';
import {useTextReveal} from '~/animation/useTextReveal';
import {useScrollReveal} from '~/animation/useScrollReveal';
import {gsap} from '~/animation/gsap';
import {useGsapContext} from '~/animation/useGsapContext';

// Lazy + client-only: keeps Three.js / react-reconciler out of the SSR bundle.
const HeroScene = lazy(() =>
  import('~/three/HeroScene').then((m) => ({default: m.HeroScene})),
);

export const meta: Route.MetaFunction = () => [
  {title: 'The Cheeky Wink — Elevate Your Everyday Style'},
  {
    name: 'description',
    content:
      'Handbags, outfits, and accessories curated for the modern trendsetter.',
  },
];

// Awaited (small query) so the hero carousel has real product photos at mount.
export async function loader({context}: Route.LoaderArgs) {
  const {collections} = await context.storefront.query(FEATURED_COLLECTION_QUERY);
  const products = collections?.nodes?.[0]?.products?.nodes ?? [];
  const heroItems = products
    .map((p) => ({
      url: p.featuredImage?.url ?? '',
      handle: p.handle,
      title: p.title,
    }))
    .filter((i) => Boolean(i.url))
    .slice(0, 8);
  return {products, heroItems};
}

export default function Homepage() {
  const {products, heroItems} = useLoaderData<typeof loader>();
  const hero = useRef<HTMLDivElement>(null);
  const title = useTextReveal<HTMLHeadingElement>();
  const grid = useScrollReveal<HTMLDivElement>({selector: '.reveal-card'});

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
            Handbags, outfits, and accessories curated for the modern trendsetter.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            {/* Primary CTA — magnetic. Adjust handles to your real collections. */}
            <MagneticButton
              as="a"
              href="/collections/new"
              className="inline-block rounded-full bg-gold px-10 py-4 text-sm font-medium uppercase tracking-widest text-ink transition-colors hover:bg-cream"
            >
              Shop New Arrivals
            </MagneticButton>
            <a
              href="/collections/all"
              className="inline-block rounded-full border border-cream/40 px-10 py-4 text-sm uppercase tracking-widest text-cream backdrop-blur-sm transition-colors hover:bg-cream hover:text-ink"
            >
              Explore Handbags
            </a>
          </div>
        </div>
      </section>

      <section className="bg-ink px-6 py-24 md:px-10">
        <h2 className="mb-12 font-display text-fluid-lg text-blush">Just dropped</h2>
        <div ref={grid} className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {products.map((p, i) => (
            <div className="reveal-card" key={p.id}>
              <ProductCard product={p} loading={i < 4 ? 'eager' : 'lazy'} />
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
