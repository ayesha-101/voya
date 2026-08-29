"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api, DEMO_MODE } from "@/lib/api";
import { demoProducts } from "@/data/demo-catalog";
import type { Product } from "@/lib/types";
import { useT } from "./LangProvider";
import { ProductCard } from "./ProductCard";
import { useWishlist } from "./useWishlist";

export function WishlistView() {
  const { slugs, count, clear } = useWishlist();
  const t = useT();
  const [loaded, setLoaded] = useState<Product[] | null>(null);
  // قائمة فارغة لا تحتاج تحميلًا — تُشتق مباشرة
  const products = slugs.length === 0 ? [] : loaded;

  useEffect(() => {
    if (slugs.length === 0) return;

    let cancelled = false;
    const load = async () => {
      if (DEMO_MODE) {
        const hits = slugs
          .map((s) => demoProducts.find((p) => p.slug === s))
          .filter((p): p is Product => Boolean(p));
        if (!cancelled) setLoaded(hits);
        return;
      }
      // منتج قد يكون أُرشف — نتجاهله بدل إفشال الصفحة كلها
      const found = await Promise.all(
        slugs.map((s) =>
          api<{ product: Product }>(`/api/products/${encodeURIComponent(s)}`, {
            auth: false,
          })
            .then((r) => r.product)
            .catch(() => null),
        ),
      );
      if (!cancelled) setLoaded(found.filter((p): p is Product => Boolean(p)));
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [slugs]);

  if (products === null) {
    return <div className="h-64 animate-pulse rounded-card bg-blush-100" />;
  }

  if (products.length === 0) {
    return (
      <div className="rounded-card border border-dashed border-blush-300 bg-blush-50 py-20 text-center">
        <p className="text-lg font-bold text-plum-900">{t.wish.empty}</p>
        <p className="mt-2 text-sm text-muted">{t.wish.emptyHint}</p>
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
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="nums text-sm text-muted">
          {count} {t.filters.results}
        </p>
        <button
          type="button"
          onClick={clear}
          className="text-sm font-bold text-muted transition hover:text-red-600"
        >
          {t.wish.clear}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.slug} product={p} />
        ))}
      </div>
    </div>
  );
}
