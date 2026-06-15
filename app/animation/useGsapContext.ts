import {useLayoutEffect, useRef, type RefObject} from 'react';
import {gsap, registerGsap} from './gsap';

/**
 * The workhorse hook. Wraps `gsap.context()` scoped to a container ref so:
 *  1. All selector strings resolve relative to the component (no global leaks).
 *  2. `ctx.revert()` on unmount kills tweens AND ScrollTriggers AND restores
 *     inline styles — the #1 source of memory leaks in React + GSAP apps.
 *
 * Usage:
 *   const scope = useRef<HTMLDivElement>(null);
 *   useGsapContext(scope, (ctx) => {
 *     gsap.from('.line', {yPercent: 100, stagger: 0.1});
 *   });
 *   return <div ref={scope}>...</div>;
 */
export function useGsapContext<T extends HTMLElement = HTMLElement>(
  scope: RefObject<T>,
  factory: (ctx: gsap.Context) => void,
  deps: unknown[] = [],
) {
  const factoryRef = useRef(factory);
  factoryRef.current = factory;

  useLayoutEffect(() => {
    registerGsap();
    if (!scope.current) return;
    const ctx = gsap.context((self) => factoryRef.current(self), scope);
    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
