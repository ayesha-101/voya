"use client";

import { productImages } from "@/lib/voya";
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import type { Product } from "@/lib/types";
import { cn } from '@/lib/utils';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

function Badges({ product, small }: { product: Product; small?: boolean }) {
  const discount =
    product.compareAt && product.compareAt > product.price
      ? Math.round(((product.compareAt - product.price) / product.compareAt) * 100)
      : 0;
  const cls = small ? 'px-2.5 py-1 text-[11px]' : 'px-3.5 py-1.5 text-xs';
  return (
    <div className="pointer-events-none absolute right-4 top-4 z-10 flex flex-col items-start gap-2">
      {discount > 0 && (
        <span className={cn('rounded-full bg-mauve font-bold tracking-wide text-white shadow-card', cls)}>
          خصم {discount}%
        </span>
      )}
      {product.badge === 'trending' && (
        <span className={cn('rounded-full bg-gold-soft font-bold text-gold shadow-card', cls)}>
          رائج 🔥
        </span>
      )}
      {product.badge === 'new' && (
        <span className={cn('rounded-full bg-rose font-bold text-white shadow-card', cls)}>جديد</span>
      )}
      {product.badge === 'uae' && (
        <span className={cn('rounded-full border border-gold/50 bg-gold-soft font-bold text-gold shadow-card', cls)}>
          صنع في الإمارات 🇦🇪
        </span>
      )}
      {product.badge === 'sale' && discount === 0 && (
        <span className={cn('rounded-full bg-mauve font-bold text-white shadow-card', cls)}>عرض خاص</span>
      )}
    </div>
  );
}

