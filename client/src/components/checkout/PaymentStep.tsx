"use client";

import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Banknote, MapPin, Pencil } from 'lucide-react';
import { formatPrice } from "@/lib/voya";
import type { ShippingData } from '@/components/checkout/order';
import { cn } from '@/lib/utils';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export type PaymentMethod = 'card' | 'cod';

const METHODS: { value: PaymentMethod; title: string; desc?: string; logos?: string[]; badge?: string; icon?: boolean }[] = [
  {
    value: 'cod',
    title: 'الدفع عند الاستلام',
    desc: 'ادفعي نقدًا أو بالبطاقة عند وصول طلبكِ',
    badge: 'الأكثر شيوعًا',
    icon: true,
  },
  {
    value: 'card',
    // Apple Pay و Google Pay يظهران داخل نموذج Stripe نفسه على الأجهزة الداعمة
    title: 'بطاقة بنكية · Apple Pay · Google Pay',
    logos: ['/pay-visa.svg', '/pay-mastercard.svg', '/pay-applepay.svg'],
  },
];

// تابي وتمارا غير مربوطتين بالخادم بعد، فلا تُعرضان حتى لا نَعِد الزبونة
// بخيار لا يعمل.

const formatCardNumber = (v: string) =>
  v.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ');

const formatExpiry = (v: string) => {
  const d = v.replace(/\D/g, '').slice(0, 4);
  if (d.length <= 2) return d;
  return `${d.slice(0, 2)}/${d.slice(2)}`;
};

const cardInputClass =
  'w-full rounded-2xl border border-blush-200 bg-white px-4 py-2.5 text-sm outline-none transition-colors focus:border-rose placeholder:text-ink-soft/50';

interface Props {
  /** يُخفي خيار البطاقة إن لم تُهيّأ مفاتيح Stripe على الخادم. */
  cardsEnabled?: boolean;
  method: PaymentMethod;
  onMethodChange: (m: PaymentMethod) => void;
  onBack: () => void;
  onConfirm: () => void;
  total: number;
  shipping: ShippingData;
}

