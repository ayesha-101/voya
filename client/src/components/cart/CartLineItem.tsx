"use client";

import { motion } from 'framer-motion';
import { Heart, Minus, Plus, Trash2 } from 'lucide-react';
import type { TemplateCartItem } from "@/components/cartAdapter";
import { useCart } from "@/components/CartProvider";
import { useWishlist } from "@/components/useWishlist";
import { formatPrice } from "@/lib/voya";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

interface Props {
  item: TemplateCartItem;
  onRemove: (item: TemplateCartItem) => void;
}

export default function CartLineItem({ item, onRemove }: Props) {
  const { setQty } = useCart();
  const wishlist = useWishlist();
  const { product, qty, color } = item;

  const moveToWishlist = () => {
    wishlist.toggle(product.id);
    onRemove(item);
  };

  return (
    <motion.article
      layout="position"
      initial={false}
      exit={{ opacity: 0, x: -60, height: 0, marginBottom: 0, paddingTop: 0, paddingBottom: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      className="overflow-hidden rounded-3xl bg-white p-4 shadow-card transition-shadow duration-300 hover:shadow-card-hover"
    >
      <div className="flex gap-4">
        <img
          src={product.images[0]}
          alt={product.name}
          className="h-24 w-24 shrink-0 rounded-2xl bg-blush-100 object-cover"
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate text-base font-semibold">{product.name}</h3>
              <p className="mt-0.5 text-xs text-mauve">
                {product.category}
                {color ? ` · ${color}` : ''}
              </p>
              <p className="tnum mt-1 text-sm text-ink-soft">{formatPrice(product.price)}</p>
            </div>
            <div className="flex shrink-0 flex-col items-center gap-1">
              <button
                type="button"
                aria-label={`حذف ${product.name}`}
                onClick={() => onRemove(item)}
                className="rounded-full p-1.5 text-ink-soft/70 transition-colors hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="h-[18px] w-[18px]" strokeWidth={1.5} />
              </button>
              <button
                type="button"
                aria-label={`انقلي ${product.name} إلى المفضلة`}
                title="انقليها للمفضلة"
                onClick={moveToWishlist}
                className="rounded-full p-1.5 text-ink-soft/70 transition-colors hover:bg-blush-100 hover:text-rose"
              >
                <Heart className="h-[18px] w-[18px]" strokeWidth={1.5} />
              </button>
            </div>
          </div>
          <div className="mt-auto flex items-center justify-between pt-3">
            <div className="flex items-center rounded-full border border-blush-200 bg-blush-50">
              <button
                type="button"
                aria-label="زيادة الكمية"
                onClick={() => void setQty(product.id, qty + 1)}
                className="flex h-9 w-9 items-center justify-center text-ink transition-colors hover:text-rose"
              >
                <Plus className="h-4 w-4" strokeWidth={1.5} />
              </button>
              <motion.span
                key={qty}
                initial={{ scale: 1.15 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3, ease: EASE }}
                className="tnum w-7 text-center text-sm font-bold"
              >
                {qty}
              </motion.span>
              <button
                type="button"
                aria-label="إنقاص الكمية"
                onClick={() => void setQty(product.id, qty - 1)}
                className="flex h-9 w-9 items-center justify-center text-ink transition-colors hover:text-rose"
              >
                <Minus className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>
            <span className="tnum font-heading text-base font-bold text-rose-deep">
              {formatPrice(product.price * qty)}
            </span>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
