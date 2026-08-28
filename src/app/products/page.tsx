import { Suspense } from "react";
import type { Metadata } from "next";
import { ProductCard } from "@/components/ProductCard";
import { ProductFilters } from "@/components/ProductFilters";
import { byCategory, getCategory, type Product } from "@/data/products";
import { discountPercent } from "@/lib/format";

export const metadata: Metadata = {
  title: "كل المنتجات",
  description: "تصفّح مجموعة ڤويا الكاملة للعناية بالبشرة والجسم والشعر.",
};

function sortProducts(list: Product[], sort?: string) {
  const items = [...list];
  switch (sort) {
    case "price-asc":
      return items.sort((a, b) => a.price - b.price);
    case "price-desc":
      return items.sort((a, b) => b.price - a.price);
    case "rating":
      return items.sort((a, b) => b.rating - a.rating);
    case "discount":
      return items
        .filter((p) => p.compareAt)
        .sort(
          (a, b) =>
            discountPercent(b.price, b.compareAt) - discountPercent(a.price, a.compareAt),
        );
    default:
      return items.sort((a, b) => b.reviews - a.reviews);
  }
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; sort?: string; q?: string }>;
}) {
  const { category, sort, q } = await searchParams;

  let list = byCategory(category);

  if (q) {
    const needle = q.trim().toLowerCase();
    list = list.filter((p) =>
      [p.name, p.nameEn, p.short, p.description, ...p.ingredients]
        .join(" ")
        .toLowerCase()
        .includes(needle),
    );
  }

  const results = sortProducts(list, sort);
  const cat = category ? getCategory(category) : undefined;

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-ink sm:text-4xl">
          {q ? `نتائج البحث عن «${q}»` : (cat?.name ?? "كل المنتجات")}
        </h1>
        <p className="mt-2 text-sm text-muted">
          {cat?.blurb ?? "مجموعة ڤويا الكاملة — منتجات أصلية مختارة بعناية"}
        </p>
        <span className="mt-3 block h-1 w-14 rounded-full bg-gold-500" />
      </header>

      <Suspense fallback={<div className="mb-8 h-24" />}>
        <ProductFilters total={results.length} />
      </Suspense>

      {results.length === 0 ? (
        <div className="rounded-card border border-dashed border-sand-300 bg-sand-50 py-20 text-center">
          <p className="text-lg font-bold text-ink">لا توجد نتائج مطابقة</p>
          <p className="mt-2 text-sm text-muted">
            جرّب كلمة بحث أخرى أو تصفّح كل المنتجات.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {results.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
