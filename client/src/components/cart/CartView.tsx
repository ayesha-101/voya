"use client";

import { useCallback, useState } from 'react';
import Link from "next/link";
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ChevronLeft, Flower2 } from 'lucide-react';
import type { TemplateCartItem } from "@/components/cartAdapter";
import type { Product } from "@/lib/types";
import { useCart } from "@/components/CartProvider";
import { toTemplateItem } from "@/components/cartAdapter";

import { ProductCard } from "@/components/ProductCard";
import CartLineItem from '@/components/cart/CartLineItem';
import CartSummary from '@/components/cart/CartSummary';
import FreeShippingProgress from '@/components/cart/FreeShippingProgress';
import UndoBar from '@/components/cart/UndoBar';
import Upsell from '@/components/cart/Upsell';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

function EmptyState({ bestSellers }: { bestSellers: Product[] }) {
  return (
    <div className="container-voya py-16 md:py-24">
      <div className="mx-auto flex max-w-md flex-col items-center text-center">
        <motion.div
          initial={{ rotate: 0, opacity: 0, scale: 0.8 }}
          animate={{ rotate: [0, -4, 4, -4, 0], opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: EASE, times: [0, 0.25, 0.5, 0.75, 1] }}
          className="relative flex h-36 w-36 items-center justify-center rounded-full bg-white shadow-card"
        >
          <img src="/petal.svg" alt="" aria-hidden className="absolute -right-2 top-3 h-6 w-6 opacity-60" />
          <img src="/petal.svg" alt="" aria-hidden className="absolute -left-1 bottom-4 h-4 w-4 opacity-40" />
          <Flower2 className="h-20 w-20 text-rose" strokeWidth={1} />
        </motion.div>
        <h1 className="mt-8 text-3xl font-bold md:text-4xl">سلتكِ فارغة…</h1>
        <p className="font-body mt-3 leading-relaxed text-ink-soft">حان وقت الدلال 🌸 دلّلي نفسكِ بشيء جميل.</p>
        <Link href="/products"
          className="mt-7 rounded-full bg-gradient-rose px-10 py-3.5 text-sm font-bold text-white transition-shadow duration-300 hover:shadow-card-hover"
        >
          تسوّقي الآن
        </Link>
      </div>

      {bestSellers.length > 0 && (
        <section className="mt-16">
          <h2 className="flex items-center gap-3 text-2xl font-bold md:text-[28px]">
            الأكثر مبيعًا
            <img src="/ornament-thread.svg" alt="" aria-hidden className="h-3.5 w-24 opacity-80" />
          </h2>
          <div className="mt-6 grid grid-cols-2 gap-3 md:gap-6 lg:grid-cols-4">
            {bestSellers.map((p: Product) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default function CartView({ catalog }: { catalog: Product[] }) {
  const { items: rawItems, subtotal, count, remove, add } = useCart();
  const items = rawItems.map(toTemplateItem);
  const [removed, setRemoved] = useState<TemplateCartItem | null>(null);

  const handleRemove = useCallback(
    (item: TemplateCartItem) => {
      void remove(item.product.id);
      setRemoved(item);
    },
    [remove],
  );

  // التراجع يعيد البند بمعرّفه من الكتالوج الحقيقي، فالمخزون يُفحص من جديد
  const handleUndo = useCallback(() => {
    if (!removed) return;
    const product = catalog.find((p) => p.slug === removed.product.id);
    if (product) void add(product, removed.qty);
    setRemoved(null);
  }, [removed, add, catalog]);

  if (items.length === 0) {
    return (
      <>
        <UndoBar
          label={removed?.product.name ?? null}
          onUndo={handleUndo}
          onDismiss={() => setRemoved(null)}
        />
        <EmptyState bestSellers={catalog.slice(0, 4)} />
      </>
    );
  }

  return (
    <div className="container-voya py-10 md:py-14">
      <UndoBar
        label={removed?.product.name ?? null}
        onUndo={handleUndo}
        onDismiss={() => setRemoved(null)}
      />

      {/* header */}
      <nav aria-label="مسار التنقل" className="flex items-center gap-1.5 text-[13px] text-ink-soft">
        <Link href="/" className="transition-colors hover:text-rose-deep">الرئيسية</Link>
        <ChevronLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
        <span className="font-medium text-rose-deep">السلة</span>
      </nav>
      <div className="mt-4 flex flex-wrap items-end gap-x-4 gap-y-2">
        <h1 className="flex items-center gap-2.5 text-[34px] font-bold leading-tight md:text-5xl">
          {'سلة التسوق'.split(' ').map((word, i) => (
            <motion.span
              key={word}
              initial={{ opacity: 0, y: 26 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE, delay: i * 0.1 }}
              className="inline-block"
            >
              {word}
            </motion.span>
          ))}
          <motion.span
            initial={{ opacity: 0, scale: 0, rotate: -30 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.5, ease: EASE, delay: 0.3 }}
          >
            <Flower2 className="h-8 w-8 text-rose md:h-10 md:w-10" strokeWidth={1.5} />
          </motion.span>
        </h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.25 }}
          className="tnum text-base text-ink-soft"
        >
          لديكِ {count} منتجات في سلتكِ
        </motion.p>
      </div>

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,62fr)_minmax(0,38fr)]">
        {/* items column */}
        <div>
          <FreeShippingProgress subtotal={subtotal} />

          <div className="mt-5 flex flex-col gap-4">
            <AnimatePresence initial={false}>
              {items.map((item, i) => (
                <motion.div
                  key={`${item.product.id}-${item.color ?? ''}`}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: EASE, delay: i * 0.1 }}
                >
                  <CartLineItem item={item} onRemove={handleRemove} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <Link href="/products"
            className="group mt-6 inline-flex items-center gap-2 text-sm font-semibold text-rose-deep transition-colors hover:text-mauve"
          >
            <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" strokeWidth={1.5} />
            متابعة التسوق
          </Link>
        </div>

        {/* summary column */}
        <CartSummary />
      </div>

      <Upsell catalog={catalog} />
    </div>
  );
}
