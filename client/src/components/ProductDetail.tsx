"use client";

import Link from "next/link";
import { useState } from "react";
import type { Product } from "@/lib/types";
import { discountPercent, formatPrice } from "@/lib/format";
import { productCategoryName, productName } from "@/lib/localize";
import { site } from "@/data/site";
import { AddToCartButton } from "./AddToCartButton";
import { useLang, useT } from "./LangProvider";
import { ProductArt } from "./ProductArt";
import { QuantityStepper } from "./QuantityStepper";
import { Rating } from "./Rating";

/** قسم قابل للطي — يبقي الصفحة قصيرة ويُظهر التفاصيل عند الطلب. */
function Panel({
  title,
  children,
  open = false,
}: {
  title: string;
  children: React.ReactNode;
  open?: boolean;
}) {
  return (
    <details
      open={open}
      className="group border-b border-blush-200 py-4 last:border-b-0"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-bold text-plum-900">
        {title}
        <span
          aria-hidden
          className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-blush-300 text-plum-600 transition group-open:rotate-45"
        >
          +
        </span>
      </summary>
      <div className="pt-3 text-[15px] leading-8 text-muted">{children}</div>
    </details>
  );
}

export function ProductDetail({
  product,
  related,
}: {
  product: Product;
  related: Product[];
}) {
  const t = useT();
  const { lang } = useLang();
  const [qty, setQty] = useState(1);

  const off = discountPercent(product.price, product.compareAt);
  const saved = product.compareAt ? product.compareAt - product.price : 0;
  const name = productName(product, lang);
  const soldOut = product.stock === 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <nav aria-label="breadcrumb" className="mb-6 text-[13px] text-muted">
        <Link href="/" className="hover:text-plum-600">
          {t.product.home}
        </Link>
        <span className="mx-2">/</span>
        <Link
          href={`/products?category=${product.category}`}
          className="hover:text-plum-600"
        >
          {productCategoryName(product, lang)}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-plum-900">{name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-start">
        {/* ── الصورة ── */}
        <div className="relative overflow-hidden rounded-card border border-blush-200 bg-gradient-to-br from-blush-50 to-blush-100 p-8">
          <div className="absolute end-5 top-5 z-10 flex flex-col items-end gap-2">
            {product.badge && (
              <span className="rounded-full bg-plum-700 px-3 py-1.5 text-xs font-bold text-white">
                {product.badge}
              </span>
            )}
            {off > 0 && (
              <span className="rounded-full bg-gold-500 px-3 py-1.5 text-sm font-extrabold text-white">
                −<span className="nums">{off}%</span>
              </span>
            )}
          </div>
          <ProductArt
            shape={product.shape}
            tone={product.tone}
            label={name}
            className="mx-auto h-[24rem] w-full sm:h-[28rem]"
          />
        </div>

        {/* ── لوحة الشراء: تلتصق أثناء التمرير على الشاشات الكبيرة ── */}
        <div className="space-y-6 lg:sticky lg:top-28">
          <div className="space-y-3">
            <p className="text-xs tracking-[0.14em] text-gold-600 uppercase">
              {productCategoryName(product, lang)}
            </p>
            <h1 className="display text-3xl leading-tight text-plum-900 sm:text-[40px]">
              {name}
            </h1>
            <div className="flex items-center gap-3">
              <Rating value={product.rating} />
              <span className="nums text-sm text-muted">
                {product.rating} · {product.reviews} {t.product.reviews}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-baseline gap-3 border-y border-blush-200 py-5">
            <span className="nums text-4xl font-extrabold text-plum-700">
              {formatPrice(product.price, lang)}
            </span>
            {product.compareAt && (
              <>
                <span className="nums text-lg text-muted line-through">
                  {formatPrice(product.compareAt, lang)}
                </span>
                <span className="rounded-full bg-gold-100 px-3 py-1 text-[13px] font-bold text-gold-700">
                  {t.product.save.replace("{n}", formatPrice(saved, lang))}
                </span>
              </>
            )}
            {product.size && (
              <span className="ms-auto text-sm text-muted">{product.size}</span>
            )}
          </div>

          <p className="text-base leading-8 text-plum-900/80">{product.short}</p>

          {soldOut ? (
            <p className="rounded-full bg-blush-100 px-6 py-4 text-center font-bold text-muted">
              {t.product.outOfStock}
            </p>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-4">
                <QuantityStepper value={qty} onChange={setQty} max={product.stock} />
                {product.stock <= 20 && (
                  <span className="nums text-sm font-bold text-gold-600">
                    {t.product.lowStock.replace("{n}", String(product.stock))}
                  </span>
                )}
              </div>
              <AddToCartButton product={product} qty={qty} label={t.product.addToCart} />
            </div>
          )}

          <ul className="grid gap-2.5 rounded-card bg-blush-50 p-5 text-[13px] sm:grid-cols-2">
            {t.services.map((f) => (
              <li key={f.title} className="flex items-start gap-2">
                <span aria-hidden className="mt-1 text-gold-500">
                  ◆
                </span>
                <span>
                  <span className="block font-bold text-plum-900">{f.title}</span>
                  <span className="block text-muted">{f.body}</span>
                </span>
              </li>
            ))}
          </ul>

          <div className="rounded-card border border-blush-200 px-5">
            <Panel title={t.product.details} open>
              <p>{product.description}</p>
            </Panel>

            {product.howToUse && (
              <Panel title={t.product.howToUse}>
                <p>{product.howToUse}</p>
              </Panel>
            )}

            {product.ingredients.length > 0 && (
              <Panel title={t.product.ingredients}>
                <ul className="flex flex-wrap gap-2">
                  {product.ingredients.map((i) => (
                    <li
                      key={i}
                      className="rounded-full bg-blush-100 px-3.5 py-1.5 text-[13px] text-plum-900"
                    >
                      {i}
                    </li>
                  ))}
                </ul>
              </Panel>
            )}

            {product.benefits.length > 0 && (
              <Panel title={t.product.specs}>
                <dl className="grid gap-2">
                  {product.benefits.map((b) => {
                    const [key, ...rest] = b.split(":");
                    const value = rest.join(":").trim();
                    return (
                      <div key={b} className="flex justify-between gap-4 border-b border-blush-100 pb-2 last:border-0">
                        <dt className="font-bold text-plum-900">{key}</dt>
                        <dd className="text-end">{value || "—"}</dd>
                      </div>
                    );
                  })}
                </dl>
              </Panel>
            )}
          </div>

          <p className="text-center text-xs text-muted">
            {t.product.needHelp}{" "}
            <a
              href={`https://wa.me/${site.whatsapp}`}
              target="_blank"
              rel="noreferrer"
              className="nums font-bold text-plum-600 hover:underline"
            >
              {site.phone}
            </a>
          </p>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="display mb-8 text-2xl text-plum-900 sm:text-3xl">
            {t.product.related}
          </h2>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {related.map((p) => (
              <RelatedCard key={p.slug} product={p} lang={lang} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function RelatedCard({ product, lang }: { product: Product; lang: "ar" | "en" }) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-card border border-blush-200 bg-white transition hover:-translate-y-1 hover:border-gold-400"
    >
      <div className="bg-blush-50 p-4">
        <ProductArt
          shape={product.shape}
          tone={product.tone}
          label={productName(product, lang)}
          className="mx-auto h-36 w-full transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <h3 className="text-sm font-bold text-plum-900">
          {productName(product, lang)}
        </h3>
        <span className="nums mt-auto text-base font-extrabold text-plum-700">
          {formatPrice(product.price, lang)}
        </span>
      </div>
    </Link>
  );
}
