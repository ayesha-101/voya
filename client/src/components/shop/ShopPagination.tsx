"use client";

import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

function pageList(current: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | '…')[] = [1];
  if (current > 3) pages.push('…');
  for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) pages.push(p);
  if (current < total - 2) pages.push('…');
  pages.push(total);
  return pages;
}

export default function ShopPagination({
  page,
  totalPages,
  from,
  to,
  total,
  onPage,
}: {
  page: number;
  totalPages: number;
  from: number;
  to: number;
  total: number;
  onPage: (p: number) => void;
}) {
  if (totalPages <= 1) return null;

  const arrowCls =
    'flex h-11 w-11 items-center justify-center rounded-full border border-blush-200 bg-white text-plum transition-colors hover:border-rose hover:text-rose-deep disabled:cursor-not-allowed disabled:opacity-40';

  return (
    <nav aria-label="ترقيم الصفحات" className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-2">
        <button type="button" aria-label="الصفحة السابقة" disabled={page <= 1} onClick={() => onPage(page - 1)} className={arrowCls}>
          <ChevronRight className="h-5 w-5" strokeWidth={1.5} />
        </button>
        {pageList(page, totalPages).map((p, i) =>
          p === '…' ? (
            <span key={`dots-${i}`} className="px-1 text-ink-soft">
              …
            </span>
          ) : (
            <motion.button
              key={p}
              type="button"
              onClick={() => onPage(p)}
              animate={p === page ? { scale: [0.9, 1] } : { scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 20 }}
              aria-current={p === page ? 'page' : undefined}
              className={cn(
                'tnum flex h-11 min-w-11 items-center justify-center rounded-full px-3 text-sm font-bold transition-all duration-300',
                p === page
                  ? 'bg-gradient-rose text-white shadow-card'
                  : 'bg-blush-200 text-mauve hover:bg-blush-200/70 hover:text-rose-deep',
              )}
            >
              {p.toLocaleString('ar-SA-u-nu-latn')}
            </motion.button>
          ),
        )}
        <button
          type="button"
          aria-label="الصفحة التالية"
          disabled={page >= totalPages}
          onClick={() => onPage(page + 1)}
          className={arrowCls}
        >
          <ChevronLeft className="h-5 w-5" strokeWidth={1.5} />
        </button>
      </div>
      <p className="tnum text-xs text-ink-soft">
        عرض {from.toLocaleString('ar-SA-u-nu-latn')}–{to.toLocaleString('ar-SA-u-nu-latn')} من{' '}
        {total.toLocaleString('ar-SA-u-nu-latn')} منتجًا
      </p>
    </nav>
  );
}
