"use client";

import Link from "next/link";
import { useT } from "./LangProvider";

export function Hero() {
  const t = useT();

  return (
    <section className="bg-[radial-gradient(110%_90%_at_82%_12%,#fbe7ec_0%,#fdf1e8_48%,#fdf8f3_100%)]">
      <div className="mx-auto grid max-w-[1360px] items-center gap-14 px-10 py-20 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="animate-fade-up flex flex-col gap-6">
          <span className="inline-flex items-center gap-2.5 self-start rounded-full border border-gold-300 bg-gold-100 px-4 py-2 text-[13px] text-gold-700">
            <span className="h-1.5 w-1.5 rounded-full bg-gold-500" />
            {t.hero.kicker}
          </span>

          <h1 className="text-5xl leading-[1.18] font-extrabold tracking-tight text-plum-900 lg:text-[64px]">
            {t.hero.title}
            <span className="display gold-text mt-2 block text-[56px] font-normal italic">{t.hero.titleAccent}</span>
          </h1>

          <p className="max-w-[48ch] text-[17px] leading-[1.9] text-[#7b6069]" style={{ textWrap: "pretty" }}>
            {t.hero.body}
          </p>

          <div className="flex flex-wrap gap-3 pt-1">
            <Link
              href="/products"
              className="rounded-full bg-plum-600 px-8 py-4 text-[15px] font-bold text-white shadow-[0_12px_26px_rgba(138,74,99,.24)] transition hover:bg-plum-700"
            >
              {t.hero.primary}
            </Link>
            <Link
              href="/products?sort=newest"
              className="rounded-full border border-gold-400 px-8 py-4 text-[15px] font-bold text-gold-700 transition hover:bg-gold-100"
            >
              {t.hero.secondary}
            </Link>
          </div>

          <dl className="mt-2 grid max-w-md grid-cols-3 gap-8 border-t border-blush-300 pt-6">
            {t.hero.stats.map((s) => (
              <div key={s.label}>
                <dt className="nums text-2xl font-extrabold text-plum-600">{s.value}</dt>
                <dd className="mt-1 text-[13px] text-muted">{s.label}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative hidden lg:block">
          <div className="relative h-[540px] overflow-hidden rounded-t-[250px] rounded-b-[30px] bg-[linear-gradient(165deg,#f9dde6_0%,#f6e0cf_55%,#f3d3c6_100%)] shadow-[0_30px_60px_rgba(108,42,72,.2)]">
            <div className="absolute inset-0 bg-[radial-gradient(60%_45%_at_50%_22%,rgba(255,255,255,.6),transparent_70%)]" />
            <div className="absolute inset-0 flex items-end justify-center gap-4 pb-20">
              <Bottle width={96} capHeight={20} bodyHeight={150} radius="26px 26px 20px 20px" from="#fff" to="#dba7bc" delay="0s" />
              <Bottle width={132} capHeight={30} bodyHeight={236} radius="34px 34px 22px 22px" from="#fdf5f7" to="#a75f7c" delay=".4s" tall />
              <Bottle width={88} capHeight={16} bodyHeight={176} radius="44px 44px 16px 16px" from="#fff8f0" to="#d3a577" delay=".8s" />
            </div>
          </div>

          <div className="absolute bottom-7 -start-6 flex items-center gap-3.5 rounded-[22px] border border-blush-200 bg-white px-5 py-4 shadow-[0_18px_36px_rgba(108,42,72,.16)]">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-gold-400 to-gold-500 text-[15px] font-extrabold text-white">
              4.9
            </span>
            <div>
              <div className="text-sm font-bold">{t.hero.ratingTitle}</div>
              <div className="text-xs text-muted">{t.hero.ratingSub}</div>
            </div>
          </div>

          <div className="absolute top-6 -end-4 rounded-[18px] bg-white px-4 py-3 text-[13px] font-bold text-plum-600 shadow-[0_14px_30px_rgba(108,42,72,.14)]">
            {t.hero.cod}
          </div>
        </div>
      </div>
    </section>
  );
}

function Bottle({
  width, capHeight, bodyHeight, radius, from, to, delay, tall,
}: {
  width: number; capHeight: number; bodyHeight: number; radius: string; from: string; to: string; delay: string; tall?: boolean;
}) {
  return (
    <div className="animate-float" style={{ width, animationDelay: delay }}>
      <div
        className="mx-auto w-[34%]"
        style={{ height: capHeight, borderRadius: "8px 8px 0 0", background: "linear-gradient(180deg, #f0d69c, #b8901f)" }}
      />
      <div
        className="flex flex-col items-center justify-center gap-2"
        style={{
          height: bodyHeight,
          borderRadius: radius,
          background: `linear-gradient(150deg, ${from}, ${to})`,
          boxShadow: "inset -14px 0 26px rgba(76,35,51,.18), 0 22px 38px rgba(108,42,72,.22)",
        }}
      >
        <span className={`display tracking-[0.22em] text-white ${tall ? "text-[22px]" : "text-[15px]"}`}>VOYA</span>
        {tall && <span className="h-px w-16 bg-white/60" />}
      </div>
    </div>
  );
}
