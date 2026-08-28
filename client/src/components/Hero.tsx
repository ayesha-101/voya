import Link from "next/link";
import { ProductArt } from "./ProductArt";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-sea-900 text-white">
      {/* موجات زخرفية في الخلفية */}
      <svg
        className="pointer-events-none absolute inset-x-0 bottom-0 h-40 w-full text-sea-800"
        viewBox="0 0 1440 200"
        preserveAspectRatio="none"
        aria-hidden
      >
        <path
          d="M0 120c180-60 360 40 540 20s360-100 540-70 240 70 360 60v70H0z"
          fill="currentColor"
          opacity="0.55"
        />
        <path
          d="M0 160c200-50 400 30 600 10s400-80 600-50 180 50 240 45v35H0z"
          fill="currentColor"
        />
      </svg>
      <div
        className="pointer-events-none absolute -end-24 -top-24 h-96 w-96 rounded-full bg-gold-500/10 blur-3xl"
        aria-hidden
      />

      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-6 py-16 lg:grid-cols-2 lg:py-24">
        <div className="animate-fade-up space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[13px] font-medium">
            <span className="h-2 w-2 rounded-full bg-gold-400" />
            عضوي معتمد • محصود يدويًا
          </span>

          <h1 className="text-4xl leading-[1.25] font-extrabold sm:text-5xl lg:text-[3.4rem]">
            جمالٌ من قلب البحر
            <span className="mt-2 block text-gold-400">منتجات مختارة بعناية</span>
          </h1>

          <p className="max-w-xl text-base leading-8 text-sand-100/85 sm:text-lg">
            مجموعة ڤويا الأصلية للعناية بالبشرة والجسم والشعر، مستخلصة من الأعشاب
            البحرية العضوية. جودة عالية، مكوّنات نظيفة، ونتائج تشعر بها من أول استخدام.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href="/products"
              className="rounded-full bg-gold-500 px-8 py-4 text-[15px] font-bold text-sea-900 transition hover:bg-gold-400 active:scale-[0.98]"
            >
              تسوّق الآن
            </Link>
            <Link
              href="/products?category=gifts"
              className="rounded-full border border-white/25 px-8 py-4 text-[15px] font-bold transition hover:bg-white/10"
            >
              أطقم الهدايا
            </Link>
          </div>

          <dl className="grid max-w-md grid-cols-3 gap-4 border-t border-white/15 pt-6">
            {[
              ["+12,000", "عميل سعيد"],
              ["4.8/5", "تقييم المتجر"],
              ["24–48", "ساعة للتوصيل"],
            ].map(([value, label]) => (
              <div key={label}>
                <dt className="nums text-2xl font-extrabold text-gold-400">{value}</dt>
                <dd className="text-xs text-sand-100/70">{label}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* عرض المنتجات البطل */}
        <div className="relative hidden justify-center lg:flex">
          <div className="absolute h-80 w-80 rounded-full bg-sea-700/60 blur-2xl" aria-hidden />
          <div className="relative flex items-end gap-2">
            <ProductArt
              shape="jar"
              tone={["#cdb387", "#a98a35"]}
              label="زبدة الجسم"
              className="h-56 w-44 drop-shadow-2xl"
            />
            <ProductArt
              shape="bottle"
              tone={["#2f7a6c", "#0f3a34"]}
              label="سيروم الإشراق"
              className="h-80 w-56 drop-shadow-2xl"
            />
            <ProductArt
              shape="tube"
              tone={["#7fb9ac", "#2f7a6c"]}
              label="جل العين"
              className="h-52 w-40 drop-shadow-2xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
