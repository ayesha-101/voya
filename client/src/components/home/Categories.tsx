"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import type { Category } from "@/lib/types";
import { categoryImage, productCountLabel } from "@/lib/voya";
import SectionHeader from "@/components/home/SectionHeader";
import { cn } from "@/lib/utils";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function Categories({ categories }: { categories: Category[] }) {
  return (
    <section id="categories" className="bg-blush-50 py-20 md:py-24">
      <div className="container-voya">
        <SectionHeader
          label="الفئات"
          title="تسوّقي حسب مزاجكِ"
          action={
            <span className="text-ink-soft hidden text-sm md:block">
              ثماني عوالم من الجمال، كلها مجربة ومضمونة
            </span>
          }
        />

        <div className="max-md:no-scrollbar grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-6 max-md:auto-cols-[65%] max-md:snap-x max-md:snap-mandatory max-md:grid-flow-col max-md:grid-cols-none max-md:gap-4 max-md:overflow-x-auto max-md:pb-4">
          {categories.map((c, i) => (
            <motion.div
              key={c.slug}
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.7, delay: i * 0.09, ease: EASE }}
              className="max-md:snap-start"
            >
              <Link
                href={`/products?category=${c.slug}`}
                className={cn(
                  "group rounded-signature shadow-card hover:shadow-card-hover block overflow-hidden bg-white transition-all duration-500 hover:-translate-y-1.5",
                  c.slug === "uae" && "ring-gold/70 ring-1",
                )}
              >
                <div className="bg-cream relative aspect-[4/5] overflow-hidden">
                  <Image
                    src={categoryImage(c)}
                    alt={c.name}
                    fill
                    sizes="(min-width: 768px) 300px, 65vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.08]"
                  />
                  {c.slug === "uae" && (
                    <span className="border-gold absolute top-3 right-3 rounded-full border bg-white/90 px-3 py-1 text-xs font-bold text-[#8A6A2F]">
                      🇦🇪 إماراتي
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between px-4 py-4">
                  <div>
                    <h3 className="font-heading text-plum group-hover:text-rose-deep text-[17px] font-semibold transition-colors duration-300 md:text-lg">
                      {c.name}
                    </h3>
                    <p className="tnum text-ink-soft mt-0.5 text-xs">
                      {productCountLabel(c.productCount)}
                    </p>
                  </div>
                  <span className="bg-blush-100 text-rose flex h-8 w-8 -translate-x-1 items-center justify-center rounded-full opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
                    <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
