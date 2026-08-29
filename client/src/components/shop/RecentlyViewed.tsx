"use client";

import { useEffect, useState } from 'react';
import Link from "next/link";
import { motion } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/voya";
import { getRecentlyViewed } from "@/components/shop/shop-utils";
import { productImages } from "@/lib/voya";
import { useCart } from "@/components/CartProvider";
import { useUI } from "@/components/UIProvider";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/** شريط «شاهدتِه مؤخرًا» — يظهر فقط عند وجود منتجات تمت زيارتها */
export default function RecentlyViewed({ catalog }: { catalog: Product[] }) {
  const [items, setItems] = useState<Product[]>([]);
  const { add } = useCart();
  const { openCart } = useUI();

  useEffect(() => {
    // القراءة من التخزين المحلي لا تصحّ إلا بعد التركيب
    const load = () => setItems(getRecentlyViewed(catalog));
    load();
  }, [catalog]);

  if (items.length === 0) return null;

  return (
    <section className="relative overflow-hidden bg-cream py-14 md:py-16">
      <img
        src="/petal.svg"
        alt=""
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 w-64 -rotate-12 opacity-[0.1]"
      />
      <div className="container-voya relative">
        <h3 className="font-heading text-[22px] font-semibold text-plum md:text-[26px]">
          شاهدتِه مؤخرًا <span className="text-gold">🌸</span>
        </h3>
        <div
          data-lenis-prevent
          className="no-scrollbar -mx-5 mt-6 flex snap-x gap-4 overflow-x-auto px-5 pb-2 md:-mx-10 md:px-10 lg:-mx-16 lg:px-16"
        >
          {items.map((p, i) => (
            <motion.div
              key={p.slug}
              initial={{ opacity: 0, x: -32 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, ease: EASE, delay: i * 0.06 }}
              className="w-[180px] shrink-0 snap-start md:w-[200px]"
            >
              <div className="flex flex-col overflow-hidden rounded-[24px] bg-white shadow-card transition-shadow duration-300 hover:shadow-card-hover">
                <Link href={`/products/${p.slug}`} className="block">
                  <div className="aspect-square overflow-hidden bg-blush-100">
                    <img
                      src={productImages(p)[0]}
                      alt={p.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                    />
                  </div>
                </Link>
                <div className="flex flex-col gap-1 p-3">
                  <Link href={`/products/${p.slug}`} className="transition-colors hover:text-rose-deep">
                    <h4 className="line-clamp-1 text-sm font-semibold text-plum">{p.name}</h4>
                  </Link>
                  <div className="flex items-center justify-between pt-1">
                    <span className="tnum font-heading text-sm font-bold text-rose-deep">{formatPrice(p.price)}</span>
                    <button
                      type="button"
                      aria-label={`أضيفي ${p.name} إلى السلة`}
                      onClick={() => {
                        void add(p, 1).then(openCart);
                        
                      }}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-blush-200 text-rose-deep transition-colors hover:bg-gradient-rose hover:text-white"
                    >
                      <ShoppingBag className="h-4 w-4" strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
