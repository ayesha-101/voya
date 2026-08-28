import "server-only";
import { API_URL, DEMO_MODE } from "./api";
import { demoCategories, demoProducts } from "@/data/demo-catalog";
import type { Category, Product } from "./types";

/**
 * جلب البيانات على الخادم لصفحات Next — بلا توكن، بيانات عامة فقط.
 * حين لا يكون NEXT_PUBLIC_API_URL مضبوطًا يعمل المتجر على كتالوج العرض
 * المضمّن، فيمكن نشر الواجهة وحدها دون خادم ولا قاعدة بيانات.
 */
async function get<T>(path: string, tag = "products", revalidate = 60): Promise<T> {
  // الوسم يسمح للوحة التحكّم بإبطال الكاش فور تعديل منتج،
  // وإعادة التحقق الزمنية شبكة أمان إن فات نداء الإبطال.
  const res = await fetch(`${API_URL}${path}`, { next: { revalidate, tags: [tag] } });
  if (!res.ok) {
    throw new Error(`فشل جلب ${path}: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export type ProductQuery = {
  category?: string;
  q?: string;
  sort?: string;
  limit?: number;
};

const SORTERS: Record<string, (a: Product, b: Product) => number> = {
  featured: (a, b) => b.reviews - a.reviews || b.rating - a.rating,
  "price-asc": (a, b) => a.price - b.price,
  "price-desc": (a, b) => b.price - a.price,
  rating: (a, b) => b.rating - a.rating || b.reviews - a.reviews,
  discount: (a, b) => discount(b) - discount(a),
  newest: (a, b) => b.id - a.id,
};

const discount = (p: Product) =>
  p.compareAt ? (p.compareAt - p.price) / p.compareAt : 0;

/** يطبّق نفس فلترة الخادم وفرزه على الكتالوج المضمّن. */
function demoQuery({ category, q, sort = "featured", limit = 100 }: ProductQuery) {
  let list = demoProducts;

  if (category && category !== "all") {
    list = list.filter((p) => p.category === category);
  }
  if (q) {
    const needle = q.trim().toLowerCase();
    list = list.filter((p) =>
      [p.name, p.nameEn, p.short, p.description, ...p.ingredients]
        .join(" ")
        .toLowerCase()
        .includes(needle),
    );
  }
  if (sort === "discount") list = list.filter((p) => p.compareAt);

  const sorted = [...list].sort(SORTERS[sort] ?? SORTERS.featured);
  return { products: sorted.slice(0, limit), total: sorted.length };
}

export async function fetchProducts(params: ProductQuery = {}) {
  if (DEMO_MODE) return demoQuery(params);

  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") qs.set(k, String(v));
  }
  const suffix = qs.toString() ? `?${qs}` : "";
  return get<{ products: Product[]; total: number }>(`/api/products${suffix}`);
}

export async function fetchProduct(slug: string) {
  if (DEMO_MODE) {
    const product = demoProducts.find((p) => p.slug === slug);
    if (!product) throw new Error("المنتج غير موجود");
    const related = demoProducts
      .filter((p) => p.slug !== slug)
      .sort(
        (a, b) =>
          Number(b.category === product.category) -
            Number(a.category === product.category) || b.reviews - a.reviews,
      )
      .slice(0, 4);
    return { product, related };
  }

  return get<{ product: Product; related: Product[] }>(
    `/api/products/${encodeURIComponent(slug)}`,
  );
}

export async function fetchCategories() {
  if (DEMO_MODE) return demoCategories;
  const { categories } = await get<{ categories: Category[] }>(
    "/api/categories",
    "categories",
  );
  return categories;
}
