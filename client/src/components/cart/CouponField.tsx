"use client";

import { useState } from 'react';
import type { FormEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BadgePercent, CheckCircle2, X } from 'lucide-react';
import { useCouponStore } from '@/components/cart/coupon';
import PetalBurst from '@/components/cart/PetalBurst';
import { cn } from '@/lib/utils';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function CouponField() {
  const { code, apply, remove } = useCouponStore();
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [burst, setBurst] = useState(0);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;
    const ok = apply(value);
    if (ok) {
      setError(null);
      setValue('');
      setBurst((b) => b + 1); // petal-burst celebration
    } else {
      setError('كود الخصم غير صالح — جرّبي VOYA10 🌸');
    }
  };

  return (
    <div className="relative">
      {burst > 0 && <PetalBurst burstKey={burst} />}
      <AnimatePresence mode="wait" initial={false}>
        {code ? (
          <motion.div
            key="applied"
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="flex items-center justify-between rounded-full border border-dashed border-gold bg-gold-soft px-4 py-3"
          >
            <span className="flex items-center gap-2 text-sm font-semibold text-plum">
              <CheckCircle2 className="h-4 w-4 text-success" strokeWidth={1.5} />
              تم تطبيق كود الخصم
              <span className="tnum rounded-full bg-white px-2.5 py-0.5 text-xs font-bold tracking-wider text-rose-deep" dir="ltr">
                {code}
              </span>
            </span>
            <button
              type="button"
              onClick={remove}
              aria-label="إزالة الكوبون"
              className="flex h-7 w-7 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-white hover:text-destructive"
            >
              <X className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: EASE }}
            onSubmit={onSubmit}
          >
            <div className="flex gap-2">
              <div className="relative flex-1">
                <BadgePercent
                  className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gold"
                  strokeWidth={1.5}
                />
                <input
                  type="text"
                  value={value}
                  onChange={(e) => {
                    setValue(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="كود الخصم"
                  dir="ltr"
                  className={cn(
                    'w-full rounded-full border border-dashed bg-blush-50 py-2.5 pl-3 pr-10 text-left text-sm font-semibold tracking-wider outline-none transition-colors placeholder:text-right placeholder:font-normal placeholder:tracking-normal placeholder:text-ink-soft/70',
                    error ? 'border-destructive' : 'border-gold/70 focus:border-gold',
                  )}
                />
              </div>
              <button
                type="submit"
                className="rounded-full bg-plum px-5 text-sm font-bold text-blush-50 transition-colors hover:bg-mauve"
              >
                تطبيق
              </button>
            </div>
            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25, ease: EASE }}
                  className="overflow-hidden pt-1.5 text-xs text-destructive"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
