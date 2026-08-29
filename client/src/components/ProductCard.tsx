"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, ShoppingBag, Star } from "lucide-react";
import type { Product } from "@/lib/types";
import { BADGE_CLASS, BADGE_LABEL, badgeOf, discountPercent, formatPrice, productImages } from "@/lib/voya";
import { useCart } from "./CartProvider";
import { useWishlist } from "./useWishlist";
import { useUI } from "./UIProvider";
import { cn } from "@/lib/utils";

/** التفاعل المميّز: القلب يمتلئ ورديًا وتنفجر منه ستّ بتلات. */
function PetalBurst({ burstKey }: { burstKey: number }) {
  return (
    <AnimatePresence>
      {burstKey > 0 && (
        <span key={burstKey} className="pointer-events-none absolute inset-0 flex items-center justify-center">
          {Array.from({ length: 6 }).map((_, i) => {
            const angle = (i / 6) * Math.PI * 2;
            return (
              <motion.span
                key={i}
                initial={{ x: 0, y: 0, scale: 0.4, opacity: 1 }}
                animate={{ x: Math.cos(angle) * 26, y: Math.sin(angle) * 26, scale: 1, opacity: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="bg-rose absolute h-1.5 w-1.5 rounded-full"
              />
            );
          })}
        </span>
      )}
    </AnimatePresence>
  );
}

export function ProductCard({
  product,
  className,
  priority = false,
}: {
  product: Product;
  className?: string;
  priority?: boolean;
}) {
  const { add } = useCart();
  const wishlist = useWishlist();
  const { openCart } = useUI();
  const [burst, setBurst] = useState(0);
  const [busy, setBusy] = useState(false);

  const wished = wishlist.has(product.slug);
  const isOut = product.stock <= 0;
  const badge = badgeOf(product);
  const discount = discountPercent(product);
  const image = productImages(product)[0];
  const href = `/products/${product.slug}`;

  const onWish = (e: React.MouseEvent) => {
    e.preventDefault();
    wishlist.toggle(product.slug);
    if (!wished) setBurst((b) => b + 1);
  };

  const onAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isOut || busy) return;
    setBusy(true);
    try {
      await add(product, 1);
      openCart();
    } finally {
      setBusy(false);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -5, rotate: 0.5 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "group rounded-signature shadow-card hover:shadow-card-hover relative flex flex-col overflow-hidden bg-white transition-shadow duration-500",
        className,
      )}
    >
      <Link href={href} className="block">
        <div className="bg-cream relative aspect-[4/5] overflow-hidden">
          <Image
            src={image}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 300px, (min-width: 640px) 45vw, 90vw"
            priority={priority}
            className={cn(
              "object-cover transition-transform duration-700 ease-out group-hover:scale-[1.07]",
              isOut && "opacity-70 grayscale-[30%]",
            )}
          />
          {badge && (
            <span
              className={cn(
                "absolute top-3 right-3 rounded-full px-3 py-1 text-xs font-bold tracking-wide shadow-sm",
                BADGE_CLASS[badge],
              )}
            >
              {badge === "sale" && discount > 0 ? `خصم ${discount}%` : BADGE_LABEL[badge]}
            </span>
          )}

          {/* شريط إجراءات عائم — يظهر عند التحويم، وثابت على اللمس */}
          <div className="shadow-card duration-400 absolute inset-x-3 bottom-3 flex translate-y-2 items-center gap-2 rounded-full bg-white/85 p-1.5 opacity-0 backdrop-blur-md transition-all group-hover:translate-y-0 group-hover:opacity-100 max-md:translate-y-0 max-md:opacity-100">
            <button
              type="button"
              onClick={onAdd}
              disabled={isOut || busy}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 rounded-full py-2.5 text-[13px] font-bold transition-colors",
                isOut
                  ? "bg-blush-200 text-ink-soft cursor-not-allowed"
                  : "bg-rose hover:bg-rose-deep text-white disabled:opacity-70",
              )}
            >
              <ShoppingBag className="h-4 w-4" strokeWidth={1.5} />
              {isOut ? "نفدت الكمية" : busy ? "جارٍ الإضافة…" : "أضيفي إلى السلة"}
            </button>
            <button
              type="button"
              onClick={onWish}
              aria-label={wished ? "في المفضلة" : "أضيفي إلى المفضلة"}
              aria-pressed={wished}
              className={cn(
                "relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-all duration-300 active:scale-90",
                wished
                  ? "border-rose bg-rose text-white"
                  : "border-blush-200 text-rose hover:border-rose bg-white",
              )}
            >
              <Heart className={cn("h-[18px] w-[18px]", wished && "fill-current")} strokeWidth={1.5} />
              <PetalBurst burstKey={burst} />
            </button>
          </div>
        </div>
      </Link>

      <div className="relative flex flex-1 flex-col gap-1 p-4 pb-5">
        <span className="text-mauve text-xs font-bold tracking-wide">{product.categoryName}</span>
        <Link href={href} className="hover:text-rose-deep transition-colors">
          <h3 className="text-plum text-lg leading-snug font-semibold md:text-xl">{product.name}</h3>
        </Link>
        <div className="text-ink-soft flex items-center gap-1.5 text-xs">
          <span className="text-gold flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className="h-3.5 w-3.5"
                strokeWidth={1.5}
                fill={i < Math.round(product.rating) ? "currentColor" : "none"}
              />
            ))}
          </span>
          <span className="tnum">({product.reviews})</span>
        </div>
        <div className="mt-auto flex items-baseline gap-2 pt-1.5">
          <span
            className={cn(
              "tnum font-heading text-lg font-bold md:text-xl",
              product.compareAt ? "text-rose-deep" : "text-plum",
            )}
          >
            {formatPrice(product.price)}
          </span>
          {product.compareAt && product.compareAt > product.price && (
            <span className="tnum text-ink-soft text-sm line-through">{formatPrice(product.compareAt)}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
