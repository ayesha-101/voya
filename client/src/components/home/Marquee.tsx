"use client";

import { motion } from 'framer-motion';

const ITEMS = [
  'شحن مجاني فوق 200 د.إ',
  'منتجات أصلية 100%',
  'دفع آمن ومتعدد',
  'إرجاع سهل خلال 14 يومًا',
  'صنع بحب في الإمارات 🇦🇪',
];

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

function Row() {
  return (
    <div className="flex shrink-0 items-center">
      {ITEMS.map((item) => (
        <span key={item} className="flex items-center whitespace-nowrap">
          <span className="px-6 text-sm font-semibold text-cream">{item}</span>
          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-gold" aria-hidden>
            <path
              d="M12 2c4 2.2 6 6 3.6 10.4C13.4 16.6 9 18.6 5.4 16.4 1.8 14.2 2.4 9.6 5.6 7 8.2 4.9 12 5 13.4 7.4c1 1.8-.2 4-2.2 4.2-1.4.2-2.6-.8-2.4-2.2"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </span>
      ))}
    </div>
  );
}

export default function Marquee() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.9 }}
      transition={{ duration: 0.6, ease: EASE }}
      className="relative z-10 -my-2 -rotate-1 scale-[1.02] overflow-hidden bg-plum"
      aria-label="مزايا المتجر"
    >
      <div className="group flex h-14 items-center overflow-hidden" dir="ltr">
        <div className="flex animate-marquee group-hover:[animation-duration:70s]" style={{ width: 'max-content' }}>
          <Row />
          <Row />
        </div>
      </div>
    </motion.section>
  );
}
