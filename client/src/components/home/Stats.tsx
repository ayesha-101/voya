"use client";

import { motion } from 'framer-motion';
import { Heart, Truck, ShieldCheck, MessageCircle } from 'lucide-react';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const FEATURES = [
  {
    Icon: Heart,
    title: 'نجربها قبل أن نقدمها',
    desc: 'كل منتج يمرّ علينا أولًا — لا نعرض إلا ما أحببناه بصدق.',
  },
  {
    Icon: Truck,
    title: 'توصيل سريع 1–3 أيام',
    desc: 'نوصل طلبكِ لباب بيتكِ في أي إمارة بسرعة وعناية.',
  },
  {
    Icon: ShieldCheck,
    title: 'أصلية 100%',
    desc: 'منتجات أصلية مضمونة من مصادر موثوقة فقط.',
  },
  {
    Icon: MessageCircle,
    title: 'اطلبي عبر واتساب مباشرة',
    desc: 'فريقنا يرد عليكِ بسرعة ويساعدكِ تختارين الأنسب.',
  },
];

export default function Stats() {
  return (
    <section className="bg-cream py-20 md:py-24">
      <div className="container-voya">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {FEATURES.map(({ Icon, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: 0.1 + i * 0.1, ease: EASE }}
              className="group text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ type: 'spring', stiffness: 260, damping: 16, delay: i * 0.12 }}
                className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-gold/60 bg-blush-200 text-mauve transition-all duration-500 group-hover:rotate-[8deg] group-hover:border-transparent group-hover:bg-gradient-rose group-hover:text-white"
              >
                <Icon className="h-6 w-6" strokeWidth={1.5} />
              </motion.div>
              <h3 className="mt-4 font-heading text-lg font-semibold text-plum">{title}</h3>
              <p className="mt-1.5 text-sm leading-7 text-ink-soft">{desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
