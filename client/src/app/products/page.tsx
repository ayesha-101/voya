import { Suspense } from "react";
import type { Metadata } from "next";
import { ProductGrid } from "@/components/ProductGrid";
import { ProductFilters } from "@/components/ProductFilters";
import { ProductsHeading } from "@/components/ProductsHeading";
import { fetchCategories, fetchProducts } from "@/lib/server-api";

export const metadata: Metadata = {
  title: "كل المنتجات",
  description: "تصفّحي مجموعة ڤويا الكاملة — عناية بالشعر والبشرة ومكياج وعطور.",
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

  const current = category ? categories.find((c) => c.slug === category) : undefined;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <ProductsHeading category={current} query={q} />

      <Suspense fallback={<div className="mb-8 h-28" />}>
        <ProductFilters categories={categories} total={result.total} />
      </Suspense>

      <ProductGrid products={result.products} />
    </div>
  );
}
