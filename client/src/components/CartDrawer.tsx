"use client";

import Link from "next/link";
import { formatPrice } from "@/lib/format";
import { productName } from "@/lib/localize";
import { site } from "@/data/site";
import { useCart } from "./CartProvider";
import { useLang, useT } from "./LangProvider";
import { ProductArt } from "./ProductArt";
import { QuantityStepper } from "./QuantityStepper";
import { SlideOver } from "./SlideOver";
import { useUI } from "./UIProvider";

export function CartDrawer() {
  const { panel, close } = useUI();
  const { items, setQty, remove, subtotal, shippingFee, total, count, pending } = useCart();
  const t = useT();
  const { lang } = useLang();

  const remaining = site.freeShippingThreshold - subtotal;

  return (
    <SlideOver
      open={panel === "cart"}
      onClose={close}
      title={`${t.cart}${count ? ` (${count})` : ""}`}
      footer={
        items.length > 0 && (
          <div className="space-y-3">
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">{t.drawer.subtotal}</dt>
                <dd className="nums font-bold">{formatPrice(subtotal, lang)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">{t.drawer.shipping}</dt>
                <dd className="nums font-bold">
                  {shippingFee === 0 ? t.drawer.free : formatPrice(shippingFee, lang)}
                </dd>
              </div>
              <div className="flex justify-between border-t border-blush-200 pt-2">
                <dt className="font-bold text-plum-900">{t.drawer.total}</dt>
                <dd className="nums text-lg font-extrabold text-plum-700">
                  {formatPrice(total, lang)}
                </dd>
              </div>
            </dl>
            <Link
              href="/checkout"
              onClick={close}
              className="block rounded-full bg-plum-600 px-6 py-3.5 text-center font-bold text-white transition hover:bg-plum-700"
            >
              {t.drawer.checkout}
            </Link>
            <Link
              href="/cart"
              onClick={close}
              className="block text-center text-sm font-bold text-plum-600 hover:underline"
            >
              {t.drawer.viewCart}
            </Link>
          </div>
        )
      }
    >
      {items.length === 0 ? (
        <div className="py-16 text-center">
          <p className="font-bold text-plum-900">{t.drawer.empty}</p>
          <Link
            href="/products"
            onClick={close}
            className="mt-5 inline-block rounded-full bg-plum-600 px-7 py-3 font-bold text-white transition hover:bg-plum-700"
          >
            {t.navExtra.all}
          </Link>
        </div>
      ) : (
        <>
          {remaining > 0 && (
            <p className="nums mb-4 rounded-xl bg-gold-100 p-3 text-center text-[13px] text-gold-700">
              {t.drawer.freeShippingHint.replace("{n}", formatPrice(remaining, lang))}
            </p>
          )}

          <ul className={`space-y-3 transition-opacity ${pending ? "opacity-60" : ""}`}>
            {items.map((item) => (
              <li
                key={item.slug}
                className="flex gap-3 rounded-card border border-blush-200 bg-white p-3"
              >
                <Link
                  href={`/products/${item.slug}`}
                  onClick={close}
                  className="h-20 w-16 shrink-0 rounded-xl bg-blush-50 p-1.5"
                >
                  <ProductArt
                    shape={item.shape}
                    tone={item.tone}
                    label={item.name}
                    className="h-full w-full"
                  />
                </Link>

                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <Link
                      href={`/products/${item.slug}`}
                      onClick={close}
                      className="text-[13px] leading-5 font-bold text-plum-900 hover:text-plum-600"
                    >
                      {productName(item, lang)}
                    </Link>
                    <button
                      type="button"
                      onClick={() => void remove(item.slug)}
                      aria-label={t.drawer.removeItem}
                      className="shrink-0 text-muted transition hover:text-red-600"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="mt-auto flex items-center justify-between gap-2">
                    <QuantityStepper
                      value={item.qty}
                      onChange={(n) => void setQty(item.slug, n)}
                      max={item.stock}
                    />
                    <span className="nums text-sm font-extrabold text-plum-700">
                      {formatPrice(item.lineTotal, lang)}
                    </span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </SlideOver>
  );
}
