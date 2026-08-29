"use client";

import { useT } from "./LangProvider";
import { useWishlist } from "./useWishlist";

/** قلب المفضّلة — يظهر فوق صورة المنتج. */
export function WishlistButton({
  slug,
  className = "",
}: {
  slug: string;
  className?: string;
}) {
  const { has, toggle } = useWishlist();
  const t = useT();
  const on = has(slug);

  return (
    <button
      type="button"
      onClick={(e) => {
        // البطاقة كلها رابط — نمنع الانتقال عند الضغط على القلب
        e.preventDefault();
        e.stopPropagation();
        toggle(slug);
      }}
      aria-pressed={on}
      aria-label={on ? t.product.wishlistOn : t.product.wishlist}
      title={on ? t.product.wishlistOn : t.product.wishlist}
      className={`grid h-9 w-9 place-items-center rounded-full border backdrop-blur transition ${
        on
          ? "border-plum-600 bg-plum-600 text-white"
          : "border-blush-300 bg-white/85 text-plum-600 hover:border-plum-400"
      } ${className}`}
    >
      <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill={on ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8">
        <path d="M12 20.3 4.6 13a4.6 4.6 0 0 1 6.5-6.5l.9.9.9-.9A4.6 4.6 0 0 1 19.4 13z" />
      </svg>
    </button>
  );
}
