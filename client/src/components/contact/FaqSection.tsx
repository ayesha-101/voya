"use client";

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const FAQS = [
  {
    q: 'كم تستغرق مدة التوصيل؟',
    a: 'داخل الإمارات 1–3 أيام عمل، والتوصيل السريع خلال 24 ساعة لدبي والشارقة.',
  },
  {
    q: 'هل منتجاتكم أصلية؟',
    a: 'نعم 100%. نختار منتجاتنا بعناية ونجربها بأنفسنا قبل أن نقدمها لكِ — هذا وعدنا.',
  },
  {
    q: 'هل يمكنني الطلب عبر واتساب؟',
    a: 'بالتأكيد! راسلينا على +971 55 3633 977 باسم المنتج وسنجهز طلبكِ فورًا.',
  },
  {
    q: 'ما سياسة الإرجاع؟',
    a: 'يمكنكِ الإرجاع خلال 14 يومًا بحالتها الأصلية غير المفتوحة.',
  },
  {
    q: 'هل الشحن مجاني؟',
    a: 'نعم، لجميع الطلبات فوق 200 د.إ داخل الإمارات.',
  },
  {
    q: 'هل تشحنون خارج الإمارات؟',
    a: 'حاليًا داخل الإمارات فقط، ونعمل على التوسع قريبًا بإذن الله.',
  },
];

function scrollToForm() {
  document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="bg-blush-100">
      <div className="container-voya py-24 md:py-32">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="mx-auto mb-10 max-w-[800px] text-center md:mb-14"
        >
          <span className="text-xs font-bold tracking-[0.15em] text-mauve">الأسئلة الشائعة</span>
          <h2 className="mt-2 text-[26px] font-semibold leading-[1.3] text-plum md:text-[38px]">
            أسئلة تدور في بالكِ؟
          </h2>
          <img src="/ornament-thread.svg" alt="" aria-hidden className="mx-auto mt-3 h-5 w-40" />
        </motion.div>

        <div className="mx-auto max-w-[800px] space-y-3">
          {FAQS.map((f, i) => {
            const open = openIndex === i;
            return (
              <motion.div
                key={f.q}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: i * 0.08, ease: EASE }}
                className={cn(
                  'overflow-hidden rounded-2xl bg-white shadow-card transition-shadow',
                  open && 'shadow-card-hover',
                )}
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(open ? null : i)}
                  aria-expanded={open}
                  aria-controls={`faq-panel-${i}`}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-right"
                >
                  <span className={cn('text-[15px] font-semibold transition-colors md:text-base', open ? 'text-rose-deep' : 'text-plum')}>
                    {f.q}
                  </span>
                  <Plus
                    className={cn('h-5 w-5 shrink-0 text-ink-soft transition-transform duration-300', open && 'rotate-45 text-gold')}
                    strokeWidth={1.5}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div
                      key="content"
                      id={`faq-panel-${i}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease: EASE }}
                      className="overflow-hidden"
                    >
                      <p className="font-body border-t border-blush-200 px-6 pb-6 pt-4 text-[14px] leading-[1.9] text-ink-soft md:text-[15px]">
                        {f.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="font-body mt-8 text-center text-[15px] text-ink-soft"
        >
          لم تجدي إجابتكِ؟{' '}
          <button
            type="button"
            onClick={scrollToForm}
            className="font-semibold text-rose-deep underline decoration-gold decoration-2 underline-offset-4 transition-colors hover:text-mauve"
          >
            راسلينا مباشرة
          </button>
        </motion.p>
      </div>
    </section>
  );
}
