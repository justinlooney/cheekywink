import {useRef, type RefObject} from 'react';
import {gsap} from './gsap';
import {useGsapContext} from './useGsapContext';
import {useReducedMotion} from './useReducedMotion';
import {DURATION, STAGGER} from './easings';

/**
 * Word-by-word headline reveal WITHOUT the paid SplitText plugin.
 *
 * We wrap each word in a span + an overflow-hidden mask at runtime, then sweep
 * the words up from below their mask. Works on any text node, is fully
 * reversible (we restore original innerHTML on cleanup via gsap.context), and
 * keeps the original text in the DOM for SEO/screen-readers until JS upgrades it.
 */
export function useTextReveal<T extends HTMLElement = HTMLHeadingElement>(): RefObject<T> {
  const ref = useRef<T>(null);
  const reduced = useReducedMotion();

  useGsapContext(
    ref,
    () => {
      const el = ref.current!;
      const original = el.innerHTML;

      if (reduced) return; // leave plain text, no animation

      const words = el.textContent?.trim().split(/\s+/) ?? [];
      el.setAttribute('aria-label', el.textContent ?? '');
      el.innerHTML = words
        .map(
          (w) =>
            `<span class="inline-block overflow-hidden align-bottom" aria-hidden="true"><span class="reveal-word inline-block will-change-transform">${w}&nbsp;</span></span>`,
        )
        .join('');

      gsap.from(el.querySelectorAll('.reveal-word'), {
        yPercent: 120,
        duration: DURATION.hero,
        stagger: STAGGER.base,
        scrollTrigger: {trigger: el, start: 'top 90%'},
      });

      // Restore source markup when the component unmounts.
      return () => {
        el.innerHTML = original;
      };
    },
    [reduced],
  );

  return ref;
}
