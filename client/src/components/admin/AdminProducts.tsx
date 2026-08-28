"use client";

import { useCallback, useEffect, useState } from "react";
import { api, ApiError, revalidateStore } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import type { Category, Product } from "@/lib/types";
import { ProductForm, type ProductDraft } from "./ProductForm";

export function AdminProducts() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editing, setEditing] = useState<Product | "new" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busySlug, setBusySlug] = useState<string | null>(null);

  // زيادة العدّاد تُعيد تشغيل التحميل بعد كل حفظ أو أرشفة
  const [reloadKey, setReloadKey] = useState(0);
  const reload = useCallback(() => setReloadKey((n) => n + 1), []);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [p, c] = await Promise.all([
          api<{ products: Product[] }>("/api/admin/products"),
          api<{ categories: Category[] }>("/api/categories", { auth: false }),
        ]);
        if (cancelled) return;
        setProducts(p.products);
        setCategories(c.categories);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "تعذّر تحميل المنتجات");
        }
      }
    };
    void load();

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  async function save(draft: ProductDraft, original: Product | null) {
    const path = original
      ? `/api/admin/products/${encodeURIComponent(original.slug)}`
      : "/api/admin/products";
    await api<{ product: Product }>(path, {
      method: original ? "PUT" : "POST",
      json: draft,
    });
    await revalidateStore();
    setEditing(null);
    reload();
  }

  async function archive(product: Product) {
    if (!confirm(`أرشفة «${product.name}»؟ سيختفي من المتجر ويمكن إعادته لاحقًا.`)) return;
    setBusySlug(product.slug);
    setError(null);
    try {
      await api(`/api/admin/products/${encodeURIComponent(product.slug)}`, {
        method: "DELETE",
      });
      await revalidateStore();
      reload();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "تعذّرت الأرشفة");
    } finally {
      setBusySlug(null);
    }
  }

  if (editing) {
    return (
      <ProductForm
        product={editing === "new" ? null : editing}
        categories={categories}
        onCancel={() => setEditing(null)}
        onSave={(draft) => save(draft, editing === "new" ? null : editing)}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="nums text-sm text-muted">{products?.length ?? 0} منتج</p>
        <button
          type="button"
          onClick={() => setEditing("new")}
          className="rounded-full bg-plum-700 px-6 py-3 text-sm font-bold text-white transition hover:bg-plum-800"
        >
          + منتج جديد
        </button>
      </div>

      {error && (
        <p className="rounded-card bg-red-50 p-4 text-sm font-bold text-red-700">{error}</p>
      )}

      {products === null ? (
        <div className="h-96 animate-pulse rounded-card bg-blush-100" />
      ) : (
        <div className="overflow-x-auto rounded-card border border-blush-200">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="border-b border-blush-200 bg-blush-50 text-xs text-muted">
              <tr>
                <th className="p-3 text-start font-bold">المنتج</th>
                <th className="p-3 text-start font-bold">التصنيف</th>
                <th className="p-3 text-start font-bold">السعر</th>
                <th className="p-3 text-start font-bold">المخزون</th>
                <th className="p-3 text-start font-bold">الحالة</th>
                <th className="p-3 text-start font-bold">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.slug} className="border-b border-blush-100 last:border-0">
                  <td className="p-3">
                    <span className="block font-bold text-ink">{p.name}</span>
                    <span className="block text-xs text-muted" dir="ltr">{p.slug}</span>
                  </td>
                  <td className="p-3 text-muted">{p.categoryName}</td>
                  <td className="nums p-3 font-bold">{formatPrice(p.price)}</td>
                  <td className="p-3">
                    <span
                      className={`nums rounded-full px-2.5 py-1 text-xs font-bold ${
                        p.stock === 0
                          ? "bg-red-100 text-red-700"
                          : p.stock <= 10
                            ? "bg-rose-400/25 text-rose-600"
                            : "bg-plum-100 text-plum-800"
                      }`}
                    >
                      {p.stock}
                    </span>
                  </td>
                  <td className="p-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                        p.isActive ? "bg-plum-100 text-plum-800" : "bg-blush-200 text-muted"
                      }`}
                    >
                      {p.isActive ? "نشط" : "مؤرشف"}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setEditing(p)}
                        className="rounded-full border border-blush-300 px-3 py-1.5 text-xs font-bold text-plum-700 transition hover:border-plum-400"
                      >
                        تعديل
                      </button>
                      {p.isActive && (
                        <button
                          type="button"
                          onClick={() => void archive(p)}
                          disabled={busySlug === p.slug}
                          className="rounded-full border border-blush-300 px-3 py-1.5 text-xs font-bold text-muted transition hover:border-red-300 hover:text-red-600 disabled:opacity-50"
                        >
                          أرشفة
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
