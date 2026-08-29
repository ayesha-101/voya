"use client";

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BadgeCheck, Star, ThumbsUp, X } from 'lucide-react';
import type { Product } from "@/lib/types";
import RatingStars from '@/components/product/RatingStars';
import { getDistribution, getReviews, type Review } from '@/components/product/reviewsData';
import { cn } from '@/lib/utils';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const PREVIEW_COUNT = 3;

/* ── Write-review bottom drawer ─────────────────────────── */

function ReviewDrawer({ product, onClose }: { product: Product; onClose: () => void }) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [sent, setSent] = useState(false);

  const canSubmit = rating > 0 && title.trim().length > 0 && text.trim().length > 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[90] flex items-end justify-center bg-plum/45 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="كتابة مراجعة"
    >
      <motion.div
        initial={{ opacity: 0, y: '100%' }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: '100%' }}
        transition={{ duration: 0.4, ease: EASE }}
        onClick={(e) => e.stopPropagation()}
        data-lenis-prevent
        className="max-h-[85dvh] w-full max-w-lg overflow-y-auto rounded-t-[32px] bg-white p-6 shadow-modal sm:rounded-[32px] md:p-8"
      >
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-bold text-plum">اكتبي مراجعتكِ</h3>
            <p className="mt-1 text-sm text-ink-soft">{product.name}</p>
          </div>
          <button
            type="button"
            aria-label="إغلاق"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-blush-100 hover:text-plum"
          >
            <X className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>

        {sent ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="flex flex-col items-center py-10 text-center"
          >
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-blush-200 text-rose-deep">
              <BadgeCheck className="h-8 w-8" strokeWidth={1.5} />
            </span>
            <h4 className="mt-4 text-lg font-bold text-plum">شكرًا يا غالية! 🌸</h4>
            <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-ink-soft">
              ستُنشر مراجعتكِ بعد المراجعة من فريقنا خلال 24 ساعة.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 rounded-full bg-gradient-rose px-8 py-3 text-sm font-bold text-white transition-transform duration-300 hover:-translate-y-0.5"
            >
              إغلاق
            </button>
          </motion.div>
        ) : (
          <form
            className="mt-6 space-y-5"
            onSubmit={(e) => {
              e.preventDefault();
              if (canSubmit) setSent(true);
            }}
          >
            {/* interactive stars — gold shimmer on hover */}
            <div>
              <span className="mb-2 block text-sm font-bold text-plum">تقييمكِ</span>
              <div className="flex items-center gap-1.5" onMouseLeave={() => setHovered(0)}>
                {Array.from({ length: 5 }).map((_, i) => {
                  const v = i + 1;
                  const filled = v <= (hovered || rating);
                  return (
                    <button
                      key={v}
                      type="button"
                      aria-label={`${v} نجوم`}
                      onMouseEnter={() => setHovered(v)}
                      onClick={() => setRating(v)}
                      className="text-gold transition-transform duration-150 hover:scale-125"
                    >
                      <Star
                        className="h-8 w-8 drop-shadow-sm"
                        strokeWidth={1.5}
                        fill={filled ? 'currentColor' : 'none'}
                      />
                    </button>
                  );
                })}
                <span className="tnum ms-2 text-sm font-semibold text-ink-soft">
                  {rating > 0 ? `${rating}/5` : 'اختاري تقييمكِ'}
                </span>
              </div>
            </div>

            <div>
              <label htmlFor="review-title" className="mb-2 block text-sm font-bold text-plum">
                عنوان المراجعة
              </label>
              <input
                id="review-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="لخّصي تجربتكِ بكلمات قليلة"
                className="h-12 w-full rounded-2xl border border-blush-200 bg-blush-50 px-4 text-sm text-plum outline-none transition-colors placeholder:text-ink-soft/60 focus:border-rose"
              />
            </div>

            <div>
              <label htmlFor="review-text" className="mb-2 block text-sm font-bold text-plum">
                تفاصيل المراجعة
              </label>
              <textarea
                id="review-text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={4}
                placeholder="ما الذي أعجبكِ؟ وهل تنصحين به لصديقاتكِ؟"
                className="font-body w-full resize-none rounded-2xl border border-blush-200 bg-blush-50 p-4 text-sm leading-relaxed text-plum outline-none transition-colors placeholder:text-ink-soft/60 focus:border-rose"
              />
            </div>

            <button
              type="submit"
              disabled={!canSubmit}
              className="flex h-12 w-full items-center justify-center rounded-full bg-gradient-rose text-sm font-bold text-white transition-all duration-300 hover:shadow-card-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              إرسال مراجعتي
            </button>
          </form>
        )}
      </motion.div>
    </motion.div>
  );
}

/* ── Single review card ─────────────────────────────────── */

