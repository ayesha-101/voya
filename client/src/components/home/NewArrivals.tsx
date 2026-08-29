"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ProductCard } from "@/components/ProductCard";
import SectionHeader from '@/components/home/SectionHeader';
import type { Product } from "@/lib/types";
import { cn } from '@/lib/utils';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];



export default function NewArrivals({ products }: { products: Product[] }) {
  // «وصل حديثًا» = الأحدث إضافةً في القاعدة
  const NEW_PRODUCTS = [...products].sort((a, b) => b.id - a.id).slice(0, 6);
  const trackRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);
  const [pages, setPages] = useState(1);

  const measure = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setPages(Math.max(1, Math.ceil(el.scrollWidth / el.clientWidth)));
    setPage(Math.round(el.scrollLeft / el.clientWidth));
  }, []);

  useEffect(() => {
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [measure]);

  const scrollBy = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>('[data-card]');
    const step = card ? (card.offsetWidth + 16) * 2 : el.clientWidth * 0.8;
    // RTL: «next» scrolls toward negative scrollLeft
    el.scrollBy({ left: dir * -step, behavior: 'smooth' });
  };

  return (
    <section className="bg-blush-100 py-20 md:py-24">
      <div className="container-voya">
        <SectionHeader
          label="جديد المتجر"
          title="وصل حديثًا ✨"
          action={
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => scrollBy(1)}
                aria-label="التالي"
                className="flex h-11 w-11 items-center justify-center rounded-full bg-rose text-white shadow-card transition hover:bg-rose-deep"
              >
                <ChevronRight className="h-5 w-5" strokeWidth={1.5} />
              </button>
              <button
                type="button"
                onClick={() => scrollBy(-1)}
                aria-label="السابق"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-rose/40 text-rose transition hover:bg-rose hover:text-white"
              >
                <ChevronLeft className="h-5 w-5" strokeWidth={1.5} />
              </button>
            </div>
          }
        />
      </div>

      <div className="container-voya">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          transition={{ staggerChildren: 0.08 }}
        >
          <div
            ref={trackRef}
            onScroll={measure}
            className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 pt-1"
            dir="rtl"
          >
            {NEW_PRODUCTS.map((p, i) => (
              <motion.div
                key={p.slug}
                data-card
                variants={{
                  hidden: { opacity: 0, x: -60 },
                  show: { opacity: 1, x: 0, transition: { duration: 0.6, ease: EASE } },
                }}
                className={cn(
                  'w-[68%] shrink-0 snap-start transition-transform duration-500 sm:w-[42%] md:w-[30%] lg:w-[23%]',
                  i === 2 && 'lg:scale-[1.03]',
                )}
              >
                <ProductCard product={p} />
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* progress dots */}
        <div className="mt-6 flex justify-center gap-2">
          {Array.from({ length: pages }).map((_, i) => (
            <span
              key={i}
              className={cn(
                'h-2 rounded-full transition-all duration-500',
                i === Math.min(page, pages - 1) ? 'w-7 bg-rose' : 'w-2 bg-rose/30',
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
