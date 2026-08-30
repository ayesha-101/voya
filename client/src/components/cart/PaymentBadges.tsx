"use client";

import { Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

const BADGES = [
  { src: '/pay-visa.svg', alt: 'فيزا' },
  { src: '/pay-mastercard.svg', alt: 'ماستركارد' },
  { src: '/pay-applepay.svg', alt: 'Apple Pay' },
  { src: '/pay-tabby.svg', alt: 'تابي' },
  { src: '/pay-tamara.svg', alt: 'تمارا' },
  { src: '/pay-cod.svg', alt: 'الدفع عند الاستلام' },
];

/** Payment badges + secure-transactions trust line. */
export default function PaymentBadges({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-col items-center gap-2.5', className)}>
      <div className="flex flex-wrap items-center justify-center gap-1.5">
        {BADGES.map((b) => (
          <img
            key={b.src}
            src={b.src}
            alt={b.alt}
            className="h-6 w-auto rounded-md border border-blush-200 bg-white"
            loading="lazy"
          />
        ))}
      </div>
      <p className="flex items-center gap-1.5 text-xs text-ink-soft">
        <Lock className="h-3.5 w-3.5" strokeWidth={1.5} />
        معاملات مشفّرة وآمنة
      </p>
    </div>
  );
}
