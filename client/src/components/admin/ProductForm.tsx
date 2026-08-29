"use client";

import { useState } from "react";
import { ApiError } from "@/lib/api";
import type { Category, Product, Shape } from "@/lib/types";
import { ProductArt } from "../ProductArt";

export type ProductDraft = {
  slug: string;
  name: string;
  nameEn: string;
  category: string;
  price: number;
  compareAt: number | null;
  size: string;
  rating: number;
  reviews: number;
  badge: string | null;
  short: string;
  description: string;
  howToUse: string;
  benefits: string[];
  ingredients: string[];
  shape: Shape;
  tone: [string, string];
  stock: number;
  isActive: boolean;
};

const SHAPES: { value: Shape; label: string }[] = [
  { value: "bottle", label: "زجاجة" },
  { value: "jar", label: "برطمان" },
  { value: "tube", label: "أنبوب" },
  { value: "box", label: "علبة" },
  { value: "pouch", label: "كيس" },
];

const field =
  "w-full rounded-xl border border-blush-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-plum-400";

const lines = (v: string) =>
  v.split("\n").map((s) => s.trim()).filter(Boolean);

export function ProductForm({
  product,
  categories,
  onSave,
  onCancel,
}: {
  product: Product | null;
  categories: Category[];
  onSave: (draft: ProductDraft) => Promise<void>;
  onCancel: () => void;
}) {
  const [shape, setShape] = useState<Shape>(product?.shape ?? "bottle");
  const [tone, setTone] = useState<[string, string]>(
    product?.tone ?? ["#c25b8a", "#6b2a48"],
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setFieldErrors({});

    const d = new FormData(e.currentTarget);
    const compareRaw = String(d.get("compareAt") ?? "").trim();
    const badgeRaw = String(d.get("badge") ?? "").trim();

    const draft: ProductDraft = {
      slug: String(d.get("slug") ?? "").trim(),
      name: String(d.get("name") ?? "").trim(),
      nameEn: String(d.get("nameEn") ?? "").trim(),
      category: String(d.get("category") ?? ""),
      price: Number(d.get("price")),
      compareAt: compareRaw ? Number(compareRaw) : null,
      size: String(d.get("size") ?? "").trim(),
      rating: Number(d.get("rating")),
      reviews: Number(d.get("reviews")),
      badge: badgeRaw || null,
      short: String(d.get("short") ?? "").trim(),
      description: String(d.get("description") ?? "").trim(),
      howToUse: String(d.get("howToUse") ?? "").trim(),
      benefits: lines(String(d.get("benefits") ?? "")),
      ingredients: lines(String(d.get("ingredients") ?? "")),
      shape,
      tone,
      stock: Number(d.get("stock")),
      isActive: d.get("isActive") === "on",
    };

    try {
      await onSave(draft);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        if (err.details) {
          setFieldErrors(
            Object.fromEntries(err.details.map((x) => [x.field.split(".")[0], x.message])),
          );
        }
      } else {
        setError("تعذّر الحفظ");
      }
    } finally {
      setBusy(false);
    }
  }

  const err = (name: string) =>
    fieldErrors[name] ? (
      <span className="block text-xs font-bold text-red-600">{fieldErrors[name]}</span>
    ) : null;

  return (
    <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[1.7fr_1fr] lg:items-start">
      <div className="space-y-5 rounded-card border border-blush-200 p-6">
        <h2 className="text-lg font-extrabold text-ink">
          {product ? `تعديل: ${product.name}` : "منتج جديد"}
        </h2>

        {error && (
          <p className="rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700">{error}</p>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1.5">
            <span className="text-[13px] font-bold text-ink">الاسم بالعربية</span>
            <input name="name" required defaultValue={product?.name} className={field} />
            {err("name")}
          </label>
          <label className="space-y-1.5">
            <span className="text-[13px] font-bold text-ink">الاسم بالإنجليزية</span>
            <input name="nameEn" dir="ltr" defaultValue={product?.nameEn} className={`${field} text-start`} />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1.5">
            <span className="text-[13px] font-bold text-ink">المعرّف (slug)</span>
            <input
              name="slug"
              required
              dir="ltr"
              pattern="[a-z0-9\-]+"
              defaultValue={product?.slug}
              placeholder="radiance-serum"
              className={`${field} text-start`}
            />
            {err("slug")}
          </label>
          <label className="space-y-1.5">
            <span className="text-[13px] font-bold text-ink">التصنيف</span>
            <select name="category" required defaultValue={product?.category ?? ""} className={field}>
              <option value="" disabled>اختر التصنيف</option>
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>{c.name}</option>
              ))}
            </select>
            {err("category")}
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <label className="space-y-1.5">
            <span className="text-[13px] font-bold text-ink">السعر (د.إ)</span>
            <input name="price" type="number" min="0" step="0.01" required defaultValue={product?.price} className={field} />
            {err("price")}
          </label>
          <label className="space-y-1.5">
            <span className="text-[13px] font-bold text-ink">سعر قبل الخصم</span>
            <input name="compareAt" type="number" min="0" step="0.01" defaultValue={product?.compareAt ?? ""} className={field} />
            {err("compareAt")}
          </label>
          <label className="space-y-1.5">
            <span className="text-[13px] font-bold text-ink">المخزون</span>
            <input name="stock" type="number" min="0" required defaultValue={product?.stock ?? 0} className={field} />
            {err("stock")}
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <label className="space-y-1.5">
            <span className="text-[13px] font-bold text-ink">الحجم</span>
            <input name="size" defaultValue={product?.size} placeholder="30 مل" className={field} />
          </label>
          <label className="space-y-1.5">
            <span className="text-[13px] font-bold text-ink">التقييم</span>
            <input name="rating" type="number" min="0" max="5" step="0.1" defaultValue={product?.rating ?? 5} className={field} />
          </label>
          <label className="space-y-1.5">
            <span className="text-[13px] font-bold text-ink">عدد المراجعات</span>
            <input name="reviews" type="number" min="0" defaultValue={product?.reviews ?? 0} className={field} />
          </label>
        </div>

        <label className="block space-y-1.5">
          <span className="text-[13px] font-bold text-ink">الشارة (اختياري)</span>
          <input name="badge" defaultValue={product?.badge ?? ""} placeholder="الأكثر مبيعًا" className={field} />
        </label>

        <label className="block space-y-1.5">
          <span className="text-[13px] font-bold text-ink">وصف مختصر</span>
          <input name="short" defaultValue={product?.short} className={field} />
        </label>

        <label className="block space-y-1.5">
          <span className="text-[13px] font-bold text-ink">الوصف الكامل</span>
          <textarea name="description" rows={4} defaultValue={product?.description} className={field} />
        </label>

        <label className="block space-y-1.5">
          <span className="text-[13px] font-bold text-ink">طريقة الاستخدام</span>
          <textarea
            name="howToUse"
            rows={3}
            defaultValue={product?.howToUse}
            placeholder="اغسلي بالشامبو، ثم البلسم لمدة دقيقتين…"
            className={field}
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1.5">
            <span className="text-[13px] font-bold text-ink">المواصفات (سطر لكل بند — مثال: الحجم: 300 مل)</span>
            <textarea name="benefits" rows={4} defaultValue={product?.benefits.join("\n")} className={field} />
          </label>
          <label className="space-y-1.5">
            <span className="text-[13px] font-bold text-ink">المكوّنات (سطر لكل مكوّن)</span>
            <textarea name="ingredients" rows={4} defaultValue={product?.ingredients.join("\n")} className={field} />
          </label>
        </div>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            name="isActive"
            defaultChecked={product?.isActive ?? true}
            className="h-4 w-4 accent-[var(--color-plum-700)]"
          />
          <span className="text-[13px] font-bold text-ink">نشط ومعروض في المتجر</span>
        </label>

        <div className="flex gap-3 border-t border-blush-200 pt-5">
          <button
            type="submit"
            disabled={busy}
            className="rounded-full bg-plum-700 px-8 py-3 font-bold text-white transition hover:bg-plum-800 disabled:opacity-60"
          >
            {busy ? "جارٍ الحفظ…" : "حفظ"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-blush-300 px-8 py-3 font-bold text-ink transition hover:bg-blush-50"
          >
            إلغاء
          </button>
        </div>
      </div>

      <aside className="sticky top-40 space-y-4 rounded-card border border-blush-200 bg-blush-50 p-6">
        <h3 className="font-extrabold text-ink">معاينة الشكل</h3>
        <ProductArt shape={shape} tone={tone} label="معاينة" className="mx-auto h-56 w-full" />

        <label className="block space-y-1.5">
          <span className="text-[13px] font-bold text-ink">شكل العبوة</span>
          <select
            value={shape}
            onChange={(e) => setShape(e.target.value as Shape)}
            className={field}
          >
            {SHAPES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </label>

        <div className="grid grid-cols-2 gap-3">
          {([0, 1] as const).map((i) => (
            <label key={i} className="space-y-1.5">
              <span className="text-[13px] font-bold text-ink">
                {i === 0 ? "اللون الأول" : "اللون الثاني"}
              </span>
              <input
                type="color"
                value={tone[i]}
                onChange={(e) =>
                  setTone((prev) => {
                    const next: [string, string] = [...prev];
                    next[i] = e.target.value;
                    return next;
                  })
                }
                className="h-10 w-full cursor-pointer rounded-xl border border-blush-300 bg-white"
              />
            </label>
          ))}
        </div>
      </aside>
    </form>
  );
}
