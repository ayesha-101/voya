"use client";

import Link from "next/link";
import type { Product } from "@/lib/types";
import { ProductCard } from "./ProductCard";
import { useT } from "./LangProvider";

export function ProductGrid({ products }: { products: Product[] }) {
  const t = useT();

  if (products.length === 0) {
    return (
      <div className="rounded-card border border-dashed border-blush-300 bg-blush-50 py-20 text-center">
        <p className="text-lg font-bold text-plum-900">{t.filters.empty}</p>
        <p className="mt-2 text-sm text-muted">{t.filters.emptyHint}</p>
        <Link
          href="/products"
          className="mt-6 inline-block rounded-full bg-plum-600 px-8 py-3.5 font-bold text-white transition hover:bg-plum-700"
        >
          {t.navExtra.all}
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p.slug} product={p} />
      ))}
    </div>
  );
}
