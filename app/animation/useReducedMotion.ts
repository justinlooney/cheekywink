import {useEffect, useState} from 'react';

/**
 * SSR-safe `prefers-reduced-motion` hook. Defaults to `false` on the server so
 * the markup matches the most common client; we flip it after mount. Every
 * animation entry point should consult this and degrade to instant state.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return reduced;
}
