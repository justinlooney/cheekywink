import {Canvas} from '@react-three/fiber';
import {Stage, OrbitControls, useGLTF, Bounds} from '@react-three/drei';
import {Suspense, useEffect, useState} from 'react';
import {maxDpr, detectTier} from './PerformanceManager';
import {useReducedMotion} from '~/animation/useReducedMotion';

/**
 * Interactive 3D product viewer for the PDP. Loads a Shopify Model3D (glb) via
 * drei's `useGLTF` (which uses a shared DRACO/Meshopt-capable loader). `Bounds`
 * auto-frames the model so any product, any scale, lands centered.
 *
 * Falls back to nothing (the PDP shows the 2D gallery) when reduced motion is on
 * or there's no model URL — progressive enhancement, never a hard dependency.
 */
function Model({url}: {url: string}) {
  const {scene} = useGLTF(url);
  return <primitive object={scene} />;
}

export function ProductReveal({modelUrl}: {modelUrl?: string}) {
  const reduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!modelUrl || reduced || !mounted) return null;
  const tier = detectTier();

  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-cream">
      <Canvas
        dpr={[1, maxDpr(tier)]}
        gl={{antialias: true, alpha: true, powerPreference: 'high-performance'}}
        camera={{position: [0, 0, 4], fov: 40}}
      >
        <Suspense fallback={null}>
          <Stage environment="city" intensity={0.5} adjustCamera={false}>
            <Bounds fit clip observe margin={1.2}>
              <Model url={modelUrl} />
            </Bounds>
          </Stage>
        </Suspense>
        <OrbitControls
          makeDefault
          enablePan={false}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 1.7}
          autoRotate
          autoRotateSpeed={0.6}
        />
      </Canvas>
      <span className="pointer-events-none absolute bottom-3 left-0 right-0 text-center text-xs uppercase tracking-widest text-ink/50">
        Drag to explore
      </span>
    </div>
  );
}

// Preload helper so the PDP can warm the model during route transition.
ProductReveal.preload = (url: string) => useGLTF.preload(url);
