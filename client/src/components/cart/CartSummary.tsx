"use client";

import Link from "next/link";
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useCart } from "@/components/CartProvider";
import { toTemplateItem } from "@/components/cartAdapter";
import { formatPrice } from "@/lib/voya";
import AnimatedPrice from '@/components/cart/AnimatedPrice';
import CouponField from '@/components/cart/CouponField';
import PaymentBadges from '@/components/cart/PaymentBadges';
import { COUPON_RATE, getCouponDiscount, useCouponStore } from '@/components/cart/coupon';
import { buildWhatsAppOrderUrl, WhatsAppIcon } from '@/components/cart/whatsapp';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/** Sticky order-summary card on the cart page. */
export default function CartSummary() {
  const { items, subtotal, shippingFee: shipping } = useCart();
  const coupon = useCouponStore((s) => s.code);
  const discount = getCouponDiscount(subtotal, coupon);
  const total = subtotal + shipping - discount;

  return (
    <motion.aside
      initial={{ opacity: 0, x: -40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.7, ease: EASE, delay: 0.3 }}
      className="h-fit rounded-[32px] bg-white p-6 shadow-card lg:sticky lg:top-28"
    >
      <h2 className="flex items-center gap-2 text-xl font-bold">
        ملخص الطلب
        <img src="/ornament-thread.svg" alt="" aria-hidden className="h-3.5 w-24 opacity-80" />
      </h2>

      <div className="mt-5">
        <CouponField />
      </div>

      <dl className="mt-5 space-y-2.5 border-t border-blush-200 pt-5 text-sm">
        <div className="flex justify-between text-ink-soft">
          <dt>المجموع الفرعي</dt>
          <dd className="tnum font-medium text-ink">{formatPrice(subtotal)}</dd>
        </div>
        {discount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="flex justify-between font-semibold text-success"
          >
            <dt>خصم الكوبون ({Math.round(COUPON_RATE * 100)}%)</dt>
            <dd className="tnum">−{formatPrice(discount)}</dd>
          </motion.div>
        )}
        <div className="flex justify-between text-ink-soft">
          <dt>الشحن</dt>
          <dd className={shipping === 0 ? 'font-bold text-success' : 'tnum font-medium text-ink'}>
            {shipping === 0 ? 'مجاني 🌸' : formatPrice(shipping)}
          </dd>
        </div>
        <div className="flex items-baseline justify-between border-t border-dashed border-blush-200 pt-3">
          <dt className="text-base font-bold">الإجمالي</dt>
          <dd>
            <AnimatedPrice value={total} className="font-heading text-[26px] font-bold text-plum" />
          </dd>
        </div>
      </dl>

      <Link href="/checkout"
        className="group relative mt-5 flex items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-rose py-3.5 text-sm font-bold text-white transition-shadow duration-300 hover:shadow-card-hover"
      >
        <span className="shimmer-gold pointer-events-none absolute inset-0 animate-shimmer" aria-hidden />
        إتمام الطلب
        <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" strokeWidth={2} />
      </Link>

      <a
        href={buildWhatsAppOrderUrl(items.map(toTemplateItem), total)}
        target="_blank"
        rel="noreferrer"
        className="mt-3 flex items-center justify-center gap-2 rounded-full border-2 border-[#25D366]/50 py-3 text-sm font-bold text-[#1DA851] transition-colors hover:border-[#25D366] hover:bg-[#25D366]/5"
      >
        <WhatsAppIcon className="h-[18px] w-[18px]" />
        إتمام الطلب عبر واتساب
      </a>

      <Link href="/products"
        className="mx-auto mt-3 flex w-fit items-center gap-1.5 py-1 text-sm font-semibold text-ink-soft transition-colors hover:text-rose-deep"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
        متابعة التسوق
      </Link>

      <PaymentBadges className="mt-4 border-t border-blush-100 pt-4" />
    </motion.aside>
  );
}
