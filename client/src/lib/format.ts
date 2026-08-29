import { site } from "@/data/site";

type Lang = "ar" | "en";

// مُنسّق لكل لغة: العربية تعرض «د.إ» والإنجليزية تعرض AED،
// والأرقام لاتينية في الحالتين.
const money: Record<Lang, Intl.NumberFormat> = {
  ar: new Intl.NumberFormat(`${site.locale}-u-nu-latn`, {
    style: "currency",
    currency: site.currency,
    maximumFractionDigits: 0,
  }),
  en: new Intl.NumberFormat("en-AE", {
    style: "currency",
    currency: site.currency,
    maximumFractionDigits: 0,
  }),
};

/** يعرض السعر بأرقام لاتينية: «289 د.إ.» عربيًا و«AED 289» إنجليزيًا. */
export function formatPrice(value: number, lang: Lang = "ar") {
  return money[lang].format(value);
}

export function discountPercent(price: number, compareAt?: number) {
  if (!compareAt || compareAt <= price) return 0;
  return Math.round(((compareAt - price) / compareAt) * 100);
}

// Intl يُدرج علامات اتجاه (RLM/ALM) داخل التاريخ العربي، وهي تقلب ترتيب
// الأجزاء عند عرضها في صفحة RTL. نزيلها ونعزل النتيجة بـ dir="ltr".
const stripBidi = (s: string) => s.replace(/[‎‏؜]/g, "");

const dateOnly = new Intl.DateTimeFormat(`${site.locale}-u-nu-latn`, {
  dateStyle: "medium",
});

const dateTime = new Intl.DateTimeFormat(`${site.locale}-u-nu-latn`, {
  dateStyle: "medium",
  timeStyle: "short",
});

export function formatDate(value: string | Date) {
  return stripBidi(dateOnly.format(new Date(value)));
}

export function formatDateTime(value: string | Date) {
  return stripBidi(dateTime.format(new Date(value)));
}
