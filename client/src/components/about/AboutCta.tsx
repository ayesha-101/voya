"use client";

import { memo, useMemo } from 'react';
import Link from "next/link";
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
    </svg>
  );
}

/** Petals drifting over the CTA card — isolated + memoized */
const CtaPetals = memo(function CtaPetals() {
  const reduced = useReducedMotion();
  const petals = useMemo(
    () =>
      Array.from({ length: 6 }, (_, i) => ({
        id: i,
        right: (i * 149) % 100,
        size: 12 + ((i * 5) % 12),
        duration: 9 + ((i * 1.3) % 5),
        delay: -((i * 1.9) % 12),
        sway: 16 + ((i * 9) % 16),
      })),
    [],
  );
  if (reduced) return null;
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {petals.map((p) => (
        <motion.img
          key={p.id}
          src="/petal.svg"
          alt=""
          className="absolute -top-8 opacity-60"
          style={{ right: `${p.right}%`, width: p.size }}
          animate={{ y: ['-10%', '130%'], x: [0, p.sway, -p.sway * 0.6, 0], rotate: [0, 140, 280] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'linear' }}
        />
      ))}
    </div>
  );
});

export default function AboutCta() {
  return (
    <section className="container-voya py-24 md:py-32">
      <motion.div
        initial={{ opacity: 0, scaleX: 0.6 }}
        whileInView={{ opacity: 1, scaleX: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.8, ease: EASE }}
        className="bg-gradient-rose relative overflow-hidden rounded-[32px] px-6 py-16 text-center md:py-24"
      >
        <CtaPetals />
        <div className="relative">
          <motion.p
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.2 }}
            className="font-ruqaa text-[26px] text-gold-soft md:text-[38px]"
          >
            أهلًا بكِ
          </motion.p>
          <h2 className="mt-2 text-[28px] font-bold leading-[1.3] text-white md:text-[40px]">
            جاهزة لتجربة فويا؟
          </h2>
          <p className="font-body mx-auto mt-4 max-w-xl text-[15px] leading-[1.9] text-blush-50/90 md:text-[17px]">
            منتجات مختارة بعناية، جرّبناها بأنفسنا قبل أن تصل إليكِ.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.35, ease: EASE }}
            >
              <Link href="/products"
                aria-label="تسوّقي الآن"
                className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-[15px] font-bold text-rose-deep transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card-hover"
              >
                تسوّقي الآن
                <ArrowLeft className="h-4 w-4" strokeWidth={2} />
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.45, ease: EASE }}
            >
              <a
                href="https://wa.me/971553633977"
                target="_blank"
                rel="noreferrer"
                aria-label="اطلبي عبر واتساب"
                className="inline-flex items-center gap-2 rounded-full border-2 border-white/70 px-8 py-[14px] text-[15px] font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/10"
              >
                <WhatsAppIcon className="h-4 w-4" />
                اطلبي عبر واتساب
              </a>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
