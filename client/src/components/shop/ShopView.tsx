"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Product } from "@/lib/types";
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ChevronLeft, Flower2, X } from 'lucide-react';
import { ProductCard } from "@/components/ProductCard";
import FiltersSidebar from '@/components/shop/FiltersSidebar';
import ShopToolbar from '@/components/shop/ShopToolbar';
import UpsellBanner from '@/components/shop/UpsellBanner';
import ShopPagination from '@/components/shop/ShopPagination';
import RecentlyViewed from '@/components/shop/RecentlyViewed';
import type { ShopFilters } from '@/components/shop/shop-utils';
import {
  CATEGORY_OPTIONS,
  PAGE_SIZE,
  PRICE_MAX,
  PRICE_MIN,
  applyFilters,
  filtersToParams,
  formatCount,
  parseFilters,
  recordProductView,
  sortProducts,
} from '@/components/shop/shop-utils';
import { useWishlist } from "@/components/useWishlist";
import { cn } from '@/lib/utils';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches,
  );
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const onChange = () => setIsDesktop(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return isDesktop;
}

function AnimatedTitle({ text }: { text: string }) {
  return (
    <h1 className="flex flex-wrap items-baseline gap-x-3 overflow-hidden font-heading text-[34px] font-bold leading-[1.3] text-plum md:text-[52px]">
      {text.split(' ').map((word, i) => (
        <motion.span
          key={`${word}-${i}`}
          initial={{ y: 26, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, ease: EASE, delay: 0.15 + i * 0.1 }}
          className="inline-block"
        >
          {word}
        </motion.span>
      ))}
    </h1>
  );
}

/** مطر بتلات خفيف في رأس الصفحة — 4 بتلات فقط */
function HeaderPetals() {
  const reduce = useReducedMotion();
  if (reduce) return null;
  const petals = [
    { start: '12%', size: 22, duration: 11, delay: 0, drift: 34 },
    { start: '38%', size: 16, duration: 13, delay: 2.5, drift: -28 },
    { start: '64%', size: 26, duration: 9.5, delay: 1.2, drift: 24 },
    { start: '86%', size: 18, duration: 14, delay: 4, drift: -32 },
  ];
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {petals.map((p, i) => (
        <motion.img
          key={i}
          src="/petal.svg"
          alt=""
          initial={{ y: '-15%', opacity: 0 }}
          animate={{
            y: ['-15%', '115%'],
            x: [0, p.drift, 0, -p.drift, 0],
            rotate: [0, 40, -25, 30, 0],
            opacity: [0, 0.5, 0.5, 0.5, 0],
          }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -translate-y-full"
          style={{ left: p.start, width: p.size, top: 0 }}
        />
      ))}
    </div>
  );
}

