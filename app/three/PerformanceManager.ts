/**
 * Centralized WebGL performance policy. The single most important file for
 * keeping a Three.js storefront at 60fps on a mid-range phone.
 *
 * Rules enforced:
 *  - Device pixel ratio is CLAMPED (default max 2). Retina phones report DPR 3+
 *    which quadruples fragment work for ~zero perceptual gain on small panels.
 *  - On low-end devices (few CPU cores / coarse pointer) we drop the cap to 1.5.
 *  - The render loop pauses when the canvas scrolls out of view or the tab is
 *    hidden — no GPU spend on pixels nobody can see (battery + thermals).
 */
export type PerfTier = 'high' | 'low';

export function detectTier(): PerfTier {
  if (typeof navigator === 'undefined') return 'high';
  const cores = navigator.hardwareConcurrency ?? 8;
  const mem = (navigator as any).deviceMemory ?? 8;
  const coarse =
    typeof window !== 'undefined' &&
    window.matchMedia('(pointer: coarse)').matches;
  if (cores <= 4 || mem <= 4 || coarse) return 'low';
  return 'high';
}

export function maxDpr(tier: PerfTier = detectTier()): number {
  return tier === 'low' ? 1.5 : 2;
}

/**
 * Pause `onFrame` whenever `element` leaves the viewport or the tab is hidden.
 * Returns a disposer. Pair with r3f's `frameloop="demand"` for full control.
 */
export function createVisibilityGate(
  element: HTMLElement,
  setActive: (active: boolean) => void,
): () => void {
  let inView = true;
  let visible = !document.hidden;

  const apply = () => setActive(inView && visible);

  const io = new IntersectionObserver(
    ([entry]) => {
      inView = entry.isIntersecting;
      apply();
    },
    {threshold: 0.01},
  );
  io.observe(element);

  const onVisibility = () => {
    visible = !document.hidden;
    apply();
  };
  document.addEventListener('visibilitychange', onVisibility);

  return () => {
    io.disconnect();
    document.removeEventListener('visibilitychange', onVisibility);
  };
}
