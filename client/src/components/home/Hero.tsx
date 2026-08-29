"use client";

import { memo, useMemo } from 'react';
import Link from "next/link";
import { motion, useReducedMotion } from 'framer-motion';
import { Star } from 'lucide-react';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/** Perpetual falling petals — isolated + memoized so nothing resets the loop */
const PetalDrift = memo(function PetalDrift({ count = 7 }: { count?: number }) {
  const reduced = useReducedMotion();
  const petals = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        right: (i * 137) % 100, // % position (RTL-friendly)
        size: 14 + ((i * 7) % 15), // 14–28px
        duration: 9 + ((i * 1.7) % 5), // 9–14s
        delay: -((i * 2.3) % 14),
        opacity: 0.4 + ((i * 0.1) % 0.3),
        sway: 22 + ((i * 11) % 20),
      })),
    [count],
  );
  if (reduced) return null;
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {petals.map((p) => (
        <motion.img
          key={p.id}
          src="/petal.svg"
          alt=""
          className="absolute -top-10"
          style={{ right: `${p.right}%`, width: p.size, opacity: p.opacity }}
          animate={{
            y: ['-10vh', '110vh'],
            x: [0, p.sway, -p.sway * 0.6, p.sway * 0.4, 0],
            rotate: [0, 120, 260],
          }}
          transition={{
            y: { duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'linear' },
            x: { duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'easeInOut' },
            rotate: { duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'linear' },
          }}
        />
      ))}
    </div>
  );
});

function TitleWord({ children, delay, gradient }: { children: string; delay: number; gradient?: boolean }) {
  return (
    <span className="inline-block overflow-hidden pb-1 align-bottom">
      <motion.span
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay, ease: EASE }}
        className={gradient ? 'text-gradient-rose inline-block' : 'inline-block'}
      >
        {children}
      </motion.span>
    </span>
  );
}

export default function Hero() {
  const reduced = useReducedMotion();
  return (
    <section className="bg-silk relative overflow-hidden">
      <PetalDrift count={7} />

      <div className="container-voya relative grid min-h-[calc(100vh-118px)] items-center gap-10 py-14 md:py-20 lg:min-h-[680px] lg:grid-cols-[45%_55%] lg:gap-6">
        {/* text — right side in RTL */}
        <div className="relative z-10 text-center lg:text-right">
          {/* decorative word with draw/fade */}
          <motion.p
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: EASE }}
            className="font-ruqaa text-[28px] text-gold md:text-[44px]"
          >
            دلّلي نفسكِ…
          </motion.p>

          <h1 className="mt-3 font-heading text-[38px] font-bold leading-[1.25] text-plum md:text-[68px]">
            <TitleWord delay={0.15}>جمالكِ</TitleWord>{' '}
            <TitleWord delay={0.27}>يبدأ</TitleWord>{' '}
            <TitleWord delay={0.39} gradient>
              بلمسة
            </TitleWord>{' '}
            <TitleWord delay={0.51} gradient>
              وردية
            </TitleWord>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.75, ease: EASE }}
            className="mx-auto mt-5 max-w-md font-body text-[15px] leading-[1.9] text-ink-soft md:text-[17px] lg:mx-0"
          >
            منتجات عناية وتجميل أصلية نختارها بعناية ونجربها بأنفسنا — من شعركِ إلى بشرتكِ، كل ما تحتاجينه في مكان واحد.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 120, damping: 14, delay: 0.95 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start"
          >
            <Link href="/products"
              className="relative overflow-hidden rounded-full bg-gradient-rose px-9 py-4 text-[15px] font-bold text-white shadow-card-hover transition-transform duration-300 hover:-translate-y-1"
            >
              <span className="shimmer-gold animate-shimmer pointer-events-none absolute inset-0" aria-hidden />
              <span className="relative">تسوّقي الآن</span>
            </Link>
            <a
              href="#categories"
              className="rounded-full border border-mauve/50 px-9 py-4 text-[15px] font-bold text-mauve transition-all duration-300 hover:-translate-y-1 hover:border-mauve hover:bg-mauve/5"
            >
              اكتشفي الفئات
            </a>
          </motion.div>

          {/* trust strip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.15 }}
            className="mt-7 flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 text-[13px] font-medium text-ink-soft lg:justify-start"
          >
            <span className="flex items-center gap-1 text-gold">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-3.5 w-3.5 fill-current" strokeWidth={1.5} />
              ))}
            </span>
            <span className="tnum font-semibold text-plum">+5000 عميلة سعيدة</span>
            <span className="text-gold">·</span>
            <span>توصيل 1–3 أيام</span>
            <span className="text-gold">·</span>
            <span>دفع عند الاستلام</span>
          </motion.div>
        </div>

        {/* image — left side in RTL */}
        <motion.div
          initial={{ x: -80, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 1, ease: EASE, delay: 0.3 }}
          className="relative z-10 mx-auto w-full max-w-[520px]"
        >
          {/* breathing blush halo */}
          <motion.div
            aria-hidden
            className="absolute left-1/2 top-1/2 -z-10 h-[75%] w-[110%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blush-200"
            animate={reduced ? undefined : { scale: [1, 1.04, 1] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            animate={reduced ? undefined : { y: [-12, 12, -12] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className="overflow-hidden rounded-signature-lg shadow-[0_24px_72px_rgba(150,97,122,0.25)]"
          >
            <img src="/hero-main.png" alt="تشكيلة فويا للعناية بالشعر الكيرلي" className="aspect-[8/9] w-full object-cover" />
          </motion.div>
        </motion.div>
      </div>

      {/* silk wave divider */}
      <img src="/wave-divider.svg" alt="" aria-hidden className="pointer-events-none absolute bottom-0 right-0 w-full" />
    </section>
  );
}
