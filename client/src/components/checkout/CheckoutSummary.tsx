"use client";

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Lock } from 'lucide-react';
import { useCart } from "@/components/CartProvider";
import { toTemplateItem } from "@/components/cartAdapter";
import { formatPrice } from "@/lib/voya";
import AnimatedPrice from '@/components/cart/AnimatedPrice';
import CouponField from '@/components/cart/CouponField';
import PaymentBadges from '@/components/cart/PaymentBadges';
import { COUPON_RATE, useCouponStore } from '@/components/cart/coupon';
import { buildWhatsAppOrderUrl, WhatsAppIcon } from '@/components/cart/whatsapp';
import { computeTotals } from '@/components/checkout/order';
import type { ShippingMethod, Totals } from '@/components/checkout/order';
import type { PaymentMethod } from '@/components/checkout/PaymentStep';
import { cn } from '@/lib/utils';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

function SummaryBody({ totals }: { totals: Totals }) {
  const { items: rawItems } = useCart();
  const items = rawItems.map(toTemplateItem);
  const coupon = useCouponStore((s) => s.code);

  return (
    <>
      <ul className="flex flex-col gap-3">
        {items.map((i) => (
          <li key={`${i.product.id}-${i.color ?? ''}`} className="flex items-center gap-3">
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
            <span className="tnum text-sm font-bold">{formatPrice(i.product.price * i.qty)}</span>
          </li>
        ))}
      </ul>

      <div className="mt-5 border-t border-blush-200 pt-4">
        <CouponField />
      </div>

      <dl className="mt-4 space-y-2 border-t border-blush-200 pt-4 text-sm">
        <div className="flex justify-between text-ink-soft">
          <dt>المجموع الفرعي</dt>
          <dd className="tnum font-medium text-ink">{formatPrice(totals.subtotal)}</dd>
        </div>
        <div className="flex justify-between text-ink-soft">
          <dt>الشحن</dt>
          <dd className={totals.shipping === 0 ? 'font-bold text-success' : 'tnum font-medium text-ink'}>
            {totals.shipping === 0 ? 'مجاني 🌸' : formatPrice(totals.shipping)}
          </dd>
        </div>
        {coupon && totals.discount > 0 && (
          <div className="flex justify-between font-semibold text-success">
            <dt>خصم الكوبون ({Math.round(COUPON_RATE * 100)}%)</dt>
            <dd className="tnum">−{formatPrice(totals.discount)}</dd>
          </div>
        )}
        <div className="flex items-baseline justify-between border-t border-dashed border-blush-200 pt-3">
          <dt className="text-base font-bold">الإجمالي</dt>
          <dd>
            <AnimatedPrice value={totals.total} className="font-heading text-2xl font-bold text-plum" />
          </dd>
        </div>
      </dl>
    </>
  );
}

interface Props {
  method: ShippingMethod;
  payment: PaymentMethod;
}

/** Sticky order-summary side card — collapsible on mobile, sticky aside on desktop. */
export default function CheckoutSummary({ method, payment }: Props) {
  const { items: rawItems } = useCart();
  const items = rawItems.map(toTemplateItem);
  const { subtotal } = useCart();
  const coupon = useCouponStore((s) => s.code);
  const totals = computeTotals(subtotal, coupon, method, payment);
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: -24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, ease: EASE }}
    >
      {/* mobile: collapsible bar with total always visible */}
      <div className="rounded-[28px] bg-white shadow-card lg:hidden">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="flex w-full items-center justify-between gap-3 p-4"
        >
          <span className="flex items-center gap-2 text-sm font-bold">
            إظهار ملخص الطلب
            <ChevronDown className={cn('h-4 w-4 transition-transform duration-300', open && 'rotate-180')} strokeWidth={1.5} />
          </span>
          <AnimatedPrice value={totals.total} className="font-heading text-lg font-bold text-rose-deep" />
        </button>
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="overflow-hidden"
            >
              <div className="border-t border-blush-200 p-4">
                <SummaryBody totals={totals} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* desktop: full sticky card */}
      <aside className="hidden rounded-[32px] bg-white p-6 shadow-card lg:block">
        <h2 className="text-xl font-bold">ملخص الطلب</h2>
        <div className="mt-5">
          <SummaryBody totals={totals} />
        </div>
        <div className="mt-5 border-t border-blush-200 pt-4">
          <p className="flex items-center justify-center gap-1.5 text-xs text-ink-soft">
            <Lock className="h-3.5 w-3.5" strokeWidth={1.5} />
            دفع آمن عبر تشفير SSL
          </p>
          <PaymentBadges className="mt-3" />
        </div>
      </aside>

      {/* WhatsApp ordering is available at every checkout step */}
      <a
        href={buildWhatsAppOrderUrl(items, totals.total)}
        target="_blank"
        rel="noreferrer"
        className="mt-4 flex items-center justify-center gap-2 rounded-full border-2 border-[#25D366]/50 bg-white py-3 text-sm font-bold text-[#1DA851] transition-colors hover:border-[#25D366] hover:bg-[#25D366]/5"
      >
        <WhatsAppIcon className="h-[18px] w-[18px]" />
        تفضّلين الطلب عبر واتساب؟
      </a>
    </motion.div>
  );
}
