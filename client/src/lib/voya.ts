import type { Category, Product } from "./types";

/**
 * جسر بين منتجات الواجهة البرمجية وشكل البيانات الذي تتوقّعه مكوّنات
 * القالب. المكوّنات نُقلت كما هي، فبدل تعديل كل واحد منها نحوّل المنتج
 * مرة واحدة هنا.
 */

/** صور المنتجات من حزمة القالب، مربوطة بمعرّف المنتج في قاعدة البيانات. */
const PRODUCT_IMAGES: Record<string, string[]> = {
  "curlysilk-set": ["/p-curlysilk-1.jpg", "/p-curlysilk-2.jpg", "/p-curlysilk-3.jpg"],
  "milk-shampoo": ["/p-shampoo-1.jpg"],
  "hair-toner": ["/p-toner-1.jpg"],
  "hair-gel": ["/p-hairgel-1.jpg"],
  "sidr-mix": ["/p-sidr-1.jpg"],
  "mashat-mix": ["/p-mashat-1.jpg"],
  "brow-gel": ["/p-browgel-1.jpg"],
  "body-scrub": ["/p-scrub-1.jpg"],
  "baby-oil": ["/p-babyoil-1.jpg"],
  "baby-spray": ["/p-babyspray-1.jpg"],
  "voya-perfume": ["/p-perfume-1.jpg"],
  "radiance-serum": ["/p-serum-1.jpg"],
  "sunscreen-spf50": ["/p-sunscreen-1.jpg"],
  "deep-moisturizer": ["/p-moisturizer-1.jpg"],
};

/** صورة القسم — تُستعمل كبديل لأي منتج يُضاف من اللوحة بلا صورة خاصة. */
export const CATEGORY_IMAGES: Record<string, string> = {
  "hair-care": "/cat-hair.jpg",
  "skin-care": "/cat-skin.jpg",
  makeup: "/cat-makeup.jpg",
  fragrance: "/cat-fragrance.jpg",
  beauty: "/cat-beauty.jpg",
  kids: "/cat-baby.jpg",
  summer: "/cat-summer.jpg",
  uae: "/cat-uae.jpg",
};

export function productImages(p: Product): string[] {
  const own = PRODUCT_IMAGES[p.slug];
  if (own?.length) return own;
  const fallback = CATEGORY_IMAGES[p.category];
  return fallback ? [fallback] : ["/cat-beauty.jpg"];
}

export type VBadge = "new" | "sale" | "trending" | "out" | "uae";

export const BADGE_LABEL: Record<VBadge, string> = {
  new: "جديد",
  sale: "خصم",
  trending: "رائج 🔥",
  uae: "صنع في الإمارات 🇦🇪",
  out: "نفدت الكمية",
};

export const BADGE_CLASS: Record<VBadge, string> = {
  new: "bg-rose text-white",
  sale: "bg-mauve text-white",
  trending: "bg-gold-soft text-[#8a6a2f]",
  uae: "border border-gold bg-white/85 text-[#8a6a2f]",
  out: "bg-ink-soft/70 text-white",
};

/**
 * الشارة تُشتقّ من حالة المنتج نفسه لا من نصّ حرّ، حتى تبقى متّسقة
 * حين تُضاف منتجات من لوحة الإدارة.
 */
export function badgeOf(p: Product): VBadge | null {
  if (p.stock <= 0) return "out";
  if (p.category === "uae") return "uae";
  if (p.compareAt && p.compareAt > p.price) return "sale";
  if (p.reviews >= 200) return "trending";
  if (p.reviews <= 60) return "new";
  return null;
}

export function discountPercent(p: Product): number {
  if (!p.compareAt || p.compareAt <= p.price) return 0;
  return Math.round(((p.compareAt - p.price) / p.compareAt) * 100);
}

/** الأرقام لاتينية دائمًا؛ عزل الاتجاه يتكفّل به صنف ‎.tnum‎ في CSS. */
export function formatPrice(value: number): string {
  return `${value.toLocaleString("ar-AE-u-nu-latn")} د.إ`;
}

export const FREE_SHIPPING_THRESHOLD = 200;

/** المواصفات تُخزَّن في القاعدة أسطرًا بصيغة «المفتاح: القيمة». */
export function specsOf(p: Product): Record<string, string> {
  const out: Record<string, string> = {};
  for (const line of p.benefits) {
    const i = line.indexOf(":");
    if (i > 0) out[line.slice(0, i).trim()] = line.slice(i + 1).trim();
    else out[line] = "";
  }
  if (p.size && !out["الحجم"]) out["الحجم"] = p.size;
  return out;
}

export function categoryImage(c: Category): string {
  return CATEGORY_IMAGES[c.slug] ?? "/cat-beauty.jpg";
}

export function productCountLabel(n: number): string {
  if (n === 0) return "لا منتجات";
  if (n === 1) return "منتج واحد";
  if (n === 2) return "منتجان";
  if (n <= 10) return `${n} منتجات`;
  return `${n} منتجًا`;
}

/** لونا العبوة في القاعدة يصيران خياري لون في صفحة المنتج. */
export function productColors(p: Product): { name: string; hex: string }[] {
  const [a, b] = p.tone;
  return a === b ? [{ name: "اللون الأساسي", hex: a }] : [
    { name: "فاتح", hex: a },
    { name: "غامق", hex: b },
  ];
}
