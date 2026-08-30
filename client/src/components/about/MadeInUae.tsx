"use client";

import Link from "next/link";
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles } from 'lucide-react';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const PICKS = [
  {
    id: 'sidr-mix',
    img: '/p-sidr-1.jpg',
    name: 'خلطة السدر الخاصة',
    note: 'أعشاب طبيعية',
    price: '100 د.إ',
  },
  {
    id: 'mashat-mix',
    img: '/p-mashat-1.jpg',
    name: 'خلطة المشاط الخاصة',
    note: 'أعشاب',
    price: '100 د.إ',
  },
];

export default function MadeInUae() {
  return (
    <section className="bg-silk relative overflow-hidden">
      <div className="container-voya grid items-center gap-12 py-24 md:py-32 lg:grid-cols-2 lg:gap-16">
        {/* text side (right in RTL) */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/50 bg-gold-soft px-4 py-1.5 text-xs font-bold text-plum">
              <Sparkles className="h-3.5 w-3.5 text-gold" strokeWidth={1.5} />
              صنع في الإمارات 🇦🇪
            </span>
            <h2 className="mt-4 text-[26px] font-semibold leading-[1.3] text-plum md:text-[38px]">
              من أرضنا… بأيدينا
            </h2>
            <img src="/ornament-thread.svg" alt="" aria-hidden className="mt-3 h-5 w-40" />
            <p className="font-body mt-5 max-w-lg text-[15px] leading-[1.9] text-ink-soft md:text-[17px]">
              نفخر بدعم المنتج المحلي. خلطاتنا الخاصة — السدر والمشاط — تُصنع بحب داخل الإمارات من
              أعشاب طبيعية مختارة، بوصفات عريقة تتوارثها الجدات وروح شبابية مبتكرة.
            </p>
            <div className="mt-8">
              <Link href="/products"
                className="bg-gradient-rose inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-[15px] font-bold text-white shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card-hover"
              >
                اكتشفيها في المتجر
                <ArrowLeft className="h-4 w-4" strokeWidth={2} />
              </Link>
            </div>
          </motion.div>
        </div>

        {/* mini product cards with gold frames */}
        <div className="grid grid-cols-2 gap-5 md:gap-8">
          {PICKS.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 40, rotate: i === 0 ? -3 : 3 }}
              whileInView={{ opacity: 1, y: 0, rotate: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.8, delay: i * 0.15, ease: EASE }}
              className={i === 1 ? 'mt-8' : ''}
            >
              <Link href={`/products/${p.id}`} className="group block">
                <div className="relative">
                  <motion.span
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.4 + i * 0.15 }}
                    className="pointer-events-none absolute -inset-2.5 translate-x-2 translate-y-2 rounded-signature border-[1.5px] border-gold/60 transition-transform duration-500 group-hover:translate-x-1 group-hover:translate-y-1"
                    aria-hidden="true"
                  />
                  <div className="relative aspect-[4/5] overflow-hidden rounded-signature bg-cream shadow-card transition-shadow duration-300 group-hover:shadow-card-hover">
                    <img
                      src={p.img}
                      alt={p.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <h3 className="text-base font-semibold text-plum md:text-lg">{p.name}</h3>
                  <p className="mt-1 text-xs text-mauve">{p.note}</p>
                  <p className="tnum mt-1 text-[15px] font-bold text-rose-deep">{p.price}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
