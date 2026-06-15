import {useRef, useState, type MutableRefObject} from 'react';
import {useFrame, useThree, type ThreeEvent} from '@react-three/fiber';
import {RoundedBox, useTexture} from '@react-three/drei';
import * as THREE from 'three';

export type HeroItem = {url: string; handle: string; title: string};

const CARD_W = 1.18;
const CARD_H = 1.5;
const RING_SPEED = 0.12; // ring orbit (slow)
const SPIN_SPEED = 0.18; // each card on its own axis (gentle)

/**
 * One product card: cream/gold frame (lit) with the product photo on BOTH faces
 * (unlit so it stays crisp). Spins on its own Y axis, scales up on hover, and is
 * clickable. Hovering also flips a shared pause flag so the whole scene freezes
 * for inspection.
 */
function Card({
  item,
  angle,
  radius,
  paused,
  onHover,
  onSelect,
}: {
  item: HeroItem;
  angle: number;
  radius: number;
  paused: MutableRefObject<number>;
  onHover: (hovering: boolean) => void;
  onSelect: (handle: string) => void;
}) {
  const spin = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const texture = useTexture(item.url);
  texture.colorSpace = THREE.SRGBColorSpace;

  const x = Math.sin(angle) * radius;
  const z = Math.cos(angle) * radius;

  useFrame((_, d) => {
    if (!spin.current) return;
    if (paused.current === 0) spin.current.rotation.y += d * SPIN_SPEED;
    const target = hovered ? 1.14 : 1;
    const s = spin.current.scale;
    s.x += (target - s.x) * 0.1;
    s.y += (target - s.y) * 0.1;
    s.z += (target - s.z) * 0.1;
  });

  const over = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setHovered(true);
    onHover(true);
    document.body.style.cursor = 'pointer';
  };
  const out = () => {
    setHovered(false);
    onHover(false);
    document.body.style.cursor = 'auto';
  };
  const click = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onSelect(item.handle);
  };

  return (
    <group position={[x, 0, z]}>
      <group
        ref={spin}
        rotation={[0, angle, 0]}
        onPointerOver={over}
        onPointerOut={out}
        onClick={click}
      >
        <RoundedBox args={[CARD_W, CARD_H, 0.06]} radius={0.05} smoothness={4}>
          <meshStandardMaterial color="#f7f2ec" roughness={0.5} metalness={0.1} />
        </RoundedBox>
        {/* front face */}
        <mesh position={[0, 0, 0.035]}>
          <planeGeometry args={[CARD_W - 0.14, CARD_H - 0.16]} />
          <meshBasicMaterial map={texture} toneMapped={false} />
        </mesh>
        {/* back face (flipped so it reads correctly from behind) */}
        <mesh position={[0, 0, -0.035]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[CARD_W - 0.14, CARD_H - 0.16]} />
          <meshBasicMaterial map={texture} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}

/**
 * The hero carousel: a ring of product cards. The ring auto-rotates and tilts
 * toward the pointer; each card spins on its own axis. Hovering ANY card pauses
 * the ring + every card spin (a shared hover counter keeps it paused while you
 * move between cards). Radius derives from card count for snug, even spacing.
 */
export function HeroObject({
  items,
  onSelect,
}: {
  items: HeroItem[];
  onSelect: (handle: string) => void;
}) {
  const ring = useRef<THREE.Group>(null);
  const pointer = useThree((s) => s.pointer);
  // Number of cards currently hovered; >0 ⇒ everything pauses.
  const hoverCount = useRef(0);
  const onHover = (hovering: boolean) => {
    hoverCount.current += hovering ? 1 : -1;
    if (hoverCount.current < 0) hoverCount.current = 0;
  };

  const cards = (items ?? []).slice(0, 8);
  if (!cards.length) return null;

  const count = cards.length;
  const gap = 0.4;
  const radius = Math.max(1.2, (count * (CARD_W + gap)) / (2 * Math.PI));

  useFrame((_, d) => {
    if (!ring.current) return;
    if (hoverCount.current === 0) ring.current.rotation.y += d * RING_SPEED;
    // Pointer tilt stays active even when paused (feels responsive).
    ring.current.rotation.x +=
      (-pointer.y * 0.2 - ring.current.rotation.x) * 0.04;
  });

  return (
    <group ref={ring}>
      {cards.map((item, i) => (
        <Card
          key={item.handle + i}
          item={item}
          angle={(i / count) * Math.PI * 2}
          radius={radius}
          paused={hoverCount}
          onHover={onHover}
          onSelect={onSelect}
        />
      ))}
    </group>
  );
}
