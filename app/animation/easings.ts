// Shared easing + timing tokens so motion feels consistent across the whole
// site. Treat these like design tokens: components reference names, never raw
// cubic-beziers, so a single tweak restyles the entire experience.
export const EASE = {
  expoOut: 'expo.out',
  expoInOut: 'expo.inOut',
  power4Out: 'power4.out',
  backOut: 'back.out(1.6)',
  // CSS-equivalent for non-GSAP transitions (Tailwind `ease-expo-out`).
  cssExpoOut: 'cubic-bezier(0.16, 1, 0.3, 1)',
} as const;

export const DURATION = {
  micro: 0.35,
  base: 0.8,
  reveal: 1.1,
  hero: 1.6,
} as const;

export const STAGGER = {
  tight: 0.04,
  base: 0.08,
  loose: 0.14,
} as const;
