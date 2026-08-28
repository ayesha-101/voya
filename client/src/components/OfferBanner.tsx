import Link from "next/link";
import { Countdown } from "./Countdown";
import { ProductArt } from "./ProductArt";

export function OfferBanner() {
  return (
    <section className="relative overflow-hidden rounded-card bg-plum-800 text-white">
      <div
        className="pointer-events-none absolute -start-20 -bottom-20 h-72 w-72 rounded-full bg-rose-500/15 blur-3xl"
        aria-hidden
      />
      <div className="relative grid items-center gap-8 p-8 sm:p-12 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-5">
          <span className="inline-block rounded-full bg-rose-500 px-4 py-1.5 text-[13px] font-extrabold text-plum-900">
            عرض نهاية الأسبوع
          </span>
          <h2 className="text-3xl leading-tight font-extrabold sm:text-4xl">
            خصم يصل إلى <span className="nums text-rose-400">25%</span> على
            <br />
            أطقم الهدايا الفاخرة
          </h2>
          <p className="max-w-lg text-blush-100/85">
            اختر طقمك المفضّل واحصل على بطاقة إهداء مجانية مع تغليف فاخر. العرض
            ساري حتى نفاد الكمية.
          </p>
          <Countdown hours={36} />
          <Link
            href="/products?category=gifts"
            className="inline-block rounded-full bg-white px-8 py-4 text-[15px] font-bold text-plum-800 transition hover:bg-blush-100"
          >
            اطلب العرض الآن
          </Link>
        </div>

        <div className="hidden justify-center lg:flex">
          <ProductArt
            shape="box"
            tone={["#e0997f", "#87355b"]}
            label="طقم الهدايا"
            className="h-64 w-64 drop-shadow-2xl"
          />
        </div>
      </div>
    </section>
  );
}
