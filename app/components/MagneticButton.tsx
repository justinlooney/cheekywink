import {useRef, type ReactNode} from 'react';
import {gsap, registerGsap} from '~/animation/gsap';
import {useGsapContext} from '~/animation/useGsapContext';
import {useReducedMotion} from '~/animation/useReducedMotion';

/**
 * Award-site staple: a button whose label is "pulled" toward the cursor with a
 * quickTo (GSAP's allocation-free per-pointermove setter). Disabled entirely
 * under reduced motion and on coarse pointers (no cursor to chase).
 */
export function MagneticButton({
  children,
  className = '',
  as: Tag = 'button',
  ...rest
}: {
  children: ReactNode;
  className?: string;
  as?: 'button' | 'a';
  [key: string]: unknown;
}) {
  const scope = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useGsapContext(
    scope,
    () => {
      registerGsap();
      const el = scope.current!;
      if (reduced || window.matchMedia('(pointer: coarse)').matches) return;

      const label = el.querySelector('.magnetic-label') as HTMLElement;
      const xTo = gsap.quickTo(el, 'x', {duration: 0.4, ease: 'expo.out'});
      const yTo = gsap.quickTo(el, 'y', {duration: 0.4, ease: 'expo.out'});
      const lxTo = gsap.quickTo(label, 'x', {duration: 0.5, ease: 'expo.out'});
      const lyTo = gsap.quickTo(label, 'y', {duration: 0.5, ease: 'expo.out'});

      const onMove = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        xTo(dx * 0.3);
        yTo(dy * 0.3);
        lxTo(dx * 0.15);
        lyTo(dy * 0.15);
      };
      const onLeave = () => {
        xTo(0); yTo(0); lxTo(0); lyTo(0);
      };

      el.addEventListener('pointermove', onMove);
      el.addEventListener('pointerleave', onLeave);
      return () => {
        el.removeEventListener('pointermove', onMove);
        el.removeEventListener('pointerleave', onLeave);
      };
    },
    [reduced],
  );

  return (
    <div ref={scope} className="inline-block will-change-transform">
      <Tag className={className} {...rest}>
        <span className="magnetic-label inline-block will-change-transform">
          {children}
        </span>
      </Tag>
    </div>
  );
}
