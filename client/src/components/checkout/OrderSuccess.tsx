"use client";

import { useState } from 'react';
import Link from "next/link";
import { motion } from 'framer-motion';
import { Check, Copy, Camera, PackageCheck } from 'lucide-react';
import { formatPrice } from "@/lib/voya";
import Confetti from '@/components/checkout/Confetti';
import type { OrderSnapshot } from '@/components/checkout/order';
import { buildWhatsAppChatUrl, WhatsAppIcon } from '@/components/cart/whatsapp';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/** Step 3 — order success screen: petal burst + gold circle with rose checkmark. */
export default function OrderSuccess({ order }: { order: OrderSnapshot }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(order.orderNumber);
    } catch {
      /* clipboard unavailable — still show feedback */
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-silk relative overflow-hidden rounded-[32px] px-6 py-12 text-center shadow-card md:py-16">
      <Confetti />

      <div className="relative z-[2] mx-auto max-w-lg">
        {/* gold circle drawn by stroke animation, rose ✓ inside */}
        <motion.svg
          viewBox="0 0 100 100"
          className="mx-auto h-28 w-28"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: EASE }}
        >
          <motion.circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#C6A15B"
            strokeWidth="3"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
          <motion.path
            d="M32 52 L45 65 L70 38"
            fill="none"
            stroke="#D67B93"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.45, ease: 'easeOut', delay: 0.85 }}
          />
        </motion.svg>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.6 }}
        >
          <h1 className="mt-6 text-3xl font-bold md:text-4xl">شكرًا لكِ! طلبكِ في طريقه إليكِ 🌸</h1>

          <div className="mt-5 flex items-center justify-center gap-2">
            <span className="rounded-full bg-gold-soft px-5 py-2 font-mono text-lg font-bold tracking-wider text-plum" dir="ltr">
              {order.orderNumber}
            </span>
            <button
              type="button"
              onClick={copy}
              className="flex items-center gap-1.5 rounded-full border border-gold/50 bg-white px-3.5 py-2 text-xs font-semibold text-ink transition-colors hover:border-gold hover:text-mauve"
            >
              {copied ? <Check className="h-4 w-4 text-success" strokeWidth={2} /> : <Copy className="h-4 w-4" strokeWidth={1.5} />}
              {copied ? 'تم النسخ' : 'نسخ'}
            </button>
          </div>

          <p className="font-body mt-4 leading-relaxed text-ink-soft">
            سيصلكِ تأكيد عبر البريد والرسائل النصية، والتوصيل المتوقع خلال 1–3 أيام داخل الإمارات.
          </p>

          {/* mini order summary */}
          <div className="mt-8 rounded-3xl border border-blush-200 bg-white p-5 text-right shadow-card">
            <p className="flex items-center gap-2 text-sm font-bold">
              <PackageCheck className="h-4 w-4 text-rose" strokeWidth={1.5} />
              ملخص الطلب
            </p>
            <ul className="mt-3 space-y-2">
              {order.items.map((i) => (
                <li key={`${i.product.id}-${i.color ?? ''}`} className="flex items-center gap-3 text-sm">
                  <img src={i.product.images[0]} alt={i.product.name} className="h-10 w-10 rounded-xl bg-blush-100 object-cover" />
                  <span className="flex-1 truncate">{i.product.name}</span>
                  <span className="tnum text-ink-soft">×{i.qty}</span>
                  <span className="tnum font-semibold">{formatPrice(i.product.price * i.qty)}</span>
                </li>
              ))}
            </ul>
            {order.discount > 0 && (
              <div className="mt-3 flex justify-between border-t border-blush-100 pt-3 text-sm font-semibold text-success">
                <span>خصم الكوبون</span>
                <span className="tnum">−{formatPrice(order.discount)}</span>
              </div>
            )}
            <div className="mt-3 flex justify-between border-t border-dashed border-blush-200 pt-3 text-base font-bold">
              <span>الإجمالي المدفوع</span>
              <span className="tnum font-heading text-lg text-rose-deep">{formatPrice(order.total)}</span>
            </div>
          </div>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <a
              href={buildWhatsAppChatUrl(`مرحبًا فويا 🌸 أريد تتبّع طلبي ${order.orderNumber}`)}
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-gradient-rose px-8 py-3 text-sm font-bold text-white transition-shadow duration-300 hover:shadow-card-hover"
            >
              تتبّعي طلبكِ
            </a>
            <a
              href={buildWhatsAppChatUrl('مرحبًا فويا 🌸 لدي استفسار عن طلبي')}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 rounded-full border-2 border-[#25D366]/50 px-8 py-3 text-sm font-bold text-[#1DA851] transition-colors hover:border-[#25D366] hover:bg-[#25D366]/5"
            >
              <WhatsAppIcon className="h-4 w-4" />
              تواصلي معنا واتساب
            </a>
          </div>

          <Link href="/products"
            className="mt-4 inline-block text-sm font-semibold text-ink-soft transition-colors hover:text-rose-deep"
          >
            ← متابعة التسوق
          </Link>

          <p className="mt-8 flex items-center justify-center gap-2 text-sm text-ink-soft">
            <Camera className="h-4 w-4 text-rose" strokeWidth={1.5} />
            تابعينا على انستغرام
            <span className="font-bold text-mauve" dir="ltr">@byvoyastore</span>
            لعروض حصرية
          </p>
        </motion.div>
      </div>
    </div>
  );
}
