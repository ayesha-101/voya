"use client";

import { useEffect, useState } from 'react';
import { animate, useMotionValue } from 'framer-motion';
import { formatPrice } from "@/lib/voya";
import { cn } from '@/lib/utils';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/** Price that quickly counts to the new value whenever it changes. */
export default function AnimatedPrice({ value, className }: { value: number; className?: string }) {
  const mv = useMotionValue(value);
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const controls = animate(mv, value, { duration: 0.5, ease: EASE });
    const unsub = mv.on('change', (v) => setDisplay(Math.round(v)));
    return () => {
      controls.stop();
      unsub();
    };
  }, [value, mv]);

  return <span className={cn('tnum', className)}>{formatPrice(display)}</span>;
}
