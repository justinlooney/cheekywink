import {Link} from 'react-router';
import {useRef} from 'react';
import {Image} from '@shopify/hydrogen';
import {gsap} from '~/animation/gsap';
import {useGsapContext} from '~/animation/useGsapContext';
import {useReducedMotion} from '~/animation/useReducedMotion';

export type Moment = {
  handle: string;
  title: string;
  tagline: string;
  image?: {
    url: string;
    altText?: string | null;
    width?: number | null;
    height?: number | null;
  } | null;
};

/**
 * "Shop the Moment" — an Apple-style horizontal scroll-jacked sequence on
 * desktop: the section pins and scrolling scrubs through full-bleed occasion
 * panels (Wedding Guest, Vacation Ready, …) instead of scrolling past them.
 * On touch devices and under `prefers-reduced-motion` it renders as a plain
 * stacked list instead — scroll-jacking a phone (or overriding a user's
 * motion preference) is a regression, never a "lesser" version.
 */
export function ShopTheMoment({moments}: {moments: Moment[]}) {
  const wrap = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useGsapContext(
    wrap,
    () => {
      if (reduced || moments.length < 2) return;

      const mm = gsap.matchMedia();
      mm.add('(min-width: 768px) and (pointer: fine)', () => {
        const track = wrap.current!.querySelector(
          '.moment-track',
        ) as HTMLElement | null;
        const panels = gsap.utils.toArray<HTMLElement>('.moment-panel');
        const dots = gsap.utils.toArray<HTMLElement>('.moment-dot');
        if (!track || panels.length < 2) return;

        gsap.set(track, {width: `${panels.length * 100}%`});
        gsap.set(panels, {width: `${100 / panels.length}%`});

        gsap.to(panels, {
          xPercent: -100 * (panels.length - 1),
          ease: 'none',
          scrollTrigger: {
            trigger: wrap.current!,
            start: 'top top',
            end: () => '+=' + track.offsetWidth,
            pin: true,
            scrub: 1,
            anticipatePin: 1,
            onUpdate: (self) => {
              const idx = Math.round(self.progress * (panels.length - 1));
              dots.forEach((d, i) => {
                d.classList.toggle('opacity-100', i === idx);
                d.classList.toggle('opacity-30', i !== idx);
              });
            },
          },
        });
        // No manual cleanup needed: matchMedia auto-reverts every GSAP object
        // (tweens, ScrollTriggers, .set() style changes) created in this
        // callback once the breakpoint stops matching or the context reverts.
      });
    },
    [reduced, moments.length],
  );

  if (!moments.length) return null;

  return (
    <section
      ref={wrap}
      aria-label="Shop by moment"
      className="relative overflow-hidden md:h-screen"
    >
      <div className="moment-track flex flex-col md:flex-row">
        {moments.map((m) => (
          <Link
            key={m.handle}
            to={`/collections/${m.handle}`}
            prefetch="intent"
            className="moment-panel group relative block h-[70vh] w-full flex-none md:h-full"
          >
            {m.image ? (
              // object-top: a reasonable default bias for portrait fashion
              // photography (subject usually upper-frame), but this is a
              // heuristic, not a fix — a collection with NO custom admin
              // image falls back to a random product photo whose subject
              // may sit anywhere in frame. Set a real "Collection image" in
              // Shopify admin for a properly composed, guaranteed crop.
              <Image
                data={m.image}
                sizes="100vw"
                className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-700 ease-expo-out group-hover:scale-105"
              />
            ) : (
              <div className="absolute inset-0 bg-ink" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-8 md:p-14">
              <p className="mb-2 text-xs uppercase tracking-[0.3em] text-gold">
                Shop the moment
              </p>
              <h3 className="font-display text-fluid-lg text-cream">{m.title}</h3>
              {m.tagline ? (
                <p className="mt-2 line-clamp-3 max-w-sm text-sm text-cream/70 md:text-base">
                  {m.tagline}
                </p>
              ) : null}
              <span className="mt-5 inline-block text-sm uppercase tracking-widest text-cream underline-offset-4 group-hover:underline">
                Explore →
              </span>
            </div>
          </Link>
        ))}
      </div>

      {moments.length > 1 ? (
        <div className="pointer-events-none absolute bottom-8 left-1/2 hidden -translate-x-1/2 gap-2 md:flex">
          {moments.map((m, i) => (
            <span
              key={m.handle}
              className={`moment-dot h-1.5 w-6 rounded-full bg-cream transition-opacity ${
                i === 0 ? 'opacity-100' : 'opacity-30'
              }`}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
