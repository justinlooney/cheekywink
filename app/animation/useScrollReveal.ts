import {useRef, type RefObject} from 'react';
import {gsap} from './gsap';
import {useGsapContext} from './useGsapContext';
import {useReducedMotion} from './useReducedMotion';
import {DURATION, STAGGER} from './easings';

type RevealOptions = {
  /** Selector (within scope) of items to stagger in. Defaults to direct children. */
  selector?: string;
  y?: number;
  stagger?: number;
  start?: string;
  once?: boolean;
};

/**
 * Declarative scroll-reveal. Returns a ref to spread onto a container; every
 * matching child fades/translates in as it enters the viewport. Honors reduced
 * motion by snapping elements to their final state with zero animation.
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
  opts: RevealOptions = {},
): RefObject<T> {
  const scope = useRef<T>(null);
  const reduced = useReducedMotion();
  const {
    selector = ':scope > *',
    y = 48,
    stagger = STAGGER.base,
    start = 'top 85%',
    once = true,
  } = opts;

  useGsapContext(
    scope,
    () => {
      const targets = gsap.utils.toArray<HTMLElement>(selector);
      if (!targets.length) return;

      if (reduced) {
        gsap.set(targets, {opacity: 1, y: 0});
        return;
      }

      gsap.from(targets, {
        opacity: 0,
        y,
        duration: DURATION.reveal,
        stagger,
        scrollTrigger: {
          trigger: scope.current!,
          start,
          toggleActions: once ? 'play none none none' : 'play reverse play reverse',
        },
      });
    },
    [reduced, selector, y, stagger, start, once],
  );

  return scope;
}
