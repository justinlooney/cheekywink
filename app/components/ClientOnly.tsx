import {useEffect, useState, type ReactNode} from 'react';

/**
 * Renders children only after hydration. Wrap any WebGL/GSAP-pinned surface that
 * must not run during SSR. Prevents hydration mismatches and keeps Three.js out
 * of the server render path.
 */
export function ClientOnly({
  children,
  fallback = null,
}: {
  children: () => ReactNode;
  fallback?: ReactNode;
}) {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return <>{hydrated ? children() : fallback}</>;
}
