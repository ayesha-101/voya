"use client";

import { useEffect, useState } from "react";
import { useCart } from "./useCart";
import { CartIcon } from "./Icons";

export function AddToCartButton({
  slug,
  qty = 1,
  compact = false,
  className = "",
}: {
  slug: string;
  qty?: number;
  compact?: boolean;
  className?: string;
}) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!added) return;
    const t = setTimeout(() => setAdded(false), 1800);
    return () => clearTimeout(t);
  }, [added]);

  return (
    <button
      type="button"
      onClick={() => {
        add(slug, qty);
        setAdded(true);
      }}
      aria-live="polite"
      className={`flex w-full items-center justify-center gap-2 rounded-full font-bold transition ${
        compact ? "mt-2 px-4 py-2.5 text-[13px]" : "px-6 py-3.5 text-[15px]"
      } ${
        added
          ? "bg-gold-500 text-sea-900"
          : "bg-sea-700 text-white hover:bg-sea-800 active:scale-[0.98]"
      } ${className}`}
    >
      <CartIcon className="h-4 w-4" />
      {added ? "تمت الإضافة ✓" : "أضف إلى السلة"}
    </button>
  );
}
