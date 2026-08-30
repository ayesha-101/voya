"use client";

import { useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { cn } from '@/lib/utils';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const CHAPTERS = [
  {
    num: '01',
    title: 'البداية',
    text: 'بدأت فويا من سؤال بسيط: لماذا يصعب على المرأة الإماراتية الوصول لمنتجات أصلية تثق بها؟ من هنا وُلدت فكرتنا — علامة إماراتية بروح شبابية وهوية مبتكرة.',
    img: '/story-hands.jpg',
    alt: 'يد أنثوية تغلّف طلبًا بورق حرير وردي وشريط ذهبي',
  },
  {
    num: '02',
    title: 'نجرّبها بأنفسنا',
    text: 'كل منتج على رفوفنا مرّ علينا أولًا. نختار منتجاتنا بعناية ونجربها بأنفسنا، ولا نقدمها لكِ إلا إذا أحببناها بصدق — لنضمن لكِ الجودة والمصداقية.',
    img: '/value-test.jpg',
    alt: 'يد تختبر قوام سيروم على الرسغ بإضاءة ناعمة',
  },
  {
    num: '03',
    title: 'اليوم',
    text: 'آلاف العميلات، مئات المنتجات المختارة، ووعد واحد لم يتغيّر: الجودة والمصداقية في كل شيء نقدمه.',
    img: '/story-craft.jpg',
    alt: 'تفاصيل تغليف طلبات فويا بعناية وحب',
  },
];

/**
 * Pinned scroll-storytelling scene (GSAP ScrollTrigger).
 * Isolated GSAP component — no Framer Motion inside this tree.
 */
export default function StoryScroll() {
  const sectionRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const [reduced] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );

  useGSAP(
    () => {
      if (reduced) return;
      const paras = gsap.utils.toArray<HTMLElement>('.story-para', sectionRef.current);
      if (paras.length < 3) return;

      gsap.set(paras, { opacity: 0, y: 40 });
      gsap.set(paras[0], { opacity: 1, y: 0 });

      const tl = gsap.timeline({
        defaults: { ease: 'power2.out' },
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '+=180%',
          pin: true,
          scrub: 0.6,
          anticipatePin: 1,
          onUpdate: (self) => {
            const idx = Math.min(CHAPTERS.length - 1, Math.floor(self.progress * CHAPTERS.length));
            setActive((prev) => (prev === idx ? prev : idx));
          },
        },
      });

      // hold chapter 1, then swap 1→2→3
      tl.to({}, { duration: 0.7 })
        .to(paras[0], { opacity: 0, y: -40, duration: 0.3 })
        .to(paras[1], { opacity: 1, y: 0, duration: 0.3 }, '<')
        .to({}, { duration: 0.7 })
        .to(paras[1], { opacity: 0, y: -40, duration: 0.3 })
        .to(paras[2], { opacity: 1, y: 0, duration: 0.3 }, '<')
        .to({}, { duration: 0.6 });

      // golden thread draws itself with scroll progress
      const thread = sectionRef.current?.querySelector('.story-thread');
      if (thread) {
        tl.fromTo(thread, { scaleY: 0 }, { scaleY: 1, duration: 3.4, ease: 'none' }, 0);
      }
    },
    { scope: sectionRef, dependencies: [reduced] },
  );

  return (
    <section ref={sectionRef} className="overflow-hidden bg-cream">
      <div className="container-voya flex min-h-[100dvh] flex-col justify-center py-16 md:py-20">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* text side (right in RTL) */}
          <div>
            <span className="text-xs font-bold tracking-[0.15em] text-mauve">قصتنا</span>
            <h2 className="mt-2 text-[28px] font-bold leading-[1.3] text-plum md:text-[40px]">
              من سؤال… إلى وعد
            </h2>
            <img src="/ornament-thread.svg" alt="" aria-hidden className="mt-3 h-5 w-40" />

            <div className="mt-8 flex gap-6">
              {/* golden thread + progress dots */}
              {!reduced && (
                <div className="relative flex flex-col items-center justify-center gap-3 py-2" aria-hidden="true">
                  <span className="story-thread absolute inset-y-0 w-[1.5px] origin-top bg-gold/60" />
                  {CHAPTERS.map((c, i) => (
                    <span
                      key={c.num}
                      className={cn(
                        'relative h-2.5 w-2.5 rounded-full transition-colors duration-500',
                        i <= active ? 'bg-rose' : 'bg-blush-200',
                      )}
                    />
                  ))}
                </div>
              )}

              {reduced ? (
                /* reduced-motion fallback: sequential chapters, no pinning */
                <div className="space-y-10">
                  {CHAPTERS.map((c) => (
                    <div key={c.num}>
                      <span className="tnum text-sm font-bold text-gold" dir="ltr">
                        {c.num}
                      </span>
                      <h3 className="mt-1 text-xl font-semibold text-plum md:text-2xl">{c.title}</h3>
                      <p className="font-body mt-2 max-w-lg text-[15px] leading-[1.9] text-ink-soft md:text-base">
                        {c.text}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                /* pinned chapter stack */
                <div className="relative h-[240px] flex-1 md:h-[260px]">
                  {CHAPTERS.map((c) => (
                    <div key={c.num} className="story-para absolute inset-0">
                      {/* giant translucent number behind the text */}
                      <span
                        aria-hidden="true"
                        className="tnum pointer-events-none absolute -top-10 right-0 select-none text-[96px] font-extrabold leading-none text-mauve opacity-10"
                        dir="ltr"
                      >
                        {c.num}
                      </span>
                      <div className="relative pt-14">
                        <h3 className="text-xl font-semibold text-plum md:text-2xl">{c.title}</h3>
                        <p className="font-body mt-3 max-w-lg text-[15px] leading-[1.9] text-ink-soft md:text-[17px]">
                          {c.text}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* image side — arch frame, crossfades with the active chapter (CSS only) */}
          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div
              className="pointer-events-none absolute -inset-4 rounded-t-full rounded-b-[36px] border-2 border-gold/40"
              aria-hidden="true"
            />
            <div className="relative aspect-[4/5] overflow-hidden rounded-t-full rounded-b-[28px] bg-blush-100 shadow-card">
              {CHAPTERS.map((c, i) => (
                <img
                  key={c.num}
                  src={c.img}
                  alt={c.alt}
                  loading={i === 0 ? 'eager' : 'lazy'}
                  className={cn(
                    'absolute inset-0 h-full w-full object-cover transition-opacity duration-700',
                    reduced || i === active ? 'opacity-100' : 'opacity-0',
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