export default function PaymentStep({
  cardsEnabled = true, method, onMethodChange, onBack, onConfirm, total, shipping }: Props) {
  const [card, setCard] = useState({ number: '', name: '', expiry: '', cvv: '' });
  const [cardError, setCardError] = useState<string | null>(null);

  const updateCard = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCard((c) => ({
      ...c,
      [name]:
        name === 'number' ? formatCardNumber(value) : name === 'expiry' ? formatExpiry(value) : name === 'cvv' ? value.replace(/\D/g, '').slice(0, 4) : value,
    }));
    if (cardError) setCardError(null);
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (method === 'card') {
      const digits = card.number.replace(/\s/g, '');
      if (digits.length !== 16) return setCardError('أدخلي رقم بطاقة صحيح (16 رقمًا)');
      if (card.name.trim().length < 3) return setCardError('أدخلي الاسم على البطاقة');
      const [mm, yy] = card.expiry.split('/');
      if (!mm || !yy || Number(mm) < 1 || Number(mm) > 12) return setCardError('أدخلي تاريخ انتهاء صحيح MM/YY');
      if (card.cvv.length < 3) return setCardError('أدخلي رمز CVV');
    }
    onConfirm();
  };

  const installment = Math.round((total / 4) * 100) / 100;

  return (
    <form onSubmit={submit} className="rounded-[32px] bg-white p-6 shadow-card md:p-8">
      <h2 className="flex items-center gap-2 text-xl font-bold">
        طريقة الدفع
        <img src="/ornament-thread.svg" alt="" aria-hidden className="h-3 w-20 opacity-80" />
      </h2>

      {/* shipping address recap with edit link */}
      <div className="mt-5 flex items-start justify-between gap-3 rounded-2xl border border-blush-200 bg-blush-50 p-4">
        <p className="flex items-start gap-2 text-sm leading-relaxed text-ink-soft">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-rose" strokeWidth={1.5} />
          <span>
            <span className="block font-bold text-plum">{shipping.fullName}</span>
            {shipping.city}، {shipping.district} — {shipping.address}
            <span className="tnum block" dir="ltr">+971 {shipping.phone}</span>
          </span>
        </p>
        <button
          type="button"
          onClick={onBack}
          className="flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold text-rose-deep transition-colors hover:bg-blush-100"
        >
          <Pencil className="h-3.5 w-3.5" strokeWidth={1.5} />
          تعديل
        </button>
      </div>

      <div className="mt-5 flex flex-col gap-3">
        {METHODS.filter((m) => m.value !== 'card' || cardsEnabled).map((m) => {
          const selected = method === m.value;
          const expands = (m.value === 'card' || false) && selected;
          return (
            <div key={m.value}>
              <label
                className={cn(
                  'flex cursor-pointer items-center gap-3 rounded-3xl border p-4 transition-all duration-300',
                  selected ? 'border-rose bg-blush-100 shadow-card' : 'border-blush-200 bg-blush-50 hover:border-rose/40',
                  expands && 'rounded-b-none',
                )}
              >
                <input
                  type="radio"
                  name="payment"
                  value={m.value}
                  checked={selected}
                  onChange={() => onMethodChange(m.value)}
                  className="sr-only"
                />
                <span
                  className={cn(
                    'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                    selected ? 'border-rose' : 'border-blush-200',
                  )}
                >
                  {selected && <span className="h-2.5 w-2.5 rounded-full bg-rose" />}
                </span>
                <span className="flex-1">
                  <span className="block text-sm font-bold">{m.title}</span>
                  {m.desc && <span className="block text-xs text-ink-soft">{m.desc}</span>}
                </span>
                {m.logos && (
                  <span className="flex items-center gap-1.5">
                    {m.logos.map((src) => (
                      <img key={src} src={src} alt="" className="h-6 w-auto rounded border border-blush-200 bg-white" loading="lazy" />
                    ))}
                  </span>
                )}
                {m.badge && (
                  <span className="rounded-full bg-gold-soft px-2.5 py-1 text-[11px] font-bold text-gold">{m.badge}</span>
                )}
                {m.icon && <Banknote className="h-5 w-5 text-ink-soft" strokeWidth={1.5} />}
              </label>

              {/* card details — expands with height animation */}
              <AnimatePresence initial={false}>
                {m.value === 'card' && selected && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.4, ease: EASE }}
                    className="overflow-hidden"
                  >
                    <div className="grid gap-4 rounded-b-3xl border border-t-0 border-rose bg-blush-50 p-4 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <label htmlFor="card-number" className="mb-1.5 block text-xs font-semibold">رقم البطاقة</label>
                        <input
                          id="card-number"
                          name="number"
                          inputMode="numeric"
                          dir="ltr"
                          value={card.number}
                          onChange={updateCard}
                          placeholder="0000 0000 0000 0000"
                          className={cn(cardInputClass, 'text-left tracking-wider')}
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label htmlFor="card-name" className="mb-1.5 block text-xs font-semibold">الاسم على البطاقة</label>
                        <input
                          id="card-name"
                          name="name"
                          value={card.name}
                          onChange={updateCard}
                          placeholder="كما يظهر على البطاقة"
                          className={cardInputClass}
                        />
                      </div>
                      <div>
                        <label htmlFor="card-expiry" className="mb-1.5 block text-xs font-semibold">تاريخ الانتهاء</label>
                        <input
                          id="card-expiry"
                          name="expiry"
                          inputMode="numeric"
                          dir="ltr"
                          value={card.expiry}
                          onChange={updateCard}
                          placeholder="MM/YY"
                          className={cn(cardInputClass, 'text-left tracking-wider')}
                        />
                      </div>
                      <div>
                        <label htmlFor="card-cvv" className="mb-1.5 block text-xs font-semibold">CVV</label>
                        <input
                          id="card-cvv"
                          name="cvv"
                          inputMode="numeric"
                          dir="ltr"
                          value={card.cvv}
                          onChange={updateCard}
                          placeholder="123"
                          className={cn(cardInputClass, 'text-left tracking-wider')}
                        />
                      </div>
                      <AnimatePresence>
                        {cardError && (
                          <motion.p
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.25, ease: EASE }}
                            className="overflow-hidden text-xs text-destructive sm:col-span-2"
                          >
                            {cardError}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* tabby / tamara mini installment schedule */}
              <AnimatePresence initial={false}>
                {false && selected && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.4, ease: EASE }}
                    className="overflow-hidden"
                  >
                    <div className="rounded-b-3xl border border-t-0 border-rose bg-blush-50 p-4">
                      <p className="text-xs font-semibold text-ink-soft">قسّميها على 4 دفعات بدون فوائد:</p>
                      <div className="mt-2.5 grid grid-cols-4 gap-2">
                        {[1, 2, 3, 4].map((n) => (
                          <div key={n} className="rounded-xl bg-white px-1 py-2 text-center shadow-card">
                            <p className="text-[10px] font-bold text-mauve">دفعة {n}</p>
                            <p className="tnum mt-0.5 text-xs font-bold text-rose-deep">{formatPrice(installment)}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      <button
        type="submit"
        className="mt-7 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-rose py-4 text-base font-bold text-white transition-shadow duration-300 hover:shadow-card-hover"
      >
        مراجعة الطلب — <span className="tnum">{formatPrice(total)}</span>
      </button>

      <button
        type="button"
        onClick={onBack}
        className="group mx-auto mt-3 flex items-center gap-1.5 py-2 text-sm font-medium text-ink-soft transition-colors hover:text-rose-deep"
      >
        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={1.5} />
        رجوع للشحن
      </button>
    </form>
  );
}
