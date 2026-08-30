"use client";

import { memo, useMemo, useRef } from 'react';
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/** Perpetual falling petals — isolated + memoized so parent renders never restart the loop */
const PetalDrift = memo(function PetalDrift({ count = 5 }: { count?: number }) {
  const reduced = useReducedMotion();
  const petals = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        right: (i * 137) % 100,
        size: 14 + ((i * 7) % 15),
        duration: 9 + ((i * 1.7) % 5),
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

const TITLE_WORDS = ['قصة', 'فويا'];

export default function AboutHero() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  // gentle inner parallax: the image drifts against the scroll
  const imgY = useTransform(scrollYProgress, [0, 1], ['0%', reduced ? '0%' : '12%']);

  return (
    <section ref={ref} className="bg-silk relative overflow-hidden">
      <PetalDrift count={5} />

      <div className="container-voya relative py-14 text-center md:py-20">
        {/* breadcrumb */}
        <motion.nav
          aria-label="مسار التنقل"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="flex items-center justify-center gap-1.5 text-[13px] font-medium text-ink-soft"
        >
          <Link href="/" className="transition-colors hover:text-rose-deep">
            الرئيسية
          </Link>
          <ChevronLeft className="h-3.5 w-3.5 opacity-60" strokeWidth={1.5} />
          <span className="text-rose-deep">من نحن</span>
        </motion.nav>

        {/* decorative Ruqaa word */}
        <motion.p
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.15 }}
          className="font-ruqaa mt-6 text-[28px] text-gold md:text-[44px]"
        >
          بكل حب…
        </motion.p>

        <h1 className="mt-2 text-[34px] font-bold leading-[1.3] text-plum md:text-[56px]">
          {TITLE_WORDS.map((w, i) => (
            <span key={i} className="inline-block overflow-hidden pb-1 align-bottom">
              <motion.span
                className="inline-block px-1"
                initial={{ y: reduced ? 0 : 36, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: EASE, delay: 0.35 + i * 0.09 }}
              >
                {w}
              </motion.span>
            </span>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE, delay: 0.6 }}
          className="font-body mx-auto mt-4 max-w-xl text-[15px] leading-[1.9] text-ink-soft md:text-[17px]"
        >
          من قلب الإمارات، لكل امرأة تستحق الأفضل.
        </motion.p>

        {/* wide boutique image — circular mask reveal + offset gold frame */}
        <div className="relative mx-auto mt-12 max-w-5xl">
          <div
            className="pointer-events-none absolute -inset-3 translate-x-3 translate-y-3 rounded-signature-lg border-2 border-gold/50"
            aria-hidden="true"
          />
          <motion.div
            initial={reduced ? { opacity: 0 } : { clipPath: 'circle(0% at 50% 50%)' }}
            animate={reduced ? { opacity: 1 } : { clipPath: 'circle(75% at 50% 50%)' }}
            transition={{ duration: 1.2, ease: EASE, delay: 0.5 }}
            className="relative aspect-video overflow-hidden rounded-signature-lg bg-blush-100 shadow-card-hover"
          >
            <motion.img
              src="/about-hero.jpg"
              alt="ركن بوتيك فويا — رفوف خشبية بمنتجات وردية مرتبة ومرآة بإطار ذهبي"
              style={{ y: imgY }}
              className="h-[115%] w-full object-cover"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