function ReviewCard({ review, index }: { review: Review; index: number }) {
  const [voted, setVoted] = useState(false);

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: EASE, delay: index * 0.12 }}
      className="rounded-[28px] bg-white p-5 shadow-card md:p-6"
    >
      <div className="flex items-center justify-between gap-3">
        <RatingStars rating={review.rating} starClassName="h-3.5 w-3.5" />
        <span className="text-xs text-ink-soft">{review.date}</span>
      </div>
      <h4 className="mt-3 text-base font-bold text-plum">{review.title}</h4>
      <p className="font-body mt-2 text-sm leading-[1.85] text-ink-soft">{review.text}</p>
      <div className="mt-4 flex items-center justify-between gap-3 border-t border-blush-200 pt-4">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blush-200 text-sm font-bold text-rose-deep">
            {review.name.charAt(0)}
          </span>
          <div>
            <span className="block text-sm font-bold text-plum">{review.name}</span>
            {review.verified && (
              <span className="flex items-center gap-1 text-[11px] font-medium text-success">
                <BadgeCheck className="h-3 w-3" strokeWidth={2} />
                عميلة موثّقة ✓
              </span>
            )}
          </div>
        </div>
        <motion.button
          type="button"
          whileTap={voted ? undefined : { scale: 1.12 }}
          onClick={() => setVoted(true)}
          className={cn(
            'tnum flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-bold transition-colors',
            voted
              ? 'border-gold bg-gold-soft text-gold'
              : 'border-blush-200 text-ink-soft hover:border-gold hover:text-plum',
          )}
        >
          <ThumbsUp className="h-3.5 w-3.5" strokeWidth={1.5} fill={voted ? 'currentColor' : 'none'} />
          مفيد ({review.helpful + (voted ? 1 : 0)})
        </motion.button>
      </div>
    </motion.article>
  );
}

/* ── Section ────────────────────────────────────────────── */

export default function ReviewsSection({ product }: { product: Product }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const reviews = getReviews(product);
  const distribution = getDistribution(product);
  const visible = showAll ? reviews : reviews.slice(0, PREVIEW_COUNT);

  return (
    <section id="reviews" className="mt-16 scroll-mt-24 bg-blush-100 py-16 md:mt-24 md:py-20">
      <div className="container-voya">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.6, ease: EASE }}
        >
          <span className="text-xs font-bold tracking-[0.03em] text-mauve">من قلب عميلاتنا</span>
          <h2 className="mt-2 text-[26px] font-bold leading-[1.25] text-plum md:text-[32px]">
            آراء عميلاتنا 🌸
          </h2>
          <img src="/ornament-thread.svg" alt="" aria-hidden className="mt-3 h-5 w-40" />
        </motion.div>

        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(300px,2fr)_3fr] lg:gap-14">
          {/* summary (right column in RTL) */}
          <motion.aside
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: EASE }}
            className="h-fit rounded-[32px] bg-white p-6 shadow-card md:p-8 lg:sticky lg:top-24"
          >
            <div className="flex items-end gap-4">
              <span className="tnum font-heading text-[64px] font-bold leading-none text-plum">
                {product.rating.toFixed(1)}
              </span>
              <div className="pb-2">
                <RatingStars rating={product.rating} starClassName="h-5 w-5" />
                <p className="tnum mt-1.5 text-sm text-ink-soft">من {product.reviews} مراجعة</p>
              </div>
            </div>

            <div className="mt-7 space-y-2.5">
              {distribution.map((row, i) => (
                <div key={row.stars} className="flex items-center gap-3">
                  <span className="tnum flex w-8 items-center gap-1 text-xs font-bold text-plum">
                    {row.stars}
                    <Star className="h-3 w-3 text-gold" strokeWidth={1.5} fill="currentColor" />
                  </span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-blush-200">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${row.pct}%` }}
                      viewport={{ once: true, amount: 0.6 }}
                      transition={{ duration: 1, ease: EASE, delay: i * 0.1 }}
                      className="h-full rounded-full bg-rose"
                    />
                  </div>
                  <span className="tnum w-9 text-left text-xs font-medium text-ink-soft">{row.pct}%</span>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="mt-7 flex h-12 w-full items-center justify-center rounded-full bg-gradient-rose text-sm font-bold text-white transition-all duration-300 hover:shadow-card-hover"
            >
              اكتبي مراجعتكِ
            </button>
          </motion.aside>

          {/* list */}
          <div className="space-y-4">
            {visible.map((r, i) => (
              <ReviewCard key={r.id} review={r} index={i % PREVIEW_COUNT} />
            ))}

            {reviews.length > PREVIEW_COUNT && !showAll && (
              <motion.button
                type="button"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                onClick={() => setShowAll(true)}
                className="flex h-12 w-full items-center justify-center rounded-full border-2 border-rose text-sm font-bold text-rose-deep transition-colors hover:bg-rose hover:text-white"
              >
                عرض المزيد من المراجعات ({reviews.length})
              </motion.button>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {drawerOpen && <ReviewDrawer product={product} onClose={() => setDrawerOpen(false)} />}
      </AnimatePresence>
    </section>
  );
}
