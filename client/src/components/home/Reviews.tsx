"use client";

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Star } from 'lucide-react';
import SectionHeader from '@/components/home/SectionHeader';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const TESTIMONIALS = [
  {
    text: 'مجموعة كيرلي سيلك غيّرت شعري تمامًا، والتغليف كان كأنه هدية وصلتني من صديقة!',
    name: 'مريم',
    area: 'دبي',
  },
  {
    text: 'طلبت بالواتساب ووصلني الطلب ثاني يوم. تعامل راقٍ جدًا وردود سريعة.',
    name: 'العنود',
    area: 'أبوظبي',
  },
  {
    text: 'خلطة السدر أصلية ونتيجتها واضحة من أول أسبوعين. صارت جزءًا من روتيني الأسبوعي.',
    name: 'نورة',
    area: 'الشارقة',
  },
  {
    text: 'عطر فويا النسائي ثباته مذهل ورائحته فخمة — كل من حولي سألني عنه.',
    name: 'ريم',
    area: 'عجمان',
  },
  {
    text: 'سيروم البشرة المشرقة فعلًا يستحق اسمه، بشرتي صارت أنور خلال أسبوعين.',
    name: 'حصة',
    area: 'دبي',
  },
];

function Stars({ delayBase }: { delayBase: number }) {
  return (
    <span className="flex items-center gap-0.5 text-gold">
      {Array.from({ length: 5 }).map((_, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, scale: 0.4 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.35, delay: delayBase + i * 0.06, ease: EASE }}
        >
          <Star className="h-4 w-4 fill-current" strokeWidth={1.5} />
        </motion.span>
      ))}
    </span>
  );
}

function TestimonialCard({
  t,
  delay,
  rotate,
  rotating,
}: {
  t: (typeof TESTIMONIALS)[number];
  delay: number;
  rotate?: boolean;
  rotating?: boolean;
}) {
  return (
    <motion.figure
      initial={{ opacity: 0, y: 36, rotate: -2 }}
      whileInView={{ opacity: 1, y: 0, rotate: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.7, delay, ease: EASE }}
      className="relative flex h-full flex-col rounded-[28px] bg-white p-7 shadow-card"
    >
      <span className="font-heading absolute -top-1 right-6 text-[72px] leading-none text-rose/25" aria-hidden>
        ”
      </span>
      <div className="relative min-h-[96px]">
        <AnimatePresence mode="wait">
          <motion.blockquote
            key={rotating ? t.text : 'static'}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="font-body text-[15px] leading-[1.9] text-plum"
          >
            {t.text}
          </motion.blockquote>
        </AnimatePresence>
      </div>
      <figcaption className="mt-5 flex items-center justify-between border-t border-blush-100 pt-4">
        <div>
          <p className="text-sm font-bold text-plum">{t.name}</p>
          <p className="text-xs text-ink-soft">{t.area}</p>
        </div>
        <Stars delayBase={delay + 0.3} />
      </figcaption>
      {rotate && <span className="absolute left-5 top-5 h-2 w-2 rounded-full bg-gold" aria-hidden />}
    </motion.figure>
  );
}

export default function Reviews() {
  const [extraIdx, setExtraIdx] = useState(3);

  // middle card rotates through the extra testimonials every 6s
  useEffect(() => {
    const t = setInterval(() => setExtraIdx((i) => (i + 1) % TESTIMONIALS.length), 6000);
    return () => clearInterval(t);
  }, []);

  const middle = TESTIMONIALS[extraIdx];

  return (
    <section className="relative bg-blush-200 py-20 md:py-24">
      {/* top wave */}
      <svg viewBox="0 0 1440 60" preserveAspectRatio="none" className="absolute -top-[58px] right-0 h-[60px] w-full text-blush-200" aria-hidden>
        <path d="M0,32 C240,58 480,6 720,28 C960,50 1200,10 1440,34 L1440,60 L0,60 Z" fill="currentColor" />
      </svg>
      <div className="container-voya">
        <SectionHeader label="آراء عميلاتنا" title="كلماتهنّ تسعدنا 💗" />
        <div className="grid gap-6 max-md:auto-cols-[85%] max-md:grid-flow-col max-md:overflow-x-auto max-md:snap-x max-md:snap-mandatory max-md:pb-4 max-md:no-scrollbar md:grid-cols-3">
          <div className="max-md:snap-center">
            <TestimonialCard t={TESTIMONIALS[0]} delay={0} />
          </div>
          <div className="max-md:snap-center">
            <TestimonialCard t={middle} delay={0.15} rotate rotating />
          </div>
          <div className="max-md:snap-center">
            <TestimonialCard t={TESTIMONIALS[2]} delay={0.3} />
          </div>
        </div>
      </div>
    </section>
  );
}
