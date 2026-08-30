"use client";

import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

function CountUp({
  to,
  suffix = '',
  decimals = 0,
  duration = 1800,
}: {
  to: number;
  suffix?: string;
  decimals?: number;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3); // ease-out cubic
      setValue(to * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, duration]);

  const formatted =
    decimals > 0
      ? value.toFixed(decimals)
      : value >= 1000
        ? Math.round(value).toLocaleString('en-US')
        : String(Math.round(value));

  return (
    <span ref={ref} className="tnum" dir="ltr">
      {formatted}
      {suffix}
    </span>
  );
}

const STATS: { value: number; suffix: string; label: string; decimals?: number }[] = [
  { value: 5000, suffix: '+', label: 'عميلة سعيدة' },
  { value: 300, suffix: '+', label: 'منتج مختار بعناية' },
  { value: 4.9, suffix: '', label: 'تقييم عميلاتنا', decimals: 1 },
  { value: 7, suffix: '', label: 'إمارات نصل إليها' },
];

export default function StatsSection() {
  return (
    <section className="relative overflow-hidden bg-plum">
      {/* faint petals */}
      <img
        src="/petal.svg"
        alt=""
        aria-hidden
        className="pointer-events-none absolute -top-8 right-[12%] w-20 opacity-[0.07]"
      />
      <img
        src="/petal.svg"
        alt=""
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-[8%] w-28 -rotate-45 opacity-[0.05]"
      />

      <div className="container-voya py-20 md:py-24">
        <div className="grid grid-cols-2 gap-y-10 lg:grid-cols-4 lg:divide-x lg:divide-x-reverse lg:divide-blush-50/15">
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: EASE }}
              className="flex flex-col items-center gap-2 px-4 py-2 text-center"
            >
              <span className="font-heading text-4xl font-bold text-gold md:text-5xl">
                <CountUp to={s.value} suffix={s.suffix} decimals={s.decimals} />
              </span>
              {/* gold thread under each number */}
              <motion.span
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ duration: 0.8, delay: 0.4 + i * 0.1, ease: EASE }}
                className="h-[1.5px] w-10 origin-center rounded-full bg-gold/70"
                aria-hidden="true"
              />
              <span className="text-sm text-cream/85">{s.label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