export default function Shop({ catalog }: { catalog: Product[] }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const filters = useMemo(
    () => parseFilters(new URLSearchParams(searchParams.toString())),
    [searchParams],
  );
  const wishlistMode = searchParams.get("filter") === "wishlist";
  const wishlist = useWishlist();

  const isDesktop = useIsDesktop();
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [cols, setCols] = useState<3 | 4>(3);
  const gridRef = useRef<HTMLDivElement>(null);

  const update = (patch: Partial<ShopFilters>, keepPage = false) => {
    const next: ShopFilters = { ...filters, ...patch };
    if (!keepPage) next.page = 1;
    const params = filtersToParams(next, new URLSearchParams(searchParams.toString()));
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const clearAll = () =>
    update({ cats: [], min: PRICE_MIN, max: PRICE_MAX, rating: 0, sale: false, fresh: false, uae: false, q: '' });

  const baseList = useMemo(() => {
    if (!wishlistMode) return catalog;
    return catalog.filter((p) => wishlist.has(p.slug));
  }, [wishlistMode, wishlist, catalog]);

  const filtered = useMemo(() => sortProducts(applyFilters(baseList, filters), filters.sort), [baseList, filters]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const page = Math.min(filters.page, totalPages);
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // scroll to top of grid when page changes
  const prevPage = useRef(page);
  useEffect(() => {
    if (prevPage.current !== page) {
      prevPage.current = page;
      gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [page]);

  // lock body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [drawerOpen]);

  const singleCat = filters.cats.length === 1 ? CATEGORY_OPTIONS.find((c) => c.key === filters.cats[0]) : undefined;
  const title = wishlistMode ? 'المفضلة' : singleCat ? singleCat.label : 'المتجر';
  const subtitle = wishlistMode
    ? 'كل القطع التي أحببتِها في مكان واحد — بانتظار أن تدلّلي بها نفسكِ.'
    : singleCat
      ? `${formatCount(filtered.length)} ضمن فئة ${singleCat.label} — مختارة بعناية لتناسب ذوقكِ.`
      : 'كل ما تحتاجينه لجمالكِ — منتجات أصلية مختارة بعناية ومحبّة.';

  const effectiveCols = isDesktop ? (sidebarVisible ? cols : 4) : 2;
  const bannerAfter = effectiveCols * 2; // insert banner after second row
  const beforeBanner = pageItems.slice(0, bannerAfter);
  const afterBanner = pageItems.slice(bannerAfter);
  const gridKey = `${page}|${filters.sort}|${filters.q}|${filters.cats.join('.')}|${filters.min}-${filters.max}|${filters.rating}|${filters.sale}${filters.fresh}${filters.uae}|${wishlistMode}`;

  const renderCard = (p: (typeof pageItems)[number], i: number) => (
    <motion.div
      key={`${p.id}-${i}`}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.55, ease: EASE, delay: (i % effectiveCols) * 0.05 + Math.floor(i / effectiveCols) * 0.07 }}
      onClickCapture={() => recordProductView(p.slug)}
    >
      <ProductCard product={p} />
    </motion.div>
  );

  return (
    <div>
      {/* ── القسم 1: رأس الصفحة ─────────────────────────────── */}
      <section className="bg-silk relative flex min-h-[220px] items-center overflow-hidden">
        <HeaderPetals />
        <div className="container-voya relative py-10">
          <motion.nav
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            aria-label="مسار التنقل"
            className="mb-3 flex items-center gap-1.5 text-[13px] text-ink-soft"
          >
            <Link href="/" className="transition-colors hover:text-rose-deep">
              الرئيسية
            </Link>
            <ChevronLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
            <span className="text-rose-deep">{wishlistMode ? 'المفضلة' : 'المتجر'}</span>
            {singleCat && !wishlistMode && (
              <>
                <ChevronLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
                <span className="text-rose-deep">{singleCat.label}</span>
              </>
            )}
          </motion.nav>
          <div className="flex flex-wrap items-baseline gap-x-4">
            <AnimatedTitle key={title} text={title} />
            <motion.span
              key={filtered.length}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: EASE, delay: 0.4 }}
              className="tnum text-sm font-medium text-mauve"
            >
              ({formatCount(filtered.length)})
            </motion.span>
          </div>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE, delay: 0.55 }}
            className="font-body mt-3 max-w-xl text-[15px] leading-[1.9] text-ink-soft md:text-[17px]"
          >
            {subtitle}
          </motion.p>
          <motion.img
            src="/ornament-thread.svg"
            alt=""
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.65 }}
            className="mt-4 h-5 w-40"
          />
        </div>
      </section>

      {/* ── القسم 2: شريط الأدوات اللزج ─────────────────────── */}
      <div className="container-voya">
        <ShopToolbar
          filters={filters}
          onChange={update}
          resultCount={filtered.length}
          sidebarVisible={isDesktop ? sidebarVisible : drawerOpen}
          onToggleSidebar={() => {
            if (isDesktop) {
              setSidebarVisible((v) => {
                setCols(v ? 4 : 3);
                return !v;
              });
            } else {
              setDrawerOpen(true);
            }
          }}
          cols={cols}
          onColsChange={setCols}
        />
      </div>

      {/* ── القسم 3: الفلاتر + شبكة المنتجات ─────────────────── */}
      <div className="container-voya py-8 md:py-10">
        <div ref={gridRef} className="flex items-start gap-8 scroll-mt-40">
          {/* desktop sidebar */}
          <AnimatePresence initial={false}>
            {isDesktop && sidebarVisible && (
              <motion.aside
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 280, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.35, ease: EASE }}
                className="sticky top-[170px] hidden max-h-[calc(100dvh-190px)] shrink-0 overflow-y-auto overflow-x-hidden no-scrollbar lg:block"
              >
                <div className="w-[280px] pl-2">
                  <FiltersSidebar catalog={catalog} filters={filters} onChange={update} />
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          {/* grid */}
          <div className="min-w-0 flex-1">
            {pageItems.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: EASE }}
                className="flex flex-col items-center gap-4 py-24 text-center"
              >
                <span className="relative flex h-24 w-24 items-center justify-center rounded-full bg-blush-100">
                  <Flower2 className="h-11 w-11 text-rose/60" strokeWidth={1.25} />
                  <img src="/petal.svg" alt="" aria-hidden className="absolute -left-2 -top-1 w-6 rotate-45 opacity-40" />
                </span>
                <h2 className="font-heading text-xl font-semibold text-plum">
                  لم نجد ما يطابق بحثكِ… جرّبي فئة أخرى 🌸
                </h2>
                <p className="font-body text-sm text-ink-soft">
                  عدّلي الفلاتر أو كلمة البحث، أو تصفّحي تشكيلتنا كاملة.
                </p>
                <button
                  type="button"
                  onClick={clearAll}
                  className="mt-2 flex h-11 items-center rounded-full bg-gradient-rose px-7 text-sm font-bold text-white shadow-card transition-shadow hover:shadow-card-hover"
                >
                  عرض كل المنتجات
                </button>
              </motion.div>
            ) : (
              <div
                key={gridKey}
                className={cn(
                  'grid grid-cols-2 gap-3 md:gap-5',
                  effectiveCols === 3 ? 'lg:grid-cols-3' : 'lg:grid-cols-4',
                )}
              >
                {beforeBanner.map(renderCard)}
                <UpsellBanner />
                {afterBanner.map(renderCard)}
              </div>
            )}

            {/* ── ترقيم الصفحات ─────────────────────────────── */}
            <div className="mt-12">
              <ShopPagination
                page={page}
                totalPages={totalPages}
                from={filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}
                to={Math.min(page * PAGE_SIZE, filtered.length)}
                total={filtered.length}
                onPage={(p) => update({ page: p }, true)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── القسم 4: شاهدتِه مؤخرًا ─────────────────────────── */}
      <RecentlyViewed catalog={catalog} />

      {/* ── دراور فلاتر الجوال ──────────────────────────────── */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 z-[90] bg-[rgba(67,34,51,0.4)] lg:hidden"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.4, ease: EASE }}
              className="fixed inset-y-0 right-0 z-[95] flex w-[85%] max-w-sm flex-col bg-white shadow-modal lg:hidden"
              role="dialog"
              aria-label="فلاتر المنتجات"
            >
              <div className="flex items-center justify-between border-b border-blush-200 px-5 py-4">
                <h2 className="font-heading text-lg font-bold text-plum">الفلاتر</h2>
                <button
                  type="button"
                  aria-label="إغلاق الفلاتر"
                  onClick={() => setDrawerOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-plum transition-colors hover:bg-blush-100"
                >
                  <X className="h-5 w-5" strokeWidth={1.5} />
                </button>
              </div>
              <div data-lenis-prevent className="flex-1 overflow-y-auto px-5 py-5">
                <FiltersSidebar catalog={catalog} filters={filters} onChange={update} />
              </div>
              <div className="border-t border-blush-200 p-4">
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  className="tnum flex h-12 w-full items-center justify-center rounded-full bg-gradient-rose text-sm font-bold text-white shadow-card transition-shadow hover:shadow-card-hover"
                >
                  عرض {formatCount(filtered.length)}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
