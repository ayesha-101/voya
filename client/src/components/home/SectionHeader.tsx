"use client";

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function SectionHeader({
  label,
  title,
  action,
  className,
  light = false,
}: {
  label?: string;
  title: string;
  action?: ReactNode;
  className?: string;
  light?: boolean;
}) {
  return (
    <div className={cn('mb-10 flex items-end justify-between gap-6 md:mb-14', className)}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ duration: 0.7, ease: EASE }}
      >
        {label && (
          <span className={cn('text-xs font-bold tracking-[0.15em]', light ? 'text-gold' : 'text-mauve')}>{label}</span>
        )}
        <h2
          className={cn(
            'mt-2 font-heading text-[26px] font-semibold leading-[1.3] md:text-[38px]',
            light ? 'text-blush-50' : 'text-plum',
          )}
        >
          {title}
        </h2>
        {/* gold thread */}
        <img src="/ornament-thread.svg" alt="" aria-hidden className="mt-3 h-5 w-40" />
      </motion.div>
      {action && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.1 }}
          className="shrink-0"
        >
          {action}
        </motion.div>
      )}
    </div>
  );
}
