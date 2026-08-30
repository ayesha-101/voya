"use client";

import { useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CreditCard, Flower2, MapPin } from 'lucide-react';
import { useCart } from "@/components/CartProvider";
import { toTemplateItem } from "@/components/cartAdapter";
import { formatPrice } from "@/lib/voya";
import type { ShippingData, Totals } from '@/components/checkout/order';
import type { PaymentMethod } from '@/components/checkout/PaymentStep';
import { cn } from '@/lib/utils';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  cod: 'الدفع عند الاستلام',
  card: 'بطاقة بنكية',
};

interface Props {
  shipping: ShippingData;
  payment: PaymentMethod;
  totals: Totals;
  onBack: () => void;
  onConfirm: () => Promise<void> | void;
  /** عناصر Stripe حين يكون الدفع ببطاقة. */
  cardSlot?: ReactNode;
}

/** Step 3 — full order review + agreement + «تأكيد الطلب 🌸». */
export default function ReviewStep({ shipping, payment, totals, onBack, onConfirm, cardSlot }: Props) {
  const { items: rawItems } = useCart();
  const items = rawItems.map(toTemplateItem);
  const [agreed, setAgreed] = useState(false);
  const [agreeError, setAgreeError] = useState(false);
  const [processing, setProcessing] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!agreed) {
      setAgreeError(true);
      return;
    }
    // الطلب يُنشأ فعليًا على الخادم؛ المؤشّر يبقى حتى ينتهي النداء
    setProcessing(true);
    try {
      await onConfirm();
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={submit} className="rounded-[32px] bg-white p-6 shadow-card md:p-8">
      <h2 className="flex items-center gap-2 text-xl font-bold">
        مراجعة الطلب
        <img src="/ornament-thread.svg" alt="" aria-hidden className="h-3 w-20 opacity-80" />
      </h2>

      {/* items */}
      <ul className="mt-5 flex flex-col gap-3">
        {items.map((i) => (
          <li key={`${i.product.id}-${i.color ?? ''}`} className="flex items-center gap-3 rounded-2xl bg-blush-50 p-2.5">
            <img
              src={i.product.images[0]}
              alt={i.product.name}
              className="h-14 w-14 shrink-0 rounded-xl bg-blush-100 object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{i.product.name}</p>
              <p className="mt-0.5 text-xs text-ink-soft">
                {i.color ? `${i.color} · ` : ''}الكمية: <span className="tnum">{i.qty}</span>
              </p>
            </div>
            <span className="tnum text-sm font-bold text-rose-deep">{formatPrice(i.product.price * i.qty)}</span>
          </li>
        ))}
      </ul>

      {/* address + payment recap */}
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-blush-200 bg-blush-50 p-4 text-sm">
          <p className="flex items-center gap-1.5 font-bold text-plum">
            <MapPin className="h-4 w-4 text-rose" strokeWidth={1.5} />
            عنوان الشحن
          </p>
          <p className="mt-2 leading-relaxed text-ink-soft">
            {shipping.fullName}
            <br />
            {shipping.city}، {shipping.district} — {shipping.address}
            <br />
            <span className="tnum" dir="ltr">+971 {shipping.phone}</span>
          </p>
        </div>
        <div className="rounded-2xl border border-blush-200 bg-blush-50 p-4 text-sm">
          <p className="flex items-center gap-1.5 font-bold text-plum">
            <CreditCard className="h-4 w-4 text-rose" strokeWidth={1.5} />
            طريقة الدفع
          </p>
          <p className="mt-2 leading-relaxed text-ink-soft">{PAYMENT_LABELS[payment]}</p>
          <p className="mt-1 text-xs text-ink-soft">
            {shipping.method === 'express' ? 'توصيل سريع — خلال 24 ساعة' : 'توصيل عادي — 1–3 أيام'}
          </p>
        </div>
      </div>

      {/* final numbers */}
      <dl className="mt-5 space-y-2.5 border-t border-blush-200 pt-5 text-sm">
        <div className="flex justify-between text-ink-soft">
          <dt>المجموع الفرعي</dt>
          <dd className="tnum font-medium text-ink">{formatPrice(totals.subtotal)}</dd>
        </div>
        {totals.discount > 0 && (
          <div className="flex justify-between font-semibold text-success">
            <dt>خصم الكوبون</dt>
            <dd className="tnum">−{formatPrice(totals.discount)}</dd>
          </div>
        )}
        <div className="flex justify-between text-ink-soft">
          <dt>الشحن</dt>
          <dd className={totals.shipping === 0 ? 'font-bold text-success' : 'tnum font-medium text-ink'}>
            {totals.shipping === 0 ? 'مجاني 🌸' : formatPrice(totals.shipping)}
          </dd>
        </div>
        <div className="flex items-baseline justify-between border-t border-dashed border-blush-200 pt-3">
          <dt className="text-base font-bold">الإجمالي النهائي</dt>
          <dd className="tnum font-heading text-3xl font-bold text-rose-deep">{formatPrice(totals.total)}</dd>
        </div>
      </dl>

      {/* agreement */}
      <label
        className={cn(
          'mt-5 flex cursor-pointer items-center gap-3 rounded-2xl border p-4 transition-colors',
          agreeError && !agreed ? 'border-destructive bg-destructive/5' : 'border-blush-200 bg-blush-50',
        )}
      >
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => {
            setAgreed(e.target.checked);
            if (e.target.checked) setAgreeError(false);
          }}
          className="h-4 w-4 shrink-0 accent-rose"
        />
        <span className="text-sm text-ink-soft">
          أوافق على <span className="font-bold text-rose-deep">سياسة الطلب والإرجاع</span> الخاصة بمتجر فويا
        </span>
      </label>
      {agreeError && !agreed && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: EASE }}
          className="pt-1.5 text-xs text-destructive"
        >
          نحتاج موافقتكِ على السياسة قبل تأكيد الطلب 🌸
        </motion.p>
      )}
      {/* عناصر Stripe تظهر هنا حين يكون الدفع ببطاقة */}
      {cardSlot}

      <button
        type="submit"
        disabled={processing}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-rose py-4 text-base font-bold text-white transition-shadow duration-300 hover:shadow-card-hover disabled:cursor-not-allowed disabled:opacity-85"
      >
        {processing ? (
          <>
            <Flower2 className="h-5 w-5 animate-spin" strokeWidth={1.5} />
            لحظات ويتم تأكيد طلبكِ…
          </>
        ) : (
          <>تأكيد الطلب 🌸</>
        )}
      </button>

      <button
        type="button"
        onClick={onBack}
        disabled={processing}
        className="group mx-auto mt-3 flex items-center gap-1.5 py-2 text-sm font-medium text-ink-soft transition-colors hover:text-rose-deep"
      >
        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={1.5} />
        رجوع للدفع
      </button>
    </form>
  );
}
