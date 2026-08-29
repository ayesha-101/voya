"use client";

import { formatPrice, productImages } from "@/lib/voya";
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import type { Product } from "@/lib/types";
import { useCart } from "@/components/CartProvider";
import { useUI } from "@/components/UIProvider";
import { toast } from "@/components/Toast";

/**
 * Mobile-only sticky purchase bar: appears after 400px of scrolling
 * and hides when the footer approaches the viewport.
 */
export default function StickyBuyBar({
  product,
  colorName,
}: {
  product: Product;
  colorName?: string;
}) {
  const { add } = useCart();
  const { openCart } = useUI();
  const [visible, setVisible] = useState(false);
  const isOut = product.badge === 'out' || product.stock <= 0;

  useEffect(() => {
    if (isOut) return;
    const onScroll = () => {
      const footer = document.querySelector('footer');
      const footerTop = footer ? footer.getBoundingClientRect().top : Number.POSITIVE_INFINITY;
      setVisible(window.scrollY > 400 && footerTop > window.innerHeight + 60);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isOut]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 320, damping: 32 }}
          className="fixed inset-x-0 bottom-0 z-40 border-t border-blush-200 bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-modal backdrop-blur-md md:hidden"
        >
          <div className="flex items-center gap-3 px-4 py-3">
            <img
              src={productImages(product)[0]}
              alt={product.name}
              className="h-12 w-10 shrink-0 rounded-xl bg-cream object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-bold text-plum">{product.name}</p>
              <div className="mt-0.5 flex items-baseline gap-1.5">
                <span className="tnum font-heading text-sm font-bold text-rose-deep">
                  {formatPrice(product.price)}
                </span>
                {product.compareAt && (
                  <span className="tnum text-[11px] text-ink-soft line-through">
                    {formatPrice(product.compareAt)}
                  </span>
                )}
              </div>
            </div>
            <motion.button
              type="button"
              whileTap={{ scale: 0.96 }}
              onClick={() => {
                void add(product, 1).then(() => {
                  openCart();
                  toast("أُضيف إلى سلتكِ 🌸");
                });
              }}
              className="flex h-11 shrink-0 items-center gap-2 rounded-full bg-gradient-rose px-5 text-sm font-bold text-white transition-all duration-300 hover:shadow-card-hover"
            >
              <ShoppingBag className="h-4 w-4" strokeWidth={1.5} />
              أضيفي للسلة
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
