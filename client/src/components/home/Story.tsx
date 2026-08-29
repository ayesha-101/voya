"use client";

import Link from "next/link";
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import type { Product } from "@/lib/types";
import { formatPrice, productImages } from "@/lib/voya";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function Story({ uaeProducts = [] }: { uaeProducts?: Product[] }) {


  return (
    <section className="bg-blush-50 py-20 md:py-24">
      <div className="container-voya grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        {/* image — right in RTL, with offset gold frame */}
        <div className="relative order-1">
          {/* ghost gold frame */}
          <motion.div
            aria-hidden
            initial={{ opacity: 0, x: 0, y: 0 }}
            whileInView={{ opacity: 1, x: 16, y: -16 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 1.0, ease: EASE }}
            className="absolute inset-0 rounded-signature-lg border-2 border-gold"
          />
          <motion.div
            initial={{ clipPath: 'circle(0% at 50% 50%)' }}
            whileInView={{ clipPath: 'circle(120% at 50% 50%)' }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 1.1, ease: EASE }}
            className="overflow-hidden rounded-signature-lg shadow-card-hover"
          >
            <img
              src="/story-hands.jpg"
              alt="تغليف طلب فويا بورق حرير وردي وشريط ذهبي"
              loading="lazy"
              className="aspect-[4/3] w-full object-cover"
            />
          </motion.div>
        </div>

        {/* text */}
        <div className="order-2 text-center lg:text-right">
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="font-ruqaa text-[26px] text-gold md:text-[34px]"
          >
            بكل حب
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6, delay: 0.15, ease: EASE }}
            className="mt-2 font-heading text-[26px] font-semibold text-plum md:text-[38px]"
          >
            قصة فويا
          </motion.h2>
          <motion.img
            src="/ornament-thread.svg"
            alt=""
            aria-hidden
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="mx-auto mt-3 h-5 w-40 lg:mx-0"
          />
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6, delay: 0.3, ease: EASE }}
            className="mx-auto mt-5 max-w-lg font-body text-[15px] leading-[1.9] text-ink-soft md:text-[17px] lg:mx-0"
          >
            بدأنا من شغف بسيط: أن تجد كل امرأة إماراتية منتجات تستحق ثقتها… نختار، نجرّب، ثم نقدم لكِ الأفضل فقط.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.6, delay: 0.45, ease: EASE }}
          >
            <Link href="/about"
              className="group mt-6 inline-flex items-center gap-2 rounded-full border border-mauve/50 px-7 py-3.5 text-sm font-bold text-mauve transition-all hover:-translate-y-0.5 hover:border-mauve hover:bg-mauve/5"
            >
              اقرئي قصتنا كاملة
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" strokeWidth={1.5} />
            </Link>
          </motion.div>

          {/* Made in UAE strip */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.7, delay: 0.55, ease: EASE }}
            className="mt-10 rounded-[24px] bg-gold-soft p-5 text-right"
          >
            <p className="mb-3 flex items-center gap-2 text-sm font-bold text-[#8A6A2F]">صنع في الإمارات 🇦🇪</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {uaeProducts.map((p) => (
                <Link
                  key={p.slug}
                  href={`/products/${p.slug}`}
                  className="group flex items-center gap-3 rounded-2xl bg-white/70 p-2.5 transition-all hover:-translate-y-0.5 hover:bg-white hover:shadow-card"
                >
                  <img src={productImages(p)[0]} alt={p.name} className="h-14 w-14 rounded-xl bg-cream object-cover" loading="lazy" />
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-bold text-plum group-hover:text-rose-deep">{p.name}</p>
                    <p className="tnum mt-0.5 font-heading text-sm font-bold text-rose-deep">{formatPrice(p.price)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
