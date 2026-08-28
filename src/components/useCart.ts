"use client";

import { useMemo, useSyncExternalStore } from "react";
import { products, type Product } from "@/data/products";
import { site } from "@/data/site";
import {
  addLine,
  clearCart,
  getCartServerSnapshot,
  getCartSnapshot,
  removeLine,
  setLineQty,
  subscribeCart,
} from "@/lib/cartStore";

export function useCart() {
  const { lines, ready } = useSyncExternalStore(
    subscribeCart,
    getCartSnapshot,
    getCartServerSnapshot,
  );

  return useMemo(() => {
    const items = lines
      .map((l) => {
        const product = products.find((p) => p.slug === l.slug);
        return product ? { product, qty: l.qty } : null;
      })
      .filter((x): x is { product: Product; qty: number } => x !== null);

    const subtotal = items.reduce((sum, i) => sum + i.product.price * i.qty, 0);
    const shipping =
      subtotal === 0 || subtotal >= site.freeShippingThreshold ? 0 : site.shippingFee;

    return {
      items,
      ready,
      count: items.reduce((n, i) => n + i.qty, 0),
      subtotal,
      shipping,
      total: subtotal + shipping,
      add: addLine,
      setQty: setLineQty,
      remove: removeLine,
      clear: clearCart,
    };
  }, [lines, ready]);
}
