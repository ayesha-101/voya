"use client";

import { motion } from 'framer-motion';
import { Gift, HandCoins, ShieldCheck, Truck } from 'lucide-react';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const PERKS = [
  { icon: Truck, title: 'توصيل سريع', desc: 'داخل الإمارات خلال 1–3 أيام' },
  { icon: Gift, title: 'تغليف هدية مجاني', desc: 'بورق حرير وشريط ذهبي' },
  { icon: ShieldCheck, title: 'منتجات أصلية', desc: 'نجربها بأنفسنا قبل أن نقدمها لكِ' },
  { icon: HandCoins, title: 'دفع عند الاستلام', desc: 'متاح لجميع الإمارات' },
];

export default function PerksStrip() {
  return (
    <section className="container-voya mt-16 md:mt-24">
      <div className="grid grid-cols-2 gap-3 rounded-[32px] bg-blush-100 p-5 md:p-7 lg:grid-cols-4 lg:gap-6">
        {PERKS.map((p, i) => (
          <motion.div
            key={p.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, ease: EASE, delay: i * 0.1 }}
            className="group flex items-start gap-3.5"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-rose shadow-card transition-transform duration-300 group-hover:-translate-y-[3px]">
              <p.icon className="h-6 w-6" strokeWidth={1.5} />
            </span>
            <span>
              <span className="block text-sm font-bold text-plum">{p.title}</span>
              <span className="mt-0.5 block text-xs leading-relaxed text-ink-soft">{p.desc}</span>
            </span>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
