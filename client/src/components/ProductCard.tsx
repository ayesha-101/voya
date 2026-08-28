import Link from "next/link";
import type { Product } from "@/lib/types";
import { discountPercent, formatPrice } from "@/lib/format";
import { ProductArt } from "./ProductArt";
import { Rating } from "./Rating";
import { AddToCartButton } from "./AddToCartButton";

export function ProductCard({ product }: { product: Product }) {
  const off = discountPercent(product.price, product.compareAt);

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-card border border-blush-200 bg-white transition hover:-translate-y-1 hover:border-plum-200 hover:shadow-xl hover:shadow-plum-900/5">
      <Link
        href={`/products/${product.slug}`}
        className="relative block bg-blush-50 p-4"
        aria-label={product.name}
      >
        <div className="absolute end-3 top-3 z-10 flex flex-col items-end gap-1.5">
          {product.badge && (
            <span className="rounded-full bg-plum-800 px-2.5 py-1 text-[11px] font-bold text-white">
              {product.badge}
            </span>
          )}
          {off > 0 && (
            <span className="nums rounded-full bg-rose-500 px-2.5 py-1 text-[11px] font-bold text-plum-900">
              -{off}%
            </span>
          )}
        </div>
        <ProductArt
          shape={product.shape}
          tone={product.tone}
          label={product.name}
          className="mx-auto h-44 w-full transition-transform duration-500 group-hover:scale-105"
        />
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4 pt-3">
        <Rating value={product.rating} reviews={product.reviews} />
        <h3 className="text-[15px] font-bold leading-6 text-ink">
          <Link href={`/products/${product.slug}`} className="hover:text-plum-600">
            {product.name}
          </Link>
        </h3>
        <p className="line-clamp-2 text-[13px] leading-5 text-muted">{product.short}</p>

        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <div className="flex flex-col">
            <span className="nums text-lg font-extrabold text-plum-700">
              {formatPrice(product.price)}
            </span>
            {product.compareAt && (
              <span className="nums text-xs text-muted line-through">
                {formatPrice(product.compareAt)}
              </span>
            )}
          </div>
          <span className="text-[11px] text-muted">{product.size}</span>
        </div>

        <AddToCartButton product={product} compact />
      </div>
    </article>
  );
}
