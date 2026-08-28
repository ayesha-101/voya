"use client";

import Link from "next/link";
import { ProductArt } from "./ProductArt";
import { QuantityStepper } from "./QuantityStepper";
import { useCart } from "./useCart";
import { site } from "@/data/site";
import { formatPrice } from "@/lib/format";

export function CartView() {
  const { items, setQty, remove, subtotal, shipping, total, ready, clear } = useCart();

  if (!ready) {
    return <div className="h-64 animate-pulse rounded-card bg-sand-100" />;
  }

  if (items.length === 0) {
    return (
      <div className="rounded-card border border-dashed border-sand-300 bg-sand-50 py-20 text-center">
        <p className="text-lg font-bold text-ink">سلتك فارغة</p>
        <p className="mt-2 text-sm text-muted">ابدأ التسوّق واختر ما يناسبك.</p>
        <Link
          href="/products"
          className="mt-6 inline-block rounded-full bg-sea-700 px-8 py-3.5 font-bold text-white transition hover:bg-sea-800"
        >
          تصفّح المنتجات
        </Link>
      </div>
    );
  }

  const remaining = site.freeShippingThreshold - subtotal;

  return (
    <div className="grid gap-8 lg:grid-cols-[1.6fr_1fr] lg:items-start">
      <ul className="space-y-4">
        {items.map(({ product, qty }) => (
          <li
            key={product.slug}
            className="flex gap-4 rounded-card border border-sand-200 bg-white p-4"
          >
            <Link
              href={`/products/${product.slug}`}
              className="shrink-0 rounded-xl bg-sand-50 p-2"
            >
              <ProductArt
                shape={product.shape}
                tone={product.tone}
                label={product.name}
                className="h-24 w-20"
              />
            </Link>

            <div className="flex flex-1 flex-col gap-2">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-[15px] font-bold text-ink">
                    <Link href={`/products/${product.slug}`} className="hover:text-sea-600">
                      {product.name}
                    </Link>
                  </h2>
                  <p className="text-xs text-muted">{product.size}</p>
                </div>
                <button
                  type="button"
                  onClick={() => remove(product.slug)}
                  className="text-xs font-bold text-muted transition hover:text-red-600"
                >
                  إزالة
                </button>
              </div>

              <div className="mt-auto flex flex-wrap items-center justify-between gap-3">
                <QuantityStepper
                  value={qty}
                  onChange={(n) => setQty(product.slug, n)}
                  max={product.stock}
                />
                <span className="nums text-lg font-extrabold text-sea-700">
                  {formatPrice(product.price * qty)}
                </span>
              </div>
            </div>
          </li>
        ))}

        <li>
          <button
            type="button"
            onClick={clear}
            className="text-sm font-bold text-muted transition hover:text-red-600"
          >
            إفراغ السلة
          </button>
        </li>
      </ul>

      <aside className="sticky top-40 space-y-4 rounded-card border border-sand-200 bg-sand-50 p-6">
        <h2 className="text-lg font-extrabold text-ink">ملخّص الطلب</h2>

        {remaining > 0 && (
          <p className="nums rounded-xl bg-white p-3 text-center text-[13px] text-sea-700">
            أضف بقيمة {formatPrice(remaining)} للحصول على شحن مجاني
          </p>
        )}

        <dl className="space-y-3 border-y border-sand-200 py-4 text-sm">
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

        <Link
          href="/checkout"
          className="block rounded-full bg-sea-700 px-6 py-4 text-center font-bold text-white transition hover:bg-sea-800"
        >
          إتمام الطلب
        </Link>
        <Link
          href="/products"
          className="block text-center text-sm font-bold text-sea-700 hover:underline"
        >
          متابعة التسوّق
        </Link>
      </aside>
    </div>
  );
}
