"use client";

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Truck } from 'lucide-react';
import { FREE_SHIPPING_THRESHOLD, formatPrice } from "@/lib/voya";
import PetalBurst from '@/components/cart/PetalBurst';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/** Free-shipping progress toward 200 د.إ — rose→gold gradient fill. */
export default function FreeShippingProgress({ subtotal }: { subtotal: number }) {
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);
  const reached = remaining <= 0;

  // fire a short petal celebration the moment the threshold is crossed
  const [burst, setBurst] = useState(0);
  const wasReached = useRef(reached);
  useEffect(() => {
    if (reached && !wasReached.current) setBurst((b) => b + 1);
    wasReached.current = reached;
  }, [reached]);

  return (
    <div className="relative rounded-3xl border border-blush-200 bg-white p-5 shadow-card">
      {burst > 0 && <PetalBurst burstKey={burst} count={10} />}
      {reached ? (
        <p className="flex items-center gap-2 text-sm font-bold text-plum">
          <Sparkles className="h-5 w-5 text-gold" strokeWidth={1.5} />
          مبروك! شحنكِ مجاني ✨
        </p>
      ) : (
        <p className="flex items-center gap-2 text-sm text-plum">
          <Truck className="h-5 w-5 text-rose" strokeWidth={1.5} />
          تبقّى <span className="tnum font-bold text-rose-deep">{formatPrice(remaining)}</span> للشحن المجاني! 🌸
        </p>
      )}
      <div className="mt-3 flex items-center gap-3">
        <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-blush-200">
          <motion.div
            className="h-full rounded-full bg-[linear-gradient(90deg,#D67B93,#96617A_55%,#C6A15B)]"
            initial={false}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: EASE }}
          />
        </div>
        <span className="tnum text-xs font-bold text-mauve">{Math.round(progress)}%</span>
      </div>
    </div>
  );
}
