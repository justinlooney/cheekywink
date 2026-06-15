import {gsap} from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';

/**
 * Single GSAP registration site.
 *
 * Why a module-level guard: Remix can evaluate this module on the server (SSR)
 * where `window` is undefined and ScrollTrigger would throw. We only register
 * plugins in the browser, and only once, regardless of how many components
 * import from here.
 */
let registered = false;

export function registerGsap() {
  if (registered || typeof window === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);

  // Global defaults: snappy, expo-style ease that reads as "premium".
  gsap.defaults({ease: 'expo.out', duration: 1.1});

  // Respect the OS reduced-motion setting at the engine level. matchMedia
  // tears down every animation created inside the `(prefers-reduced-motion)`
  // context automatically when the query flips.
  ScrollTrigger.config({ignoreMobileResize: true});

  registered = true;
}

export {gsap, ScrollTrigger};
