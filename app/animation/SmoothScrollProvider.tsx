import {createContext, useContext, useEffect, useRef, type ReactNode} from 'react';
import Lenis from 'lenis';
import {gsap, ScrollTrigger, registerGsap} from './gsap';
import {useReducedMotion} from './useReducedMotion';

/**
 * Smooth scroll, the *correct* way to marry it with GSAP ScrollTrigger:
 *  - Lenis owns the scroll position.
 *  - We drive Lenis from GSAP's ticker (one RAF loop, not two competing ones).
 *  - On every Lenis frame we call `ScrollTrigger.update()` so pinned/scrubbed
 *    timelines stay perfectly in sync with the smoothed position.
 *
 * Reduced motion → we skip Lenis entirely and let native scrolling through, so
 * accessibility and "I just want to read" users are never trapped in inertia.
 */
const LenisContext = createContext<Lenis | null>(null);
export const useLenis = () => useContext(LenisContext);

export function SmoothScrollProvider({children}: {children: ReactNode}) {
  const lenisRef = useRef<Lenis | null>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    registerGsap();
    if (reduced) return;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // expo-out
      smoothWheel: true,
      syncTouch: false, // native momentum on touch = better mobile feel + perf
    });
    lenisRef.current = lenis;

    lenis.on('scroll', ScrollTrigger.update);

    const onTick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(onTick);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [reduced]);

  return (
    <LenisContext.Provider value={lenisRef.current}>
      {children}
    </LenisContext.Provider>
  );
}
