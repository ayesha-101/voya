"use client";

import { motion } from 'framer-motion';
import { memo, useMemo } from 'react';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

interface PetalSpec {
  angle: number;
  distance: number;
  size: number;
  delay: number;
  rotate: number;
}

/**
 * Signature petal-burst micro-celebration: petals fly outward from the center
 * of the relatively-positioned parent, once per `burstKey` change.
 * Honors prefers-reduced-motion (renders nothing).
 */
const PetalBurst = memo(function PetalBurst({ burstKey, count = 8 }: { burstKey: string | number; count?: number }) {
  const reduced = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  );

  const petals = useMemo<PetalSpec[]>(
    () =>
      Array.from({ length: count }, (_, i) => ({
        angle: (i / count) * Math.PI * 2 + Math.random() * 0.5,
        distance: 42 + Math.random() * 44,
        size: 13 + Math.random() * 13,
        delay: Math.random() * 0.12,
        rotate: Math.random() * 200 - 100,
      })),
    // regenerate only when a new burst fires
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [burstKey, count],
  );

  if (reduced) return null;

  return (
    <div key={burstKey} aria-hidden className="pointer-events-none absolute inset-0 z-10 overflow-visible">
      {petals.map((p, i) => (
        <motion.img
          key={i}
          src="/petal.svg"
          alt=""
          initial={{ x: 0, y: 0, opacity: 0.95, scale: 0.3, rotate: 0 }}
          animate={{
            x: Math.cos(p.angle) * p.distance,
            y: Math.sin(p.angle) * p.distance,
            opacity: 0,
            scale: 1,
            rotate: p.rotate,
          }}
          transition={{ duration: 0.9, ease: EASE, delay: p.delay }}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: p.size,
            height: p.size,
            marginTop: -p.size / 2,
            marginLeft: -p.size / 2,
          }}
        />
      ))}
    </div>
  );
});

export default PetalBurst;
