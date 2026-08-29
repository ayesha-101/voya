"use client";

import { useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Product } from "@/lib/types";

import { ProductCard } from "@/components/ProductCard";
import { cn } from '@/lib/utils';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function SimilarProducts({ product , catalog }: { product: Product; catalog: Product[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const similar = useMemo(() => {
    const others = catalog.filter((p) => p.id !== product.id);
    const sameCat = others.filter((p) => p.category === product.category);
    const rest = others.filter((p) => p.category !== product.category);
    return [...sameCat, ...rest].slice(0, 6);
  }, [product, catalog]);

  const updateArrows = () => {
    const el = trackRef.current;
    if (!el) return;
    const pos = Math.abs(el.scrollLeft);
    const max = el.scrollWidth - el.clientWidth;
    setCanPrev(pos > 8);
    setCanNext(pos < max - 8);
  };

  const scroll = (dir: 'next' | 'prev') => {
    const el = trackRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.8;
    // RTL: revealing more content scrolls towards negative scrollLeft
    const sign = dir === 'next' ? -1 : 1;
    el.scrollBy({ left: sign * amount, behavior: 'smooth' });
  };

  if (similar.length === 0) return null;

  return (
    <section className="container-voya mt-16 md:mt-24">
      <div className="mb-8 flex items-end justify-between gap-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.6, ease: EASE }}
        >
          <span className="text-xs font-bold tracking-[0.03em] text-mauve">دلّلي نفسكِ أكثر</span>
          <h2 className="mt-2 text-[26px] font-bold leading-[1.25] text-plum md:text-[32px]">
            يكمل روتينكِ 🌸
          </h2>
          <img src="/ornament-thread.svg" alt="" aria-hidden className="mt-3 h-5 w-40" />
        </motion.div>

        <div className="hidden gap-2 md:flex">
          <button
            type="button"
            aria-label="السابق"
            onClick={() => scroll('prev')}
            disabled={!canPrev}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-blush-200 bg-white text-plum transition-colors hover:border-rose hover:text-rose-deep disabled:opacity-40"
          >
            <ChevronRight className="h-5 w-5" strokeWidth={1.5} />
          </button>
          <button
            type="button"
            aria-label="التالي"
            onClick={() => scroll('next')}
            disabled={!canNext}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-blush-200 bg-white text-plum transition-colors hover:border-rose hover:text-rose-deep disabled:opacity-40"
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      <div
        ref={trackRef}
        onScroll={updateArrows}
        className="no-scrollbar -mx-6 flex snap-x snap-mandatory gap-3 overflow-x-auto px-6 pb-2 md:mx-0 md:gap-5 md:px-0"
      >
        {similar.map((p, i) => (
          <motion.div
            key={p.slug}
            initial={{ opacity: 0, y: 44 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, ease: EASE, delay: i * 0.09 }}
            className={cn('w-[46%] shrink-0 snap-start sm:w-[38%] lg:w-[calc(25%-15px)]')}
          >
            <ProductCard product={p} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
