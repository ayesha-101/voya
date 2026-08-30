"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Plus } from 'lucide-react';
import type { Product } from "@/lib/types";
import { formatPrice, productImages } from "@/lib/voya";
import { useCart } from "@/components/CartProvider";
import { cn } from '@/lib/utils';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

// small-ticket «لمسة أخيرة» picks per design: brow gel, walnut scrub, baby spray, styling gel
const PREFERRED = ['brow-gel', 'body-scrub', 'baby-spray', 'hair-gel'];

function UpsellCard({ product, index }: { product: Product; index: number }) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);

  const onAdd = () => {
    if (added) return;
    void add(product, 1);
    setAdded(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -28 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, ease: EASE, delay: index * 0.08 }}
      className="flex items-center gap-3 rounded-3xl bg-white p-3 shadow-card transition-shadow duration-300 hover:shadow-card-hover"
    >
      <img
        src={productImages(product)[0]}
        alt={product.name}
        loading="lazy"
        className="h-20 w-16 shrink-0 rounded-2xl bg-blush-100 object-cover"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{product.name}</p>
        <p className="tnum mt-0.5 text-sm font-bold text-rose-deep">{formatPrice(product.price)}</p>
      </div>
      <button
        type="button"
        onClick={onAdd}
        aria-label={`أضيفي ${product.name} للسلة`}
        className={cn(
          'flex h-9 items-center gap-1 rounded-full px-3.5 text-xs font-bold transition-all duration-300',
          added ? 'bg-success text-white' : 'bg-rose text-white hover:bg-rose-deep',
        )}
      >
        {added ? (
          <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.3, ease: EASE }}>
            <Check className="h-4 w-4" strokeWidth={2.5} />
          </motion.span>
        ) : (
          <Plus className="h-4 w-4" strokeWidth={2} />
        )}
        {added ? 'تم' : 'أضيفي'}
      </button>
    </motion.div>
  );
}

/** «لمسة أخيرة؟ ✨» quick-add suggestions band. */
export default function Upsell({ catalog }: { catalog: Product[] }) {
  const { items } = useCart();
  const inCart = new Set(items.map((i) => i.slug));
  const preferred = PREFERRED.map((id) => catalog.find((p) => p.slug === id)).filter(
    (p): p is Product => Boolean(p) && !inCart.has(p!.slug),
  );
  const fallback = catalog.filter(
    (p) => !inCart.has(p.slug) && !PREFERRED.includes(p.slug) && p.price <= 100,
  );
  const picks = [...preferred, ...fallback].slice(0, 4);

  if (picks.length === 0) return null;

  return (
    <section className="mt-12 rounded-[32px] bg-cream p-6 md:p-8">
      <h2 className="flex items-center gap-3 text-2xl font-bold md:text-[28px]">
        لمسة أخيرة؟ ✨
        <img src="/ornament-thread.svg" alt="" aria-hidden className="h-3.5 w-24 opacity-80" />
      </h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {picks.map((p, i) => (
          <UpsellCard key={p.id} product={p} index={i} />
        ))}
      </div>
    </section>
  );
}
