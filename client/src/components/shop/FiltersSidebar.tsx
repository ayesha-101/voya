"use client";

import type { Product } from "@/lib/types";
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Baby,
  ChevronDown,
  Droplets,
  Flag,
  Palette,
  Sparkles,
  SprayCan,
  Star,
  Sun,
  Waves,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { formatPrice } from "@/lib/voya";
import type { ShopFilters } from '@/components/shop/shop-utils';
import { CATEGORY_OPTIONS, PRICE_MAX, PRICE_MIN, categoryCount, formatCount } from '@/components/shop/shop-utils';
import { cn } from '@/lib/utils';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  sparkles: Sparkles,
  droplets: Droplets,
  waves: Waves,
  palette: Palette,
  spray: SprayCan,
  baby: Baby,
  sun: Sun,
  flag: Flag,
};

function FilterGroup({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-blush-200 pb-5 last:border-b-0 last:pb-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between py-1 font-heading text-[15px] font-semibold text-plum transition-colors hover:text-rose-deep"
      >
        {title}
        <ChevronDown
          className={cn('h-4 w-4 text-ink-soft transition-transform duration-300', open && 'rotate-180')}
          strokeWidth={1.5}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="overflow-hidden"
          >
            <div className="pt-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** مفتاح تبديل وردي ناعم */
function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="group flex w-full items-center justify-between py-2 text-sm text-plum transition-colors hover:text-rose-deep"
    >
      <span>{label}</span>
      <span
        className={cn(
          'relative flex h-6 w-11 shrink-0 items-center rounded-full px-0.5 transition-colors duration-300',
          checked ? 'bg-gradient-rose' : 'bg-blush-200 group-hover:bg-blush-200/70',
        )}
      >
        <motion.span
          layout
          transition={{ type: 'spring', stiffness: 500, damping: 32 }}
          className={cn(
            'h-5 w-5 rounded-full bg-white shadow-sm',
            checked ? 'ms-auto' : 'ms-0',
          )}
        />
      </span>
    </button>
  );
}

export default function FiltersSidebar({
  catalog,
  filters,
  onChange,
}: {
  catalog: Product[];
  filters: ShopFilters;
  onChange: (patch: Partial<ShopFilters>) => void;
}) {
  // حالة محلية لسحب المزلاج بسلاسة؛ تُثبَّت في الرابط عند الإفلات.
  // key على العنصر يعيد التركيب عند تغيّر المدى بدل setState داخل تأثير.
  const [range, setRange] = useState<[number, number]>([filters.min, filters.max]);

  const hasActive =
    filters.cats.length > 0 ||
    filters.min > PRICE_MIN ||
    filters.max < PRICE_MAX ||
    filters.rating > 0 ||
    filters.sale ||
    filters.fresh ||
    filters.uae;

  return (
    <div className="flex flex-col gap-5 rounded-[28px] bg-white p-6 shadow-card">
      {/* ── الفئات ── */}
      <FilterGroup title="الفئات">
        <ul className="flex flex-col gap-0.5">
          {CATEGORY_OPTIONS.map((c) => {
            const Icon = CATEGORY_ICONS[c.icon] ?? Sparkles;
            const active = filters.cats.includes(c.key);
            return (
              <li key={c.key}>
                <button
                  type="button"
                  aria-pressed={active}
                  onClick={() => onChange({ cats: active ? [] : [c.key] })}
                  className={cn(
                    'group relative flex w-full items-center gap-2.5 overflow-hidden rounded-2xl px-3 py-2.5 text-sm transition-colors duration-300',
                    active ? 'bg-blush-200 font-bold text-rose-deep' : 'text-plum hover:text-rose-deep',
                  )}
                >
                  {/* hover wash slides in behind the row */}
                  {!active && (
                    <span className="absolute inset-0 -translate-x-full bg-blush-100 transition-transform duration-300 group-hover:translate-x-0" />
                  )}
                  <Icon
                    className={cn('relative h-4 w-4 shrink-0', active ? 'text-rose-deep' : 'text-rose')}
                    strokeWidth={1.5}
                  />
                  <span className="relative flex-1 text-start">{c.label}</span>
                  <span
                    className={cn(
                      'tnum relative rounded-full px-2 py-0.5 text-[11px] font-bold',
                      active ? 'bg-white/70 text-rose-deep' : 'bg-blush-100 text-mauve',
                    )}
                  >
                    {categoryCount(catalog, c.key)}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </FilterGroup>

      {/* ── السعر ── */}
      <FilterGroup title="السعر">
        <div dir="ltr" className="px-1 pt-2">
          <Slider
            key={`${filters.min}-${filters.max}`}
            min={PRICE_MIN}
            max={PRICE_MAX}
            step={5}
            minStepsBetweenThumbs={1}
            value={range}
            onValueChange={(v: number[]) => setRange([v[0] ?? PRICE_MIN, v[1] ?? PRICE_MAX])}
            onValueCommit={(v: number[]) => onChange({ min: v[0] ?? PRICE_MIN, max: v[1] ?? PRICE_MAX })}
            className="[&_[data-slot=slider-thumb]]:size-5 [&_[data-slot=slider-thumb]]:border-rose [&_[data-slot=slider-track]]:bg-blush-200 [&_[data-slot=slider-range]]:bg-gradient-rose"
          />
        </div>
        <div className="mt-4 flex items-center justify-center gap-2">
          <span className="tnum rounded-full bg-blush-100 px-3.5 py-1.5 text-xs font-bold text-mauve">
            {formatPrice(range[0])}
          </span>
          <span className="text-ink-soft">—</span>
          <span className="tnum rounded-full bg-blush-100 px-3.5 py-1.5 text-xs font-bold text-mauve">
            {formatPrice(range[1])}
          </span>
        </div>
      </FilterGroup>

      {/* ── العروض ── */}
      <FilterGroup title="العروض">
        <ToggleRow label="الخصومات فقط" checked={filters.sale} onChange={(v) => onChange({ sale: v })} />
        <ToggleRow label="وصل حديثًا" checked={filters.fresh} onChange={(v) => onChange({ fresh: v })} />
        <ToggleRow label="صنع في الإمارات 🇦🇪" checked={filters.uae} onChange={(v) => onChange({ uae: v })} />
      </FilterGroup>

      {/* ── التقييم ── */}
      <FilterGroup title="التقييم">
        <div className="flex flex-wrap gap-2 pt-1">
          {[4, 3].map((r) => {
            const active = filters.rating === r;
            return (
              <button
                key={r}
                type="button"
                aria-pressed={active}
                onClick={() => onChange({ rating: active ? 0 : r })}
                className={cn(
                  'tnum flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-bold transition-all duration-300',
                  active ? 'bg-gradient-rose text-white shadow-card' : 'bg-blush-200 text-mauve hover:bg-blush-200/70',
                )}
              >
                <Star
                  className={cn('h-3.5 w-3.5', active ? 'text-gold-soft' : 'text-gold')}
                  strokeWidth={1.5}
                  fill="currentColor"
                />
                {r}+
              </button>
            );
          })}
        </div>
      </FilterGroup>

      {/* ── مسح الفلاتر ── */}
      {hasActive && (
        <button
          type="button"
          onClick={() =>
            onChange({ cats: [], min: PRICE_MIN, max: PRICE_MAX, rating: 0, sale: false, fresh: false, uae: false, q: '' })
          }
          className="self-center text-xs font-bold text-ink-soft underline underline-offset-4 transition-colors hover:text-rose-deep"
        >
          مسح الفلاتر
        </button>
      )}
    </div>
  );
}

export { formatCount };
