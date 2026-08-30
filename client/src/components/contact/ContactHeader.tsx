"use client";

import { memo, useMemo } from 'react';
import Link from "next/link";
import { motion, useReducedMotion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/** Perpetual falling petals — isolated + memoized so parent renders never restart the loop */
const PetalDrift = memo(function PetalDrift({ count = 4 }: { count?: number }) {
  const reduced = useReducedMotion();
  const petals = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        right: 8 + ((i * 173) % 84),
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

const TITLE_WORDS = ['تواصلي', 'معنا'];

export default function ContactHeader() {
  const reduced = useReducedMotion();

  return (
    <section className="bg-silk relative overflow-hidden">
      <PetalDrift count={4} />

      <div className="container-voya relative flex min-h-[280px] flex-col justify-center py-14 md:py-16">
        <motion.nav
          aria-label="مسار التنقل"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE }}
          className="flex items-center gap-1.5 text-[13px] font-medium text-ink-soft"
        >
          <Link href="/" className="transition-colors hover:text-rose-deep">
            الرئيسية
          </Link>
          <ChevronLeft className="h-3.5 w-3.5 opacity-60" strokeWidth={1.5} />
          <span className="text-rose-deep">تواصل معنا</span>
        </motion.nav>

        {/* decorative Ruqaa word */}
        <motion.p
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}
          className="font-ruqaa mt-5 text-[26px] text-gold md:text-[40px]"
        >
          يسعدنا سماعكِ
        </motion.p>

        <h1 className="mt-1 text-[34px] font-bold leading-[1.3] text-plum md:text-[56px]">
          {TITLE_WORDS.map((w, i) => (
            <span key={i} className="inline-block overflow-hidden pb-1 align-bottom">
              <motion.span
                className="inline-block px-1"
                initial={{ y: reduced ? 0 : 36, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.7, ease: EASE, delay: 0.3 + i * 0.07 }}
              >
                {w}
              </motion.span>
            </span>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.5 }}
          className="font-body mt-3 max-w-xl text-[15px] leading-[1.9] text-ink-soft md:text-[17px]"
        >
          سؤال؟ اقتراح؟ أو فقط تحبين تقولين مرحبا؟ فريقنا جاهز لخدمتكِ كل يوم من 9 صباحًا حتى 10 مساءً.
        </motion.p>
      </div>
    </section>
  );
}
