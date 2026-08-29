"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import type { Product } from "@/lib/types";
import { ProductCard } from "@/components/ProductCard";
import SectionHeader from "@/components/home/SectionHeader";
import { cn } from "@/lib/utils";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const TABS = [
  { key: "all", label: "الكل" },
  { key: "hair-care", label: "شعر" },
  { key: "skin-care", label: "بشرة" },
  { key: "makeup", label: "مكياج" },
] as const;

export default function BestSellers({ products }: { products: Product[] }) {
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("all");

  const shown = useMemo(() => {
    // «الأكثر مبيعًا» يُشتقّ من عدد المراجعات لأن البيانات تأتي من القاعدة
    const base =
      tab === "all"
        ? [...products].sort((a, b) => b.reviews - a.reviews)
        : products.filter((p) => p.category === tab);
    return base.slice(0, 4);
  }, [tab, products]);

  return (
    <section className="bg-cream relative overflow-hidden py-20 md:py-24">
      {/* بتلة ضخمة باهتة كزخرفة */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/petal.svg"
        alt=""
        aria-hidden
        className="pointer-events-none absolute -top-24 -left-24 w-[420px] rotate-45 opacity-[0.12]"
      />
      <div className="container-voya relative">
        <SectionHeader
          label="الأكثر مبيعًا"
          title="الأحبّ لدى عميلاتنا 🌸"
          action={
            <Link
              href="/products"
              className="text-rose-deep hover:text-mauve group flex items-center gap-1.5 text-sm font-bold transition-colors"
            >
              عرض الكل
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" strokeWidth={1.5} />
            </Link>
          }
        />

        <div className="mb-8 flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={cn(
                "rounded-full px-5 py-2 text-[13px] font-bold transition-all duration-300",
                tab === t.key
                  ? "bg-gradient-rose shadow-card text-white"
                  : "bg-blush-200 text-mauve hover:bg-blush-200/70",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <motion.div layout className="grid grid-cols-2 gap-3 md:gap-6 lg:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {shown.map((p, i) => (
              <motion.div
                key={p.slug}
                layout
                initial={{ opacity: 0, y: 44 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={{ duration: 0.5, delay: i * 0.1, ease: EASE }}
              >
                <ProductCard product={p} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
