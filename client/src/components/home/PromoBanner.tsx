"use client";

import { useEffect, useRef, useState } from 'react';
import Link from "next/link";
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/voya";

gsap.registerPlugin(ScrollTrigger, useGSAP);

function useOfferCountdown() {
  const [now, setNow] = useState(() => Date.now());
  const [end] = useState(() => {
    try {
      const saved = Number(localStorage.getItem('voya-offer-ends'));
      if (saved && saved > Date.now()) return saved;
      const fresh = Date.now() + 3 * 24 * 60 * 60 * 1000;
      localStorage.setItem('voya-offer-ends', String(fresh));
      return fresh;
    } catch {
      return Date.now() + 3 * 24 * 60 * 60 * 1000;
    }
  });
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const diff = Math.max(0, end - now);
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    mins: Math.floor((diff % 3600000) / 60000),
    secs: Math.floor((diff % 60000) / 1000),
  };
}

const TITLE_WORDS = ['مجموعة', 'كيرلي', 'سيلك…', 'شعركِ', 'يستحق', 'الحرير'];

export default function PromoBanner({ hero }: { hero?: Product }) {
  const sectionRef = useRef<HTMLElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const { days, hours, mins, secs } = useOfferCountdown();

  useGSAP(
    () => {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduced || !sectionRef.current) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '+=150%',
          pin: true,
          scrub: 1,
          anticipatePin: 1,
        },
      });

      // 1) image zoom out 1.15 → 1 with vertical parallax
      tl.fromTo(imgRef.current, { scale: 1.15, y: 30 }, { scale: 1, y: -30, ease: 'none', duration: 1 }, 0);
      // 2) title word-by-word reveal
      tl.fromTo(
        '.promo-word',
        { yPercent: 110, opacity: 0 },
        { yPercent: 0, opacity: 1, stagger: 0.08, duration: 0.3, ease: 'power3.out' },
        0.15,
      );
      // 3) gold thread draws under title
      tl.fromTo('.promo-thread', { scaleX: 0 }, { scaleX: 1, duration: 0.25, ease: 'power2.out' }, 0.5);
      // 4) counter pops in with a soft bounce
      tl.fromTo(
        '.promo-counter',
        { scale: 0.6, opacity: 0 },
        { scale: 1, opacity: 1, stagger: 0.06, duration: 0.25, ease: 'back.out(2)' },
        0.6,
      );
      // 5) price + CTA
      tl.fromTo('.promo-cta', { y: 30, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.1, duration: 0.2, ease: 'power2.out' }, 0.75);

      return () => {
        ScrollTrigger.getAll().forEach((st) => {
          if (st.trigger === sectionRef.current) st.kill();
        });
      };
    },
    { scope: sectionRef },
  );

  const cells: [number, string][] = [
    [days, 'أيام'],
    [hours, 'ساعات'],
    [mins, 'دقائق'],
    [secs, 'ثوانٍ'],
  ];

  return (
    <section ref={sectionRef} className="relative flex min-h-[100dvh] items-center overflow-hidden bg-plum">
      {/* faint petals */}
      {[...Array(4)].map((_, i) => (
        <img
          key={i}
          src="/petal.svg"
          alt=""
          aria-hidden
          className="pointer-events-none absolute opacity-[0.07]"
          style={{ top: `${12 + i * 22}%`, right: `${(i * 31) % 80}%`, width: 44 + i * 14, transform: `rotate(${i * 55}deg)` }}
        />
      ))}

      <div className="container-voya grid w-full items-center gap-10 py-16 lg:grid-cols-2 lg:gap-14">
        {/* image — left half in RTL */}
        <div className="relative order-1 lg:order-2">
          <div className="overflow-hidden rounded-signature-lg shadow-[0_32px_90px_rgba(0,0,0,0.45)]">
            <img
              ref={imgRef}
              src="/promo-curlysilk.jpg"
              alt="مجموعة كيرلي سيلك للشعر"
              className="aspect-[16/10] w-full object-cover will-change-transform lg:aspect-auto lg:h-[70vh]"
            />
          </div>
          {/* gold badge */}
          <span className="absolute -top-4 right-6 rounded-full bg-gold px-5 py-2 text-[13px] font-bold text-plum shadow-modal">
            عرض محدود — خصم 38%
          </span>
        </div>

        {/* text */}
        <div className="order-2 text-center lg:order-1 lg:text-right">
          <h2 className="font-heading text-[30px] font-bold leading-[1.35] text-blush-50 md:text-[44px]">
            {TITLE_WORDS.map((w, i) => (
              <span key={i} className="inline-block overflow-hidden pb-1 align-bottom">
                <span className="promo-word inline-block will-change-transform">{w}</span>
                {' '}
              </span>
            ))}
          </h2>
          <div className="promo-thread mx-auto mt-3 h-[3px] w-40 origin-right rounded-full bg-gold lg:mx-0" />

          <p className="mx-auto mt-5 max-w-md font-body text-[15px] leading-[1.9] text-blush-50/75 md:text-base lg:mx-0">
            الروتين المتكامل للشعر الكيرلي — شامبو لطيف، بلسم مغذٍّ، وكريم تصفيف بروتين الحرير. تموّجات معرّفة ونعومة تدوم.
          </p>

          {/* countdown */}
          <div className="mt-7 flex items-center justify-center gap-2.5 lg:justify-start" dir="ltr">
            {cells.map(([v, label]) => (
              <div
                key={label}
                className="promo-counter flex w-[68px] flex-col items-center rounded-2xl border border-blush-50/15 bg-blush-50/10 py-3 backdrop-blur"
              >
                <span className="tnum font-heading text-2xl font-bold text-gold">{String(v).padStart(2, '0')}</span>
                <span className="mt-0.5 text-[11px] text-blush-50/70">{label}</span>
              </div>
            ))}
          </div>

          {/* price */}
          <div className="promo-cta mt-6 flex items-baseline justify-center gap-3 lg:justify-start">
            <span className="tnum font-heading text-[34px] font-bold text-gold md:text-[42px]">{formatPrice(hero?.price ?? 185)}</span>
            <span className="tnum text-lg text-blush-50/50 line-through">{formatPrice(hero?.compareAt ?? 300)}</span>
          </div>

          <div className="promo-cta mt-6 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
            <Link href="/products/curlysilk-set"
              className="relative overflow-hidden rounded-full bg-gold px-9 py-4 text-[15px] font-bold text-plum shadow-modal transition-transform duration-300 hover:-translate-y-1"
            >
              <span className="shimmer-gold animate-shimmer pointer-events-none absolute inset-0" aria-hidden />
              <span className="relative">احصلي عليه الآن</span>
            </Link>
            <Link href="/products/curlysilk-set"
              className="rounded-full border border-blush-50/30 px-9 py-4 text-[15px] font-bold text-blush-50 transition-colors hover:border-rose hover:text-rose"
            >
              التفاصيل
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
