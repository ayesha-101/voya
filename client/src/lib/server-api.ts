import "server-only";
import { API_URL } from "./api";
import type { Category, Product } from "./types";

/**
 * جلب البيانات على الخادم لصفحات Next — بلا توكن، بيانات عامة فقط.
 * نستخدم إعادة التحقق كل 60 ثانية حتى لا تُبنى الصفحات من بيانات قديمة.
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

export async function fetchProducts(params: ProductQuery = {}) {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") qs.set(k, String(v));
  }
  const suffix = qs.toString() ? `?${qs}` : "";
  return get<{ products: Product[]; total: number }>(`/api/products${suffix}`);
}

export async function fetchProduct(slug: string) {
  return get<{ product: Product; related: Product[] }>(
    `/api/products/${encodeURIComponent(slug)}`,
  );
}

export async function fetchCategories() {
  const { categories } = await get<{ categories: Category[] }>("/api/categories", "categories");
  return categories;
}
