"use client";

import { motion } from 'framer-motion';
import { Flower2, Heart, ShieldCheck, Flag } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const VALUES: { icon: LucideIcon; title: string; text: string }[] = [
  {
    icon: Heart,
    title: 'الصدق أولًا',
    text: 'نبيع فقط ما نستخدمه بأنفسنا — إن لم يعجبنا، لن يصل إليكِ أبدًا.',
  },
  {
    icon: Flower2,
    title: 'الأنوثة احتفاء',
    text: 'كل طلب يُغلَّف كهدية، لأنكِ تستحقين أن يكون كل وصول مناسبة.',
  },
  {
    icon: ShieldCheck,
    title: 'الأصالة مضمونة',
    text: 'منتجات أصلية 100% نختارها بعناية ونجربها بأنفسنا قبل أن نقدمها لكِ.',
  },
  {
    icon: Flag,
    title: 'فخر محلي',
    text: 'ندعم الصناعة الإماراتية — خلطاتنا الخاصة كالسدر والمشاط تُصنع بحب داخل الإمارات.',
  },
];

export default function ValuesCards() {
  return (
    <section className="bg-blush-100">
      <div className="container-voya py-24 md:py-32">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="mb-10 md:mb-14"
        >
          <span className="text-xs font-bold tracking-[0.15em] text-mauve">قيمنا</span>
          <h2 className="mt-2 text-[26px] font-semibold leading-[1.3] text-plum md:text-[38px]">
            ما الذي يجعل فويا… فويا؟ 🌸
          </h2>
          <img src="/ornament-thread.svg" alt="" aria-hidden className="mt-3 h-5 w-40" />
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2">
          {VALUES.map((v, i) => (
            <motion.div
              key={v.title}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ type: 'spring', stiffness: 160, damping: 18, delay: i * 0.12 }}
              whileHover={{ y: -6, rotate: 1 }}
              className="group rounded-signature bg-white p-8 shadow-card transition-shadow duration-300 hover:shadow-card-hover"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blush-200 text-rose transition-transform duration-500 group-hover:rotate-[8deg]">
                <v.icon className="h-8 w-8" strokeWidth={1.5} />
              </div>
              <h3 className="mt-5 text-xl font-semibold text-plum md:text-2xl">{v.title}</h3>
              <p className="font-body mt-3 text-[15px] leading-[1.9] text-ink-soft md:text-base">{v.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
