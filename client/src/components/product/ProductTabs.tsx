"use client";

import { specsOf } from "@/lib/voya";
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Flower2 } from 'lucide-react';
import type { Product } from "@/lib/types";
import { cn } from '@/lib/utils';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const TABS = [
  { key: 'desc', label: 'الوصف' },
  { key: 'ingredients', label: 'المكونات' },
  { key: 'ritual', label: 'طريقة الاستخدام' },
  { key: 'shipping', label: 'الشحن والإرجاع' },
] as const;

type TabKey = (typeof TABS)[number]['key'];

function DescriptionTab({ product }: { product: Product }) {
  return (
    <div className="font-body max-w-3xl space-y-5 text-[15px] leading-[1.9] text-ink-soft">
      <p className="text-base font-medium text-plum">{product.description}</p>
      <p>
        في فويا نختار منتجاتنا بعناية ونجربها بأنفسنا قبل أن تصل إليكِ — لنضمن لكِ الجودة
        والمصداقية في كل شيء نقدمه. هذه القطعة اجتازت اختبار فريقنا وأصبحت من المفضلات
        لدى عميلاتنا.
      </p>
      <p>
        لتدوم معكِ أطول فترة ممكنة، احفظي المنتج في مكان بارد وجاف بعيدًا عن أشعة الشمس
        المباشرة، وأغلقي العبوة جيدًا بعد كل استخدام.
      </p>
      <ul className="space-y-2.5 pt-1">
        {[
          'خالٍ من المواد القاسية ولطيف على الاستخدام اليومي',
          'مناسب لروتينكِ الصباحي والمسائي',
          'نتائج ملحوظة من أول استخدام',
          'تغليف هدية أنيق يليق بكِ وبمن تحبين',
        ].map((point) => (
          <li key={point} className="flex items-center gap-2.5">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blush-200 text-rose-deep">
              <Flower2 className="h-3 w-3" strokeWidth={2} />
            </span>
            <span className="text-plum">{point}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function IngredientsTab({ product }: { product: Product }) {
  // المكوّنات مصفوفة في القاعدة؛ نستعملها كما هي
  const ingredients = product.ingredients.map((s) => s.trim()).filter(Boolean);
  const specs = Object.entries(specsOf(product));

  return (
    <div className="max-w-3xl">
      {ingredients.length > 0 ? (
        <>
          <p className="font-body text-[15px] leading-[1.9] text-ink-soft">
            تركيبة مدروسة بمكونات مختارة بعناية — وهذه أبرزها:
          </p>
          <div className="mt-5 flex flex-wrap gap-2.5">
            {ingredients.map((ing) => (
              <span
                key={ing}
                className="rounded-full bg-blush-200 px-4 py-2 text-[13px] font-bold text-mauve"
              >
                {ing}
              </span>
            ))}
          </div>
        </>
      ) : (
        <p className="font-body text-[15px] leading-[1.9] text-ink-soft">
          تركيبة لطيفة وآمنة مختارة بعناية فريق فويا، ومدوّنة بالكامل على العبوة.
        </p>
      )}

      {specs.length > 0 && (
        <div className="mt-8 overflow-hidden rounded-2xl border border-blush-200">
          {specs.map(([key, value], i) => (
            <div
              key={key}
              className={cn(
                'flex items-center justify-between gap-6 px-5 py-3.5 text-sm',
                i % 2 === 0 ? 'bg-blush-100' : 'bg-white',
              )}
            >
              <span className="font-bold text-plum">{key}</span>
              <span className="font-body text-ink-soft">{value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function RitualTab({ product }: { product: Product }) {
  const steps = product.howToUse
    ? product.howToUse
        .split(/[.،؛]/)
        .map((s) => s.trim())
        .filter(Boolean)
    : ['ضعي كمية مناسبة على المنطقة المراد العناية بها', 'دلّكي بلطف حتى الامتصاص الكامل', 'كرري حسب الحاجة ضمن روتينكِ اليومي'];

  return (
    <ol className="font-body relative max-w-2xl space-y-6">
      {/* dashed gold thread connecting the steps */}
      <span
        aria-hidden
        className="absolute right-[17px] top-3 bottom-3 w-px border-r-2 border-dashed border-gold/50"
      />
      {steps.map((step, i) => (
        <motion.li
          key={i}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: EASE, delay: i * 0.08 }}
          className="relative flex items-start gap-4"
        >
          <span className="tnum relative z-[1] flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blush-200 font-heading text-sm font-bold text-rose-deep ring-4 ring-white">
            {i + 1}
          </span>
          <p className="pt-1.5 text-[15px] leading-[1.85] text-plum">{step}</p>
        </motion.li>
      ))}
    </ol>
  );
}

function ShippingTab() {
  const rows = [
    { title: 'التوصيل داخل الإمارات', desc: 'يُجهَّز طلبكِ خلال 24 ساعة ويصلكِ خلال 1–3 أيام عمل لجميع الإمارات.' },
    { title: 'الشحن المجاني', desc: 'شحن مجاني لجميع الطلبات فوق 200 د.إ، وبرسوم رمزية 25 د.إ لما دون ذلك.' },
    { title: 'الإرجاع', desc: 'يمكنكِ إرجاع المنتج خلال 14 يومًا من الاستلام بحالته الأصلية وبتغليفه.' },
    { title: 'الدفع', desc: 'دفع آمن بالبطاقة أو Apple Pay أو تابي وتمارا، والدفع عند الاستلام متاح أيضًا.' },
  ];
  return (
    <div className="max-w-3xl overflow-hidden rounded-2xl border border-blush-200">
      {rows.map((r, i) => (
        <div
          key={r.title}
          className={cn(
            'flex flex-col gap-1 px-5 py-4 md:flex-row md:items-start md:gap-8',
            i % 2 === 0 ? 'bg-blush-100' : 'bg-white',
          )}
        >
          <h4 className="w-40 shrink-0 text-[15px] font-bold text-plum">{r.title}</h4>
          <p className="font-body text-sm leading-[1.85] text-ink-soft">{r.desc}</p>
        </div>
      ))}
    </div>
  );
}

export default function ProductTabs({ product }: { product: Product }) {
  const [tab, setTab] = useState<TabKey>('desc');

  return (
    <section className="container-voya mt-16 md:mt-24">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.7, ease: EASE }}
        className="rounded-[32px] bg-white p-5 shadow-card md:p-10"
      >
        <div className="border-b border-blush-200">
          <div className="flex gap-2 md:gap-8" role="tablist" aria-label="معلومات المنتج">
            {TABS.map((t) => (
              <button
                key={t.key}
                role="tab"
                aria-selected={tab === t.key}
                onClick={() => setTab(t.key)}
                className={cn(
                  'relative whitespace-nowrap px-2 pb-4 pt-2 text-sm font-bold transition-colors md:px-3 md:text-base',
                  tab === t.key ? 'text-rose-deep' : 'text-ink-soft hover:text-plum',
                )}
              >
                {t.label}
                {tab === t.key && (
                  <motion.span
                    layoutId="product-tab-indicator"
                    transition={{ duration: 0.35, ease: EASE }}
                    className="absolute inset-x-2 bottom-0 h-[3px] rounded-full bg-gold"
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="py-8 md:py-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: EASE }}
            >
              {tab === 'desc' && <DescriptionTab product={product} />}
              {tab === 'ingredients' && <IngredientsTab product={product} />}
              {tab === 'ritual' && <RitualTab product={product} />}
              {tab === 'shipping' && <ShippingTab />}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </section>
  );
}
