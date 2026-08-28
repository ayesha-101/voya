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
