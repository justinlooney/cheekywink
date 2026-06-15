import {useRef} from 'react';
import {gsap, ScrollTrigger} from '~/animation/gsap';
import {useGsapContext} from '~/animation/useGsapContext';

/**
 * A top-of-page scrubbed progress bar. Pure scaleX transform (GPU-composited,
 * never triggers layout). Demonstrates the `scrub: true` ScrollTrigger pattern.
 */
export function ScrollProgress() {
  const scope = useRef<HTMLDivElement>(null);

  useGsapContext(scope, () => {
    gsap.fromTo(
      '.progress-bar',
      {scaleX: 0},
      {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: document.documentElement,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.3,
          invalidateOnRefresh: true,
        },
      },
    );
    return () => ScrollTrigger.refresh();
  });

  return (
    <div ref={scope} className="fixed inset-x-0 top-0 z-50 h-[3px] bg-transparent">
      <div className="progress-bar h-full origin-left scale-x-0 bg-gradient-to-r from-rose to-gold" />
    </div>
  );
}
