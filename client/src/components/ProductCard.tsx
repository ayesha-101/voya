"use client";

import Link from "next/link";
import type { Product } from "@/lib/types";
import { discountPercent, formatPrice } from "@/lib/format";
import { AddToCartButton } from "./AddToCartButton";
import { ProductArt } from "./ProductArt";
import { WishlistButton } from "./WishlistButton";
import { useT } from "./LangProvider";
import { useLang } from "./LangProvider";
import { productName } from "@/lib/localize";

export function ProductCard({ product }: { product: Product }) {
  const t = useT();
  const { lang } = useLang();
  const off = discountPercent(product.price, product.compareAt);

  return (
    <article className="group flex flex-col overflow-hidden rounded-card border border-blush-200 bg-white transition hover:-translate-y-1.5 hover:shadow-[0_22px_44px_rgba(108,42,72,.13)]">
      <Link
        href={`/products/${product.slug}`}
        className="relative block aspect-[6/7] bg-[linear-gradient(160deg,#fdf1f4,#f7dbe4)]"
        aria-label={productName(product, lang)}
      >
        <ProductArt
          shape={product.shape}
          tone={product.tone}
          label={productName(product, lang)}
          className="h-full w-full transition-transform duration-500 group-hover:scale-[1.04]"
        />
        {product.badge && (
          <span className="absolute start-3.5 top-3.5 rounded-full bg-white px-3 py-1.5 text-[11px] font-bold text-plum-600 shadow-[0_6px_14px_rgba(108,42,72,.12)]">
            {product.badge}
          </span>
        )}
        {off > 0 && (
          <span className="nums absolute start-3.5 top-12 rounded-full bg-plum-400 px-2.5 py-1.5 text-[11px] font-bold text-white">
            -{off}%
          </span>
        )}
        {/* القلب داخل الرابط لكنه يوقف الانتقال عند الضغط */}
        <WishlistButton slug={product.slug} className="absolute end-3.5 top-3.5" />
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4.5 pb-5">
        {lang === "ar" && product.nameEn && (
          <span className="display text-[13px] tracking-[0.1em] text-gold-500">
            {product.nameEn}
          </span>
        )}
        <h3 className="text-[15px] leading-relaxed font-bold text-ink">
          <Link href={`/products/${product.slug}`} className="hover:text-plum-600">
            {productName(product, lang)}
          </Link>
        </h3>
        <p className="line-clamp-2 text-[13px] leading-6 text-muted">{product.short}</p>

        <div className="mt-auto flex items-baseline gap-2.5 pt-2.5">
          <span className="nums text-[19px] font-extrabold text-plum-600">{formatPrice(product.price, lang)}</span>
          {product.compareAt && (
            <span className="nums text-[13px] text-blush-400 line-through">{formatPrice(product.compareAt, lang)}</span>
          )}
          <span className="ms-auto text-xs text-muted">{product.size}</span>
        </div>

        <AddToCartButton product={product} compact label={t.product.addToCart} />
      </div>
    </article>
  );
}
