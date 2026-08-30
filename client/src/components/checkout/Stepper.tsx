"use client";

import { Fragment } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const STEPS = ['الشحن', 'الدفع', 'التأكيد'];

/** Animated 3-step stepper — rose circles joined by a gold thread; done: gold ✓. */
export default function Stepper({ current }: { current: number }) {
  return (
    <ol className="flex items-center" aria-label="خطوات إتمام الطلب">
      {STEPS.map((label, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <Fragment key={label}>
            {i > 0 && (
              <li aria-hidden className="relative mx-2 h-[3px] flex-1 overflow-hidden rounded-full bg-blush-200 sm:mx-3">
                <motion.span
                  className="absolute inset-0 origin-right rounded-full bg-gold"
                  initial={false}
                  animate={{ scaleX: i <= current ? 1 : 0 }}
                  transition={{ duration: 0.6, ease: EASE }}
                />
              </li>
            )}
            <li className="flex items-center gap-2">
              <motion.span
                initial={false}
                animate={{ scale: active ? 1.1 : 1 }}
                transition={{ duration: 0.3, ease: EASE }}
                className={cn(
                  'relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-sm font-bold transition-colors duration-300',
                  done && 'border-gold bg-gold text-white',
                  active && 'border-transparent bg-gradient-rose text-white shadow-card',
                  !done && !active && 'border-blush-200 bg-white text-ink-soft',
                )}
              >
                {active && (
                  <span
                    aria-hidden
                    className="absolute inset-0 animate-ping-ring rounded-full bg-rose/40"
                  />
                )}
                {done ? (
                  <Check className="h-4 w-4" strokeWidth={2.5} />
                ) : (
                  <span className="tnum relative">{i + 1}</span>
                )}
              </motion.span>
              <span
                className={cn(
                  'text-sm font-semibold transition-colors duration-300',
                  done && 'text-gold',
                  active && 'text-rose-deep',
                  !done && !active && 'text-ink-soft',
                )}
              >
                {label}
              </span>
            </li>
          </Fragment>
        );
      })}
    </ol>
  );
}