/** Full-screen lightbox with plum backdrop, arrows and Esc close. */
function Lightbox({
  images,
  name,
  index,
  setIndex,
  onClose,
}: {
  images: string[];
  name: string;
  index: number;
  setIndex: (i: number) => void;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') setIndex(Math.min(images.length - 1, index + 1));
      if (e.key === 'ArrowRight') setIndex(Math.max(0, index - 1));
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [index, images.length, onClose, setIndex]);

  const step = (dir: 1 | -1) =>
    setIndex((index + dir + images.length) % images.length);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[95] flex items-center justify-center bg-plum/90 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`معرض صور ${name}`}
    >
      <button
        type="button"
        aria-label="إغلاق"
        onClick={onClose}
        className="absolute left-5 top-5 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-blush-50 transition-colors hover:bg-white/20"
      >
        <X className="h-5 w-5" strokeWidth={1.5} />
      </button>

      {images.length > 1 && (
        <>
          <button
            type="button"
            aria-label="الصورة السابقة"
            onClick={(e) => {
              e.stopPropagation();
              step(1);
            }}
            className="absolute right-4 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-blush-50 transition-colors hover:bg-white/20"
          >
            <ChevronRight className="h-5 w-5" strokeWidth={1.5} />
          </button>
          <button
            type="button"
            aria-label="الصورة التالية"
            onClick={(e) => {
              e.stopPropagation();
              step(-1);
            }}
            className="absolute left-4 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-blush-50 transition-colors hover:bg-white/20"
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </>
      )}

      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        transition={{ duration: 0.4, ease: EASE }}
        onClick={(e) => e.stopPropagation()}
        className="relative max-h-[86dvh] w-full max-w-2xl overflow-hidden rounded-signature bg-cream shadow-modal"
      >
        <AnimatePresence mode="popLayout">
          <motion.img
            key={index}
            src={images[index]}
            alt={`${name} — صورة ${index + 1}`}
            initial={{ opacity: 0, x: -14 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 14 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="max-h-[86dvh] w-full object-contain"
          />
        </AnimatePresence>
        {images.length > 1 && (
          <div className="absolute inset-x-0 bottom-4 flex justify-center gap-1.5">
            {images.map((_, i) => (
              <span
                key={i}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-300',
                  i === index ? 'w-5 bg-gold' : 'w-1.5 bg-plum/25',
                )}
              />
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

export default function ProductGallery({ product }: { product: Product }) {
  const images = productImages(product).length > 0 ? productImages(product) : ['/hero-main.png'];
  const [active, setActive] = useState(0);
  const [zooming, setZooming] = useState(false);
  const [origin, setOrigin] = useState('50% 50%');
  const [lightbox, setLightbox] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);

  const handleMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== 'mouse') return;
    const rect = frameRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setOrigin(`${Math.min(100, Math.max(0, x))}% ${Math.min(100, Math.max(0, y))}%`);
  };

  // Mobile swipe slider: derive active dot from scroll position (RTL-safe)
  const trackRef = useRef<HTMLDivElement>(null);
  const onTrackScroll = () => {
    const el = trackRef.current;
    if (!el) return;
    const idx = Math.round(Math.abs(el.scrollLeft) / el.clientWidth);
    if (idx !== active && idx >= 0 && idx < images.length) setActive(idx);
  };
  const scrollTo = (idx: number) => {
    const el = trackRef.current;
    if (!el) return;
    // RTL: offsets grow leftwards → negative scrollLeft
    const isRtl = getComputedStyle(el).direction === 'rtl';
    el.scrollTo({ left: isRtl ? -idx * el.clientWidth : idx * el.clientWidth, behavior: 'smooth' });
  };

  return (
    <div>
      {/* ── Desktop / tablet: framed main image with lens zoom ── */}
      <motion.div
        initial={{ clipPath: 'inset(100% 0 0 0 round 36px 28px 28px 28px)', opacity: 0 }}
        animate={{ clipPath: 'inset(0% 0 0 0 round 36px 28px 28px 28px)', opacity: 1 }}
        transition={{ duration: 0.9, ease: EASE }}
        className="relative hidden rounded-signature bg-white p-3 shadow-card md:block"
      >
        <div
          ref={frameRef}
          onPointerEnter={(e) => e.pointerType === 'mouse' && setZooming(true)}
          onPointerLeave={() => setZooming(false)}
          onPointerMove={handleMove}
          onClick={() => setLightbox(true)}
          className={cn(
            'relative aspect-[4/5] cursor-zoom-in overflow-hidden rounded-[26px_20px_20px_20px] bg-cream',
          )}
        >
          {/* soft petal decorations */}
          <img
            src="/petal.svg"
            alt=""
            aria-hidden
            className="pointer-events-none absolute -left-3 top-10 z-[1] w-8 opacity-40"
          />
          <img
            src="/petal.svg"
            alt=""
            aria-hidden
            className="pointer-events-none absolute -right-2 bottom-16 z-[1] w-6 -rotate-45 opacity-30"
          />
          <AnimatePresence mode="popLayout">
            <motion.img
              key={`${product.id}-${active}`}
              src={images[active]}
              alt={product.name}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 12 }}
              transition={{ duration: 0.4, ease: EASE }}
              style={{ transformOrigin: origin }}
              className={cn(
                'absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out',
                zooming && 'scale-[1.6]',
              )}
            />
          </AnimatePresence>
        </div>
        <Badges product={product} />
      </motion.div>

      {/* ── Mobile: swipe slider + dots ── */}
      <motion.div
        initial={{ scale: 0.97, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.7, ease: EASE }}
        className="relative md:hidden"
      >
        <div
          ref={trackRef}
          onScroll={onTrackScroll}
          className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto rounded-signature bg-cream"
        >
          {images.map((src, i) => (
            <img
              key={i}
              src={src}
              alt={`${product.name} — صورة ${i + 1}`}
              onClick={() => {
                setActive(i);
                setLightbox(true);
              }}
              className="aspect-[4/5] w-full shrink-0 snap-center object-cover"
              loading={i === 0 ? 'eager' : 'lazy'}
            />
          ))}
        </div>
        <Badges product={product} small />
        {images.length > 1 && (
          <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`الصورة ${i + 1}`}
                onClick={() => scrollTo(i)}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-300',
                  i === active ? 'w-5 bg-gold' : 'w-1.5 bg-plum/25',
                )}
              />
            ))}
          </div>
        )}
      </motion.div>

      {/* ── Thumbnails (desktop): active one wears a gold frame ── */}
      {images.length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.15 }}
          className="mt-4 hidden gap-3 md:flex"
        >
          {images.map((src, i) => (
            <button
              key={i}
              type="button"
              aria-label={`عرض الصورة ${i + 1}`}
              aria-pressed={i === active}
              onClick={() => setActive(i)}
              className={cn(
                'h-[110px] w-[88px] shrink-0 overflow-hidden rounded-2xl border-2 bg-cream transition-all duration-300',
                i === active
                  ? 'border-gold shadow-card'
                  : 'border-transparent opacity-70 hover:opacity-100',
              )}
            >
              <img src={src} alt="" loading="lazy" className="h-full w-full object-cover" />
            </button>
          ))}
        </motion.div>
      )}

      <AnimatePresence>
        {lightbox && (
          <Lightbox
            images={images}
            name={product.name}
            index={active}
            setIndex={setActive}
            onClose={() => setLightbox(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
