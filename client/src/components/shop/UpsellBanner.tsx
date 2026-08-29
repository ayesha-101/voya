"use client";

import { motion } from 'framer-motion';
import Link from "next/link";
import { Sparkles } from 'lucide-react';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function UpsellBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.7, ease: EASE }}
      className="relative col-span-2 flex flex-col justify-center gap-3 overflow-hidden rounded-signature bg-plum p-6 text-blush-50 md:p-8"
    >
      {/* Curly Silk campaign photo */}
      <img
        src="/promo-curlysilk.jpg"
        alt=""
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-40"
      />
      {/* silky plum veil */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-l from-plum/90 via-plum/70 to-plum/30" />
      {/* golden shimmer sweep */}
      <motion.div
        aria-hidden
        animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
        className="shimmer-gold pointer-events-none absolute inset-0 opacity-40"
      />
      {/* soft petals */}
      <img
        src="/petal.svg"
        alt=""
        aria-hidden
        className="pointer-events-none absolute -left-8 -top-8 w-32 rotate-45 opacity-25"
      />

      <div className="relative flex items-center gap-2 text-gold">
        <Sparkles className="h-5 w-5" strokeWidth={1.5} />
        <span className="text-xs font-bold tracking-wider">عرض حصري — خصم 38%</span>
      </div>
      <h3 className="relative font-heading text-xl font-bold leading-snug md:text-2xl">
        مجموعة كيرلي سيلك… دلال يستحقه شعركِ الكيرلي
      </h3>
      <p className="relative text-sm text-blush-50/85">
        روتين الحرير الكامل: شامبو + بلسم + كريم تصفيف — 185 د.إ بدل 300 د.إ.
      </p>
      <div className="relative pt-1">
        <Link href="/products/curlysilk-set"
          className="inline-flex h-9 items-center rounded-full border border-gold px-5 text-sm font-bold text-gold transition-colors hover:bg-gold hover:text-plum"
        >
          اكتشفي المجموعة
        </Link>
      </div>
    </motion.div>
  );
}
