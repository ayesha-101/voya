import { Suspense } from "react";
import type { Metadata } from "next";
import { ProductCard } from "@/components/ProductCard";
import { ProductFilters } from "@/components/ProductFilters";
import { fetchCategories, fetchProducts } from "@/lib/server-api";

export const metadata: Metadata = {
  title: "كل المنتجات",
  description: "تصفّح مجموعة ڤويا الكاملة للعناية بالبشرة والجسم والشعر.",
};

const SORTS = ["featured", "price-asc", "price-desc", "rating", "discount", "newest"];

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; sort?: string; q?: string }>;
}) {
  const { category, sort, q } = await searchParams;

  const [categories, result] = await Promise.all([
    fetchCategories(),
    fetchProducts({
      category,
      q,
      // نُمرّر الفرز فقط إن كان معروفًا، فلا يصل إدخال المستخدم للخادم كما هو
      sort: sort && SORTS.includes(sort) ? sort : "featured",
      limit: 100,
    }),
  ]);

  const cat = category ? categories.find((c) => c.slug === category) : undefined;

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
        <ProductFilters categories={categories} total={result.total} />
      </Suspense>

      {result.products.length === 0 ? (
        <div className="rounded-card border border-dashed border-sand-300 bg-sand-50 py-20 text-center">
          <p className="text-lg font-bold text-ink">لا توجد نتائج مطابقة</p>
          <p className="mt-2 text-sm text-muted">
            جرّب كلمة بحث أخرى أو تصفّح كل المنتجات.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {result.products.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
