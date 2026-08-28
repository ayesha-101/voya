import { site } from "@/data/site";

const money = new Intl.NumberFormat(`${site.locale}-u-nu-latn`, {
  style: "currency",
  currency: site.currency,
  maximumFractionDigits: 0,
});

/** يعرض السعر بأرقام لاتينية مع رمز الدرهم، مثال: 289 د.إ. */
export function formatPrice(value: number) {
  return money.format(value);
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
