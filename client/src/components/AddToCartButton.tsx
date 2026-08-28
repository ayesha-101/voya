"use client";

import { useEffect, useState } from "react";
import type { Product } from "@/lib/types";
import { useCart } from "./CartProvider";
import { CartIcon } from "./Icons";

export function AddToCartButton({
  product,
  qty = 1,
  compact = false,
  className = "",
}: {
  product: Product;
  qty?: number;
  compact?: boolean;
  className?: string;
}) {
  const { add } = useCart();
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (state !== "done" && state !== "error") return;
    const t = setTimeout(() => setState("idle"), 2200);
    return () => clearTimeout(t);
  }, [state]);

  async function handle() {
    setState("busy");
    try {
      await add(product, qty);
      setState("done");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "تعذّرت الإضافة");
      setState("error");
    }
  }

  const label =
    state === "busy" ? "جارٍ الإضافة…"
    : state === "done" ? "تمت الإضافة ✓"
    : state === "error" ? message
    : "أضف إلى السلة";

  const tone =
    state === "done" ? "bg-gold-500 text-sea-900"
    : state === "error" ? "bg-red-600 text-white"
    : "bg-sea-700 text-white hover:bg-sea-800 active:scale-[0.98]";

  return (
    <button
      type="button"
      onClick={handle}
      disabled={state === "busy" || product.stock === 0}
      aria-live="polite"
      className={`flex w-full items-center justify-center gap-2 rounded-full font-bold transition disabled:opacity-70 ${
        compact ? "mt-2 px-4 py-2.5 text-[13px]" : "px-6 py-3.5 text-[15px]"
      } ${tone} ${className}`}
    >
      {state === "idle" && <CartIcon className="h-4 w-4" />}
      <span className="truncate">{label}</span>
    </button>
  );
}
