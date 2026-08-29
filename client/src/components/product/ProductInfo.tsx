"use client";

import { formatPrice, productColors } from "@/lib/voya";
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BadgeCheck,
  Check,
  Heart,
  Camera,
  Link2,
  Minus,
  Plus,
  RotateCcw,
  Share2,
  ShieldCheck,
  ShoppingBag,
  Truck,
} from 'lucide-react';
import type { Product } from "@/lib/types";
import { useCart } from "@/components/CartProvider";
import { useUI } from "@/components/UIProvider";
import { useWishlist } from "@/components/useWishlist";
import { toast } from "@/components/Toast";
import RatingStars from '@/components/product/RatingStars';
import { cn } from '@/lib/utils';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const WHATSAPP_NUMBER = '971553633977';
const PAY_BADGES = ['pay-visa.svg', 'pay-mastercard.svg', 'pay-applepay.svg', 'pay-tabby.svg', 'pay-tamara.svg', 'pay-cod.svg'];

const stagger = (i: number) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: EASE, delay: 0.1 + i * 0.12 },
});

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn('fill-current', className)} aria-hidden>
      <path d="M12.04 2a9.9 9.9 0 0 0-8.5 14.93L2 22l5.2-1.5A9.9 9.9 0 1 0 12.04 2Zm0 1.8a8.1 8.1 0 1 1-4.13 15.05l-.3-.18-3.05.88.9-2.97-.2-.31a8.1 8.1 0 0 1 6.78-12.47Zm-3.1 4.2c-.17 0-.45.06-.68.32-.23.25-.9.87-.9 2.13 0 1.25.92 2.46 1.05 2.63.12.17 1.8 2.88 4.45 3.92 2.2.87 2.65.7 3.13.65.48-.04 1.54-.62 1.76-1.23.22-.6.22-1.13.15-1.24-.06-.1-.23-.17-.49-.3-.25-.12-1.54-.76-1.78-.85-.24-.08-.41-.13-.59.13-.17.26-.67.85-.82 1.02-.15.17-.3.2-.56.07a7.2 7.2 0 0 1-2.1-1.3 7.9 7.9 0 0 1-1.45-1.8c-.15-.26-.02-.4.12-.53.12-.12.26-.3.39-.46.13-.15.17-.26.26-.43.09-.18.05-.33-.02-.46-.07-.13-.58-1.4-.8-1.92-.2-.5-.41-.44-.58-.45l-.62-.02Z" />
    </svg>
  );
}

/** Petals burst from the CTA when a product is added. */
function PetalBurst({ trigger }: { trigger: boolean }) {
  if (!trigger) return null;
  return (
    <span className="pointer-events-none absolute inset-0" aria-hidden>
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.img
          key={i}
          src="/petal.svg"
          alt=""
          initial={{ opacity: 0.9, x: 0, y: 0, scale: 0.4, rotate: 0 }}
          animate={{
            opacity: 0,
            x: [-40, -18, 0, 18, 40][i],
            y: [-46, -64, -56, -62, -44][i],
            scale: [0.7, 0.55, 0.65, 0.55, 0.7][i],
            rotate: [-40, 30, -20, 45, -35][i],
          }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
          className="absolute left-1/2 top-0 w-5"
        />
      ))}
    </span>
  );
}

function ShareMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const url = typeof window !== 'undefined' ? window.location.href : '';
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast('تم نسخ رابط المنتج 🌸');
    } catch {
      toast('تعذّر نسخ الرابط');
    }
    setOpen(false);
  };

  const items = [
    {
      label: 'نسخ الرابط',
      icon: <Link2 className="h-4 w-4" strokeWidth={1.5} />,
      onClick: copy,
    },
    {
      label: 'واتساب',
      icon: <WhatsAppIcon className="h-4 w-4" />,
      href: `https://wa.me/?text=${encodeURIComponent(url)}`,
    },
    {
      label: 'انستغرام',
      icon: <Camera className="h-4 w-4" strokeWidth={1.5} />,
      href: 'https://www.instagram.com/byvoyastore',
    },
  ];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex items-center gap-1.5 text-sm font-medium text-ink-soft transition-colors hover:text-rose-deep"
      >
        <Share2 className="h-4 w-4" strokeWidth={1.5} />
        شاركيها مع صديقاتك
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.22, ease: EASE }}
            className="absolute bottom-full right-0 z-30 mb-2 w-44 rounded-2xl border border-blush-200 bg-white p-1.5 shadow-card-hover"
          >
            {items.map((it) => (
              <li key={it.label}>
                {it.href ? (
                  <a
                    href={it.href}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium text-plum transition-colors hover:bg-blush-100 hover:text-rose-deep"
                  >
                    {it.icon}
                    {it.label}
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={it.onClick}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium text-plum transition-colors hover:bg-blush-100 hover:text-rose-deep"
                  >
                    {it.icon}
                    {it.label}
                  </button>
                )}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ProductInfo({
  product,
  colorIdx,
  setColorIdx,
  qty,
  setQty,
}: {
  product: Product;
  colorIdx: number;
  setColorIdx: (i: number) => void;
  qty: number;
  setQty: (q: number) => void;
}) {
  const { add } = useCart();
  const { openCart } = useUI();
  const wishlist = useWishlist();
  const wished = wishlist.has(product.slug);
  const [added, setAdded] = useState(false);

  const isOut = product.badge === 'out' || product.stock <= 0;
  const lowStock = !isOut && product.stock <= 5;
  const colorName = productColors(product)[colorIdx]?.name;

  const discount =
    product.compareAt && product.compareAt > product.price ? product.compareAt - product.price : 0;

  const waMessage = encodeURIComponent(
    `مرحبًا فويا 🌸 أرغب بطلب: ${product.name} (${formatPrice(product.price)})`,
  );

  const scrollToReviews = () => {
    document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleAdd = () => {
    if (isOut) return;
    void add(product, qty).then(openCart);
    toast('أُضيف إلى سلتكِ 🌸');
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1600);
  };

  return (
    <div className="flex flex-col">
      <motion.span {...stagger(0)} className="text-xs font-bold tracking-[0.03em] text-mauve">
        {product.categoryName}
      </motion.span>

      <motion.h1
        {...stagger(1)}
        className="mt-2 text-[28px] font-bold leading-[1.3] text-plum md:text-[34px]"
      >
        {product.name}
        {product.nameEn && (
          <span className="mt-1 block text-base font-medium text-ink-soft">{product.nameEn}</span>
        )}
      </motion.h1>

      {/* rating row */}
      <motion.div {...stagger(2)} className="mt-3 flex flex-wrap items-center gap-3">
        <RatingStars rating={product.rating} />
        <span className="tnum font-heading text-sm font-bold text-plum">{product.rating.toFixed(1)}</span>
        <button
          type="button"
          onClick={scrollToReviews}
          className="tnum text-sm text-ink-soft underline-offset-4 transition-colors hover:text-rose-deep hover:underline"
        >
          ({product.reviews} مراجعة)
        </button>
        <span className="flex items-center gap-1 rounded-full bg-blush-200 px-2.5 py-1 text-[11px] font-bold text-mauve">
          <BadgeCheck className="h-3.5 w-3.5" strokeWidth={1.5} />
          منتج أصلي 100%
        </span>
      </motion.div>

      {/* price */}
      <motion.div {...stagger(3)} className="mt-5 flex flex-wrap items-baseline gap-3">
        <motion.span
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: EASE, delay: 0.45 }}
          className={cn(
            'tnum font-heading text-[32px] font-bold leading-none',
            discount > 0 ? 'text-rose-deep' : 'text-plum',
          )}
        >
          {formatPrice(product.price)}
        </motion.span>
        {product.compareAt && product.compareAt > product.price && (
          <>
            <span className="tnum text-lg text-ink-soft line-through">
              {formatPrice(product.compareAt)}
            </span>
            <span className="tnum rounded-full bg-gold-soft px-3 py-1 text-xs font-bold text-gold">
              وفّرتِ {formatPrice(discount)} 🌸
            </span>
          </>
        )}
      </motion.div>

      {/* short description */}
      <motion.p {...stagger(4)} className="font-body mt-4 text-[15px] leading-[1.9] text-ink-soft">
        {product.description}
      </motion.p>

      {/* colors */}
      {productColors(product).length > 0 && (
        <motion.div {...stagger(5)} className="mt-6">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-plum">اللون:</span>
            <span className="text-sm text-ink-soft">{colorName}</span>
          </div>
          <div className="mt-3 flex items-center gap-3">
            {productColors(product).map((c, i) => (
              <button
                key={c.name}
                type="button"
                aria-label={`اللون ${c.name}`}
                aria-pressed={i === colorIdx}
                onClick={() => setColorIdx(i)}
                style={{ backgroundColor: c.hex }}
                className={cn(
                  'h-9 w-9 rounded-full border border-plum/10 transition-all duration-300',
                  i === colorIdx ? 'ring-2 ring-rose ring-offset-2 ring-offset-blush-50' : 'hover:scale-110',
                )}
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* quantity + stock status */}
      <motion.div {...stagger(6)} className="mt-6 flex flex-wrap items-center gap-4">
        {!isOut && (
          <div className="flex items-center rounded-full border border-blush-200 bg-white">
            <button
              type="button"
              aria-label="زيادة الكمية"
              onClick={() => setQty(Math.min(product.stock, qty + 1))}
              className="flex h-11 w-11 items-center justify-center text-rose transition-colors hover:text-rose-deep disabled:opacity-40"
              disabled={qty >= product.stock}
            >
              <Plus className="h-4 w-4" strokeWidth={2} />
            </button>
            <span className="tnum w-8 text-center text-base font-bold text-plum">{qty}</span>
            <button
              type="button"
              aria-label="تقليل الكمية"
              onClick={() => setQty(Math.max(1, qty - 1))}
              className="flex h-11 w-11 items-center justify-center text-rose transition-colors hover:text-rose-deep disabled:opacity-40"
              disabled={qty <= 1}
            >
              <Minus className="h-4 w-4" strokeWidth={2} />
            </button>
          </div>
        )}

        {isOut ? (
          <span className="flex items-center gap-1.5 text-sm font-bold text-destructive">
            <span className="h-2 w-2 rounded-full bg-destructive" aria-hidden />
            نفدت الكمية — راسلينا واتساب ونوفّره لكِ
          </span>
        ) : lowStock ? (
          <span className="flex items-center gap-1.5 text-sm font-bold text-destructive">
            <motion.span
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
              className="h-2 w-2 rounded-full bg-destructive"
              aria-hidden
            />
            بقيت {product.stock <= 2 ? 'قطعتان' : `${product.stock} قطع`} فقط!
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-sm font-bold text-success">
            <motion.span
              animate={{ opacity: [1, 0.45, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="h-2 w-2 rounded-full bg-success"
              aria-hidden
            />
            متوفر — يُشحن خلال 24 ساعة
          </span>
        )}
      </motion.div>

      {/* main actions */}
      <motion.div {...stagger(7)} className="mt-7 flex items-center gap-3">
        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          disabled={isOut}
          onClick={handleAdd}
          className="relative flex h-[52px] flex-1 items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-rose text-base font-bold text-white shadow-card transition-all duration-300 hover:shadow-card-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          {/* gold shimmer sweep every 6s */}
          <span className="shimmer-gold animate-shimmer pointer-events-none absolute inset-0" aria-hidden />
          <PetalBurst trigger={added} />
          <AnimatePresence mode="wait" initial={false}>
            {added ? (
              <motion.span
                key="done"
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.6, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="relative flex items-center gap-2"
              >
                <Check className="h-5 w-5" strokeWidth={2} />
                أُضيف إلى سلتكِ!
              </motion.span>
            ) : (
              <motion.span
                key="add"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="relative flex items-center gap-2"
              >
                <ShoppingBag className="h-5 w-5" strokeWidth={1.5} />
                أضيفي إلى السلة 🌸
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>

        <motion.button
          type="button"
          aria-label="أضيفي إلى المفضلة"
          whileTap={{ scale: 1.2 }}
          onClick={() => {
            wishlist.toggle(product.slug);
            toast(wished ? 'أُزيل من مفضلتكِ' : 'أُضيف إلى مفضلتكِ 💗');
          }}
          className={cn(
            'flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full border bg-white shadow-card transition-colors',
            wished ? 'border-rose text-rose' : 'border-blush-200 text-plum hover:text-rose',
          )}
        >
          <Heart className="h-5 w-5" strokeWidth={1.5} fill={wished ? 'currentColor' : 'none'} />
        </motion.button>
      </motion.div>

      {/* WhatsApp order CTA */}
      <motion.a
        {...stagger(8)}
        href={`https://wa.me/${WHATSAPP_NUMBER}?text=${waMessage}`}
        target="_blank"
        rel="noreferrer"
        className="mt-3 flex h-[52px] items-center justify-center gap-2 rounded-full border-2 border-[#25D366]/50 text-base font-bold text-[#1DA851] transition-colors hover:border-[#25D366] hover:bg-[#25D366]/5"
      >
        <WhatsAppIcon className="h-5 w-5" />
        اطلبيه الآن عبر واتساب
      </motion.a>

      {/* trust row */}
      <motion.div {...stagger(9)} className="mt-7 border-t border-blush-200 pt-5">
        <ul className="flex flex-wrap items-center gap-x-6 gap-y-3 text-[13px] font-medium text-ink-soft">
          <li className="flex items-center gap-2">
            <ShieldCheck className="h-[18px] w-[18px] text-rose" strokeWidth={1.5} />
            دفع آمن
          </li>
          <li className="flex items-center gap-2">
            <Truck className="h-[18px] w-[18px] text-rose" strokeWidth={1.5} />
            توصيل 1–3 أيام — مجاني فوق 200 د.إ
          </li>
          <li className="flex items-center gap-2">
            <RotateCcw className="h-[18px] w-[18px] text-rose" strokeWidth={1.5} />
            إرجاع خلال 14 يومًا
          </li>
        </ul>
        <div className="mt-4 flex items-center gap-2">
          {PAY_BADGES.map((b) => (
            <img
              key={b}
              src={`/${b}`}
              alt={b.replace('pay-', '').replace('.svg', '')}
              loading="lazy"
              className="h-6 w-auto rounded"
            />
          ))}
        </div>
        <div className="mt-4">
          <ShareMenu />
        </div>
      </motion.div>
    </div>
  );
}
