"use client";

import { useState } from "react";
import { AddToCartButton } from "./AddToCartButton";
import { QuantityStepper } from "./QuantityStepper";

export function ProductPurchasePanel({
  slug,
  stock,
}: {
  slug: string;
  stock: number;
}) {
  const [qty, setQty] = useState(1);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <QuantityStepper value={qty} onChange={setQty} max={Math.max(1, stock)} />
        {stock <= 15 && (
          <span className="nums text-sm font-bold text-gold-600">
            متبقٍ {stock} قطع فقط
          </span>
        )}
      </div>
      <AddToCartButton slug={slug} qty={qty} />
    </div>
  );
}
