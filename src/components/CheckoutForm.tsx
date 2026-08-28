"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "./useCart";
import { formatPrice } from "@/lib/format";
import { site } from "@/data/site";

const emirates = [
  "دبي",
  "أبوظبي",
  "الشارقة",
  "عجمان",
  "رأس الخيمة",
  "الفجيرة",
  "أم القيوين",
];

type Payment = "cod" | "card";

export function CheckoutForm() {
  const { items, subtotal, shipping, total, ready, clear, count } = useCart();
  const [payment, setPayment] = useState<Payment>("cod");
  const [orderId, setOrderId] = useState<string | null>(null);

  if (!ready) {
    return <div className="h-72 animate-pulse rounded-card bg-sand-100" />;
  }

  if (orderId) {
    return (
      <div className="rounded-card border border-sea-200 bg-sea-50 p-10 text-center">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-sea-700 text-3xl text-white">
          ✓
        </span>
        <h2 className="mt-5 text-2xl font-extrabold text-ink">تم استلام طلبك بنجاح</h2>
        <p className="nums mt-2 text-sm text-muted">رقم الطلب: {orderId}</p>
        <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-ink">
          سيتواصل معك فريقنا خلال ساعات لتأكيد الطلب. التوصيل المتوقع خلال 24 – 48
          ساعة داخل {site.country}.
        </p>
        <Link
          href="/products"
          className="mt-7 inline-block rounded-full bg-sea-700 px-8 py-3.5 font-bold text-white transition hover:bg-sea-800"
        >
          متابعة التسوّق
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-card border border-dashed border-sand-300 bg-sand-50 py-20 text-center">
        <p className="text-lg font-bold text-ink">لا توجد منتجات في السلة</p>
        <Link
          href="/products"
          className="mt-6 inline-block rounded-full bg-sea-700 px-8 py-3.5 font-bold text-white transition hover:bg-sea-800"
        >
          تصفّح المنتجات
        </Link>
      </div>
    );
  }

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // نموذج تجريبي: هنا يُستبدل بنداء إلى واجهة الطلبات أو بوابة الدفع.
    setOrderId(`VY-${Date.now().toString().slice(-8)}`);
    clear();
  }

  const field =
    "w-full rounded-xl border border-sand-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-sea-400";

  return (
    <form onSubmit={submit} className="grid gap-8 lg:grid-cols-[1.6fr_1fr] lg:items-start">
      <div className="space-y-8">
        <fieldset className="space-y-4 rounded-card border border-sand-200 p-6">
          <legend className="px-2 text-sm font-extrabold text-ink">بيانات التوصيل</legend>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1.5">
              <span className="text-[13px] font-bold text-ink">الاسم الكامل</span>
              <input name="name" required autoComplete="name" className={field} />
            </label>
            <label className="space-y-1.5">
              <span className="text-[13px] font-bold text-ink">رقم الجوال</span>
              <input
                name="phone"
                required
                type="tel"
                dir="ltr"
                inputMode="tel"
                placeholder="+971 5X XXX XXXX"
                autoComplete="tel"
                className={`${field} text-start`}
              />
            </label>
          </div>

          <label className="block space-y-1.5">
            <span className="text-[13px] font-bold text-ink">البريد الإلكتروني</span>
            <input
              name="email"
              type="email"
              required
              dir="ltr"
              autoComplete="email"
              className={`${field} text-start`}
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1.5">
              <span className="text-[13px] font-bold text-ink">الإمارة</span>
              <select name="emirate" required defaultValue="" className={field}>
                <option value="" disabled>
                  اختر الإمارة
                </option>
                {emirates.map((e) => (
                  <option key={e} value={e}>
                    {e}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1.5">
              <span className="text-[13px] font-bold text-ink">المنطقة / الحي</span>
              <input name="area" required className={field} />
            </label>
          </div>

          <label className="block space-y-1.5">
            <span className="text-[13px] font-bold text-ink">العنوان التفصيلي</span>
            <textarea
              name="address"
              required
              rows={3}
              placeholder="اسم الشارع، رقم المبنى، رقم الشقة، أقرب معلم"
              className={field}
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-[13px] font-bold text-ink">ملاحظات (اختياري)</span>
            <textarea name="notes" rows={2} className={field} />
          </label>
        </fieldset>

        <fieldset className="space-y-3 rounded-card border border-sand-200 p-6">
          <legend className="px-2 text-sm font-extrabold text-ink">طريقة الدفع</legend>

          {(
            [
              {
                value: "cod" as const,
                title: "الدفع عند الاستلام",
                body: "ادفع نقدًا للمندوب عند وصول الطلب",
              },
              {
                value: "card" as const,
                title: "بطاقة ائتمانية",
                body: "فيزا، ماستركارد، أبل باي",
              },
            ]
          ).map((opt) => (
            <label
              key={opt.value}
              className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
                payment === opt.value
                  ? "border-sea-600 bg-sea-50"
                  : "border-sand-200 hover:border-sand-300"
              }`}
            >
              <input
                type="radio"
                name="payment"
                value={opt.value}
                checked={payment === opt.value}
                onChange={() => setPayment(opt.value)}
                className="mt-1 h-4 w-4 accent-[var(--color-sea-700)]"
              />
              <span>
                <span className="block text-sm font-bold text-ink">{opt.title}</span>
                <span className="block text-xs text-muted">{opt.body}</span>
              </span>
            </label>
          ))}

          {payment === "card" && (
            <p className="rounded-xl bg-sand-100 p-3 text-[13px] leading-6 text-muted">
              الدفع بالبطاقة يحتاج ربط بوابة دفع (Stripe / Tap / Checkout.com).
              حاليًا يعمل الدفع عند الاستلام فقط في هذه النسخة التجريبية.
            </p>
          )}
        </fieldset>
      </div>

      <aside className="sticky top-40 space-y-4 rounded-card border border-sand-200 bg-sand-50 p-6">
        <h2 className="text-lg font-extrabold text-ink">
          ملخّص الطلب <span className="nums text-sm font-normal text-muted">({count})</span>
        </h2>

        <ul className="max-h-64 space-y-3 overflow-y-auto border-b border-sand-200 pb-4 text-sm">
          {items.map(({ product, qty }) => (
            <li key={product.slug} className="flex items-start justify-between gap-3">
              <span className="text-ink">{product.name}</span>
              <span className="nums shrink-0 text-muted">×{qty}</span>
              <span className="nums shrink-0 font-bold">
                {formatPrice(product.price * qty)}
              </span>
            </li>
          ))}
        </ul>

        <dl className="space-y-3 border-b border-sand-200 pb-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted">المجموع الفرعي</dt>
            <dd className="nums font-bold">{formatPrice(subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">الشحن</dt>
            <dd className="nums font-bold">
              {shipping === 0 ? "مجاني" : formatPrice(shipping)}
            </dd>
          </div>
        </dl>

        <div className="flex items-baseline justify-between">
          <span className="font-bold text-ink">الإجمالي</span>
          <span className="nums text-2xl font-extrabold text-sea-700">
            {formatPrice(total)}
          </span>
        </div>

        <button
          type="submit"
          className="w-full rounded-full bg-sea-700 px-6 py-4 font-bold text-white transition hover:bg-sea-800 active:scale-[0.99]"
        >
          تأكيد الطلب
        </button>
        <p className="text-center text-[11px] leading-5 text-muted">
          بالضغط على تأكيد الطلب فإنك توافق على شروط الاستخدام وسياسة الاسترجاع.
        </p>
      </aside>
    </form>
  );
}
