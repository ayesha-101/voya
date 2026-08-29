import type { Product } from "@/lib/types";
import { badgeOf } from "@/lib/voya";

export const PAGE_SIZE = 12;
export const PRICE_MIN = 35;
export const PRICE_MAX = 300;

/* الكتالوج يأتي من الواجهة البرمجية — لا نسخ ثابتة بعد الآن. */

export type SortKey = 'popular' | 'new' | 'price-asc' | 'price-desc' | 'rating';

export const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'popular', label: 'الأكثر مبيعًا' },
  { key: 'new', label: 'الأحدث' },
  { key: 'rating', label: 'الأعلى تقييمًا' },
  { key: 'price-asc', label: 'السعر: من الأقل' },
  { key: 'price-desc', label: 'السعر: من الأعلى' },
];

/** الفئات الحقيقية لمتجر فويا — مفاتيحها تطابق categoryKey في بيانات المنتجات */
export const CATEGORY_OPTIONS = [
  { key: 'beauty', label: 'العناية بالجمال', icon: 'sparkles' },
  { key: 'skin-care', label: 'العناية بالبشرة', icon: 'droplets' },
  { key: 'hair-care', label: 'العناية بالشعر', icon: 'waves' },
  { key: 'makeup', label: 'مكياج', icon: 'palette' },
  { key: 'fragrance', label: 'عطور', icon: 'spray' },
  { key: 'kids', label: 'عالم الأطفال', icon: 'baby' },
  { key: 'summer', label: 'أجواء الصيف', icon: 'sun' },
  { key: 'uae', label: 'صنع في الإمارات', icon: 'flag' },
] as const;

export type CategoryKey = (typeof CATEGORY_OPTIONS)[number]['key'];

export interface ShopFilters {
  cats: string[];
  min: number;
  max: number;
  rating: number;
  sale: boolean;
  fresh: boolean;
  uae: boolean;
  q: string;
  sort: SortKey;
  page: number;
}

export const DEFAULT_FILTERS: ShopFilters = {
  cats: [],
  min: PRICE_MIN,
  max: PRICE_MAX,
  rating: 0,
  sale: false,
  fresh: false,
  uae: false,
  q: '',
  sort: 'popular',
  page: 1,
};

const splitList = (raw: string | null) => (raw ? raw.split(',').map((s) => s.trim()).filter(Boolean) : []);

export function parseFilters(params: URLSearchParams): ShopFilters {
  const num = (key: string, fallback: number) => {
    const v = Number(params.get(key));
    return Number.isFinite(v) && params.get(key) !== null ? v : fallback;
  };
  const sortRaw = params.get('sort') as SortKey | null;
  const sort = SORT_OPTIONS.some((o) => o.key === sortRaw) ? (sortRaw as SortKey) : 'popular';
  // `category` is the canonical param (used site-wide); `cat` kept as a legacy alias
  const cats = splitList(params.get('category') ?? params.get('cat'));
  return {
    cats,
    min: Math.max(PRICE_MIN, Math.min(num('min', PRICE_MIN), PRICE_MAX)),
    max: Math.max(PRICE_MIN, Math.min(num('max', PRICE_MAX), PRICE_MAX)),
    rating: Math.max(0, Math.min(5, num('rating', 0))),
    sale: params.get('sale') === '1',
    fresh: params.get('new') === '1',
    uae: params.get('uae') === '1',
    q: params.get('q') ?? '',
    sort,
    page: Math.max(1, num('page', 1)),
  };
}

export function filtersToParams(f: ShopFilters, base?: URLSearchParams): URLSearchParams {
  const params = new URLSearchParams(base);
  params.delete('cat'); // legacy alias — always rewritten as `category`
  const setOrDelete = (key: string, value: string, isDefault: boolean) => {
    if (isDefault) params.delete(key);
    else params.set(key, value);
  };
  setOrDelete('category', f.cats.join(','), f.cats.length === 0);
  setOrDelete('min', String(f.min), f.min <= PRICE_MIN);
  setOrDelete('max', String(f.max), f.max >= PRICE_MAX);
  setOrDelete('rating', String(f.rating), f.rating <= 0);
  setOrDelete('sale', '1', !f.sale);
  setOrDelete('new', '1', !f.fresh);
  setOrDelete('uae', '1', !f.uae);
  setOrDelete('q', f.q, f.q.trim() === '');
  setOrDelete('sort', f.sort, f.sort === 'popular');
  setOrDelete('page', String(f.page), f.page <= 1);
  return params;
}

function categoryMatches(p: Product, keys: string[]): boolean {
  if (keys.length === 0) return true;
  return keys.includes(p.category);
}

export function applyFilters(list: Product[], f: ShopFilters): Product[] {
  const q = f.q.trim().toLowerCase();
  return list.filter((p) => {
    if (!categoryMatches(p, f.cats)) return false;
    if (p.price < f.min || p.price > f.max) return false;
    if (f.rating > 0 && p.rating < f.rating) return false;
    if (f.sale && !(p.compareAt && p.compareAt > p.price)) return false;
    if (f.fresh && badgeOf(p) !== "new") return false;
    if (f.uae && badgeOf(p) !== "uae") return false;
    if (q) {
      const hay = `${p.name} ${p.nameEn} ${p.categoryName} ${p.short} ${p.description}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

export function sortProducts(list: Product[], sort: SortKey): Product[] {
  const arr = [...list];
  switch (sort) {
    case 'price-asc':
      return arr.sort((a, b) => a.price - b.price);
    case 'price-desc':
      return arr.sort((a, b) => b.price - a.price);
    case 'rating':
      return arr.sort((a, b) => b.rating - a.rating || b.reviews - a.reviews);
    case 'new':
      return arr.sort((a, b) => b.id - a.id);
    case 'popular':
    default:
      return arr.sort((a, b) => b.reviews - a.reviews);
  }
}

/** عدد منتجات قسم داخل الكتالوج الحالي */
export function categoryCount(list: Product[], key: string): number {
  return list.filter((p) => categoryMatches(p, [key])).length;
}

export function formatCount(n: number): string {
  if (n === 1) return 'منتج واحد';
  if (n === 2) return 'منتجان';
  if (n >= 3 && n <= 10) return `${n.toLocaleString("ar-AE-u-nu-latn")} منتجات`;
  return `${n.toLocaleString("ar-AE-u-nu-latn")} منتجًا`;
}

/* ─── شوهد مؤخرًا — recently viewed (localStorage) ─────────────────────── */

const RECENT_KEY = 'voya-recently-viewed';
const RECENT_LIMIT = 8;

export function recordProductView(slug: string) {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    const ids: string[] = raw ? (JSON.parse(raw) as string[]) : [];
    const next = [slug, ...ids.filter((x) => x !== slug)].slice(0, RECENT_LIMIT);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable — ignore */
  }
}

export function getRecentlyViewed(list: Product[]): Product[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    const slugs: string[] = raw ? (JSON.parse(raw) as string[]) : [];
    return slugs
      .map((slug) => list.find((p) => p.slug === slug))
      .filter((p): p is Product => Boolean(p));
  } catch {
    return [];
  }
}
