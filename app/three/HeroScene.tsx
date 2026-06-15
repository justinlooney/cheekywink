import {Canvas, useFrame} from '@react-three/fiber';
import {Suspense, useEffect, useRef, useState} from 'react';
import {useNavigate} from 'react-router';
import {Environment, Lightformer, Sparkles} from '@react-three/drei';
import {HeroObject, type HeroItem} from './HeroObject';
import {detectTier, maxDpr, createVisibilityGate} from './PerformanceManager';
import {useReducedMotion} from '~/animation/useReducedMotion';

/**
 * Camera parallax rig: glides the camera a touch toward the pointer and keeps
 * it aimed at the carousel — premium tilt without moving the cards themselves.
 */
function Rig() {
  useFrame((state) => {
    const x = state.pointer.x * 0.5;
    const y = state.pointer.y * 0.35;
    state.camera.position.x += (x - state.camera.position.x) * 0.04;
    state.camera.position.y += (y - state.camera.position.y) * 0.04;
    state.camera.lookAt(0, 0, 0);
  });
  return null;
}

/**
 * The hero <Canvas>. Client-only (lazy-imported by the route). `useNavigate` is
 * called HERE (DOM/Router context) and passed into the Canvas as a callback —
 * R3F's reconciler doesn't share React context, so hooks can't run inside it.
 */
export function HeroScene({items = []}: {items?: HeroItem[]}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(true);
  const [mounted, setMounted] = useState(false);
  const reduced = useReducedMotion();
  const navigate = useNavigate();
  const tier = typeof window !== 'undefined' ? detectTier() : 'high';

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (!wrapRef.current || reduced) return;
    return createVisibilityGate(wrapRef.current, setActive);
  }, [reduced]);

  const onSelect = (handle: string) => navigate(`/products/${handle}`);

  return (
    <div
      ref={wrapRef}
      className="absolute inset-0 z-0"
      style={{
        background:
          'radial-gradient(120% 90% at 50% 30%, #2a1a20 0%, #140f12 45%, #050304 100%)',
      }}
      aria-hidden="true"
    >
      {mounted && !reduced ? (
        <Canvas
          frameloop={active ? 'always' : 'demand'}
          dpr={[1, maxDpr(tier)]}
          gl={{
            antialias: tier === 'high',
            powerPreference: 'high-performance',
            alpha: true,
          }}
          camera={{position: [0, 0, 5.2], fov: 42}}
        >
          <ambientLight intensity={0.5} />
          <spotLight
            position={[3, 6, 4]}
            angle={0.5}
            penumbra={1}
            intensity={120}
            color="#fff1e0"
          />
          <pointLight position={[-4, -2, 2]} intensity={25} color="#e0607e" />

          <Suspense fallback={null}>
            <HeroObject items={items} onSelect={onSelect} />
            <Environment resolution={256}>
              <Lightformer intensity={3} color="#fff1e0" position={[0, 3, 3]} scale={[7, 3, 1]} />
              <Lightformer intensity={1.6} color="#f4d9d9" position={[-4, 1, 2]} scale={[3, 3, 1]} />
              <Lightformer intensity={2.2} color="#caa15a" position={[4, -1, 2]} scale={[3, 3, 1]} />
            </Environment>
          </Suspense>

          <Sparkles
            count={tier === 'low' ? 30 : 70}
            scale={[9, 7, 9]}
            size={1.5}
            speed={0.25}
            opacity={0.5}
            color="#caa15a"
          />
          <Rig />
        </Canvas>
      ) : null}
    </div>
  );
}
