"use client";

import { useState } from "react";
import type { Product } from "@/lib/types";
import { AddToCartButton } from "./AddToCartButton";
import { QuantityStepper } from "./QuantityStepper";

export function ProductPurchasePanel({ product }: { product: Product }) {
  const [qty, setQty] = useState(1);

  if (product.stock === 0) {
    return (
      <p className="rounded-full bg-blush-100 px-6 py-4 text-center font-bold text-muted">
        نفدت الكمية — سيتوفّر قريبًا
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <QuantityStepper value={qty} onChange={setQty} max={product.stock} />
        {product.stock <= 15 && (
          <span className="nums text-sm font-bold text-rose-600">
            متبقٍ {product.stock} قطع فقط
          </span>
        )}
      </div>
      <AddToCartButton product={product} qty={qty} />
    </div>
  );
}
