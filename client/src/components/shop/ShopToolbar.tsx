"use client";

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpDown, Check, ChevronDown, LayoutGrid, Rows3, Search, SlidersHorizontal, X } from 'lucide-react';
import type { ShopFilters, SortKey } from '@/components/shop/shop-utils';
import { CATEGORY_OPTIONS, PRICE_MAX, PRICE_MIN, SORT_OPTIONS, formatCount } from '@/components/shop/shop-utils';
import { cn } from '@/lib/utils';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

interface Chip {
  id: string;
  label: string;
  remove: () => void;
}

function SortDropdown({ value, onChange }: { value: SortKey; onChange: (k: SortKey) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const current = SORT_OPTIONS.find((o) => o.key === value) ?? SORT_OPTIONS[0];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex h-10 items-center gap-2 rounded-full bg-blush-200 px-4 text-sm font-bold text-mauve transition-colors hover:bg-blush-200/70 hover:text-rose-deep"
      >
        <ArrowUpDown className="h-4 w-4" strokeWidth={1.5} />
        <span className="max-w-40 truncate">{current?.label}</span>
        <ChevronDown className={cn('h-4 w-4 transition-transform', open && 'rotate-180')} strokeWidth={1.5} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="absolute left-0 top-full z-30 mt-2 w-56 rounded-3xl border border-blush-200 bg-white p-2 shadow-card-hover"
          >
            {SORT_OPTIONS.map((o) => (
              <li key={o.key}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(o.key);
                    setOpen(false);
                  }}
                  className={cn(
                    'flex w-full items-center justify-between rounded-2xl px-4 py-2.5 text-sm font-medium transition-colors',
                    o.key === value ? 'bg-blush-100 text-rose-deep' : 'text-plum hover:bg-blush-100 hover:text-rose-deep',
                  )}
                >
                  {o.label}
                  {o.key === value && <Check className="h-4 w-4" strokeWidth={1.5} />}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ShopToolbar({
  filters,
  onChange,
  resultCount,
  sidebarVisible,
  onToggleSidebar,
  cols,
  onColsChange,
}: {
  filters: ShopFilters;
  onChange: (patch: Partial<ShopFilters>) => void;
  resultCount: number;
  sidebarVisible: boolean;
  onToggleSidebar: () => void;
  cols: 3 | 4;
  onColsChange: (c: 3 | 4) => void;
}) {
  const [searchOpen, setSearchOpen] = useState(Boolean(filters.q));
  const [draft, setDraft] = useState(filters.q);
  const inputRef = useRef<HTMLInputElement>(null);

  // مزامنة المسوّدة مع الرابط حين يتغيّر من خارج الحقل (إزالة شريحة أو
  // مسح الكل) — تُحسب أثناء العرض بدل setState داخل تأثير.
  const [lastQ, setLastQ] = useState(filters.q);
  if (lastQ !== filters.q) {
    setLastQ(filters.q);
    setDraft(filters.q);
    if (filters.q) setSearchOpen(true);
  }

  // debounce 300ms
  useEffect(() => {
    const t = setTimeout(() => {
      if (draft !== filters.q) onChange({ q: draft });
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft]);

  const chips: Chip[] = [];
  filters.cats.forEach((k) => {
    const label = CATEGORY_OPTIONS.find((c) => c.key === k)?.label ?? k;
    chips.push({ id: `cat-${k}`, label, remove: () => onChange({ cats: filters.cats.filter((c) => c !== k) }) });
  });
  if (filters.min > PRICE_MIN || filters.max < PRICE_MAX) {
    chips.push({
      id: 'price',
      label:
        filters.max < PRICE_MAX && filters.min <= PRICE_MIN
          ? `أقل من ${filters.max} د.إ`
          : `${filters.min}–${filters.max} د.إ`,
      remove: () => onChange({ min: PRICE_MIN, max: PRICE_MAX }),
    });
  }
  if (filters.rating > 0) {
    chips.push({ id: 'rating', label: `تقييم ${filters.rating}+`, remove: () => onChange({ rating: 0 }) });
  }
  if (filters.sale) chips.push({ id: 'sale', label: 'الخصومات فقط', remove: () => onChange({ sale: false }) });
  if (filters.fresh) chips.push({ id: 'fresh', label: 'وصل حديثًا', remove: () => onChange({ fresh: false }) });
  if (filters.uae) chips.push({ id: 'uae', label: 'صنع في الإمارات', remove: () => onChange({ uae: false }) });
  if (filters.q.trim()) {
    chips.push({ id: 'q', label: `بحث: ${filters.q.trim()}`, remove: () => onChange({ q: '' }) });
  }

  return (
    <div className="sticky top-[72px] z-40 -mx-6 border-b border-blush-200 bg-[rgba(255,255,255,0.85)] px-6 backdrop-blur-[16px] md:-mx-10 md:px-10 lg:-mx-16 lg:px-16">
      <div className="mx-auto flex w-full max-w-[1280px] flex-wrap items-center justify-between gap-3 py-3">
        {/* right (RTL start): filters button + count */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleSidebar}
            aria-pressed={sidebarVisible}
            className={cn(
              'flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-bold transition-colors',
              sidebarVisible
                ? 'border-transparent bg-gradient-rose text-white shadow-card'
                : 'border-blush-200 bg-white text-plum hover:border-rose hover:text-rose-deep',
            )}
          >
            <SlidersHorizontal className="h-4 w-4" strokeWidth={1.5} />
            الفلاتر
          </button>
          <motion.span
            key={resultCount}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="tnum text-sm font-medium text-mauve"
          >
            {formatCount(resultCount)}
          </motion.span>
        </div>

        {/* left (RTL end): search + sort + view toggle */}
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            <motion.div
              animate={{ width: searchOpen ? 240 : 0, opacity: searchOpen ? 1 : 0 }}
              transition={{ duration: 0.35, ease: EASE }}
              className="overflow-hidden"
            >
              <input
                ref={inputRef}
                type="search"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="ابحثي في المتجر…"
                className="h-10 w-[240px] rounded-full border border-blush-200 bg-white px-4 text-sm text-plum outline-none transition-colors placeholder:text-ink-soft focus:border-rose"
              />
            </motion.div>
            <button
              type="button"
              aria-label="بحث في المتجر"
              onClick={() => {
                if (searchOpen) {
                  setDraft('');
                  onChange({ q: '' });
                  setSearchOpen(false);
                } else {
                  setSearchOpen(true);
                  setTimeout(() => inputRef.current?.focus(), 120);
                }
              }}
              className="flex h-10 w-10 items-center justify-center rounded-full text-rose transition-colors hover:bg-blush-100 hover:text-rose-deep"
            >
              {searchOpen ? <X className="h-5 w-5" strokeWidth={1.5} /> : <Search className="h-5 w-5" strokeWidth={1.5} />}
            </button>
          </div>

          <SortDropdown value={filters.sort} onChange={(sort) => onChange({ sort })} />

          <div className="hidden items-center gap-1 rounded-full border border-blush-200 bg-white p-1 lg:flex">
            {([3, 4] as const).map((c) => (
              <button
                key={c}
                type="button"
                aria-label={`عرض ${c} أعمدة`}
                aria-pressed={cols === c}
                onClick={() => onColsChange(c)}
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full transition-colors',
                  cols === c ? 'bg-gradient-rose text-white' : 'text-ink-soft hover:text-rose-deep',
                )}
              >
                {c === 3 ? <Rows3 className="h-4 w-4" strokeWidth={1.5} /> : <LayoutGrid className="h-4 w-4" strokeWidth={1.5} />}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* active filter chips */}
      <AnimatePresence initial={false}>
        {chips.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="overflow-hidden"
          >
            <div className="mx-auto flex w-full max-w-[1280px] flex-wrap items-center gap-2 pb-3">
              <AnimatePresence initial={false} mode="popLayout">
                {chips.map((chip) => (
                  <motion.button
                    layout
                    key={chip.id}
                    type="button"
                    onClick={chip.remove}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0, width: 0, marginInline: 0, paddingInline: 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                    className="flex items-center gap-1.5 overflow-hidden whitespace-nowrap rounded-full bg-gradient-rose px-3.5 py-1.5 text-xs font-bold text-white shadow-card"
                  >
                    {chip.label}
                    <X className="h-3.5 w-3.5" strokeWidth={2} />
                  </motion.button>
                ))}
              </AnimatePresence>
              <button
                type="button"
                onClick={() =>
                  onChange({ cats: [], min: PRICE_MIN, max: PRICE_MAX, rating: 0, sale: false, fresh: false, uae: false, q: '' })
                }
                className="rounded-full px-3 py-1.5 text-xs font-bold text-ink-soft underline underline-offset-4 transition-colors hover:text-rose-deep"
              >
                مسح الكل
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
