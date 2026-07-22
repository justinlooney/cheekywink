import {createContext, useContext, useEffect, useRef, useState} from 'react';
import {useNavigate, useNavigation} from 'react-router';
import {gsap} from './gsap';
import {useReducedMotion} from './useReducedMotion';

type TransitionState = {
  src: string;
  rect: {top: number; left: number; width: number; height: number};
};

const TransitionContext = createContext<{
  start: (cardEl: HTMLElement, to: string) => void;
} | null>(null);

// Hard ceiling on the "hold" phase (overlay covering the screen while the
// destination page loads). The natural path reveals as soon as the route's
// data finishes loading, which is usually fast thanks to `prefetch="intent"`
// — this timer only kicks in on a slow network hop, so the pause never feels
// indefinite.
const MAX_HOLD_MS = 1200;

export function useProductTransition() {
  const ctx = useContext(TransitionContext);
  if (!ctx) {
    throw new Error(
      'useProductTransition must be used within ProductTransitionProvider',
    );
  }
  return ctx;
}

/**
 * Cinematic product-card → PDP transition. The clicked photo zooms to fill
 * the screen (masking the route swap), then cross-fades away once the new
 * page has actually mounted (or `MAX_HOLD_MS` elapses, whichever is first),
 * revealing the real PDP underneath.
 *
 * Deliberately NOT a pixel-exact shared-element FLIP to the PDP's hero image
 * — that image's size/position varies by viewport and layout, so matching it
 * precisely on arrival would be fragile. "Zoom to full-bleed, hold, reveal"
 * reads just as cinematic and needs zero knowledge of the destination layout.
 *
 * Mounted once at the app root so it survives the route swap it's masking.
 */
export function ProductTransitionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const navigate = useNavigate();
  const navigation = useNavigation();
  const reduced = useReducedMotion();
  const overlayRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<TransitionState | null>(null);
  const pendingTarget = useRef<string | null>(null);
  const hasSeenLoading = useRef(false);
  const fallbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const reveal = () => {
    if (!overlayRef.current) return;
    if (fallbackTimer.current) {
      clearTimeout(fallbackTimer.current);
      fallbackTimer.current = null;
    }
    pendingTarget.current = null;
    hasSeenLoading.current = false;
    gsap.to(overlayRef.current, {
      autoAlpha: 0,
      duration: 0.45,
      ease: 'power2.out',
      onComplete: () => setState(null),
    });
  };

  const start = (cardEl: HTMLElement, to: string) => {
    if (reduced) {
      navigate(to);
      return;
    }
    const img = cardEl.querySelector('img');
    if (!img) {
      navigate(to);
      return;
    }
    const rect = img.getBoundingClientRect();
    pendingTarget.current = to;
    hasSeenLoading.current = false;
    setState({
      src: img.currentSrc || img.src,
      rect: {top: rect.top, left: rect.left, width: rect.width, height: rect.height},
    });
  };

  // Cover animation: grow the clicked photo to fill the viewport, then
  // navigate once it's covering the screen (masking the route swap). Arms a
  // capped fallback so the hold never outlasts MAX_HOLD_MS even if the
  // destination's data is slow to arrive.
  useEffect(() => {
    if (!state || !overlayRef.current) return;
    const el = overlayRef.current;
    gsap.set(el, {
      autoAlpha: 1,
      top: state.rect.top,
      left: state.rect.left,
      width: state.rect.width,
      height: state.rect.height,
    });
    gsap.to(el, {
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      duration: 0.65,
      ease: 'power3.inOut',
      onComplete: () => {
        if (pendingTarget.current) navigate(pendingTarget.current);
        fallbackTimer.current = setTimeout(reveal, MAX_HOLD_MS);
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  // Fast path: reveal as soon as a genuine loading → idle cycle completes
  // for THIS navigation (not just any idle state, which would fire
  // immediately/prematurely). Usually wins the race against MAX_HOLD_MS.
  useEffect(() => {
    if (!state || !pendingTarget.current || !overlayRef.current) return;

    if (navigation.state === 'loading') {
      hasSeenLoading.current = true;
      return;
    }

    if (navigation.state === 'idle' && hasSeenLoading.current) {
      reveal();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigation.state]);

  // Clean up a pending fallback timer if the component unmounts mid-hold.
  useEffect(() => {
    return () => {
      if (fallbackTimer.current) clearTimeout(fallbackTimer.current);
    };
  }, []);

  return (
    <TransitionContext.Provider value={{start}}>
      {children}
      <div
        ref={overlayRef}
        aria-hidden="true"
        className="pointer-events-none invisible fixed z-[100] overflow-hidden bg-ink"
      >
        {state ? (
          <img src={state.src} alt="" className="h-full w-full object-cover" />
        ) : null}
      </div>
    </TransitionContext.Provider>
  );
}
