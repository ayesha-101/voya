"use client";

import { useEffect, useState } from 'react';
import Link from "next/link";
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUp, Camera, Mail, MessageCircle, Music2 } from 'lucide-react';
import { toast } from '@/components/Toast';
import { VoyaLogo } from '@/components/Navbar';
import type { Category } from "@/lib/types";

const PAY_BADGES = ['pay-visa.svg', 'pay-mastercard.svg', 'pay-applepay.svg', 'pay-tabby.svg', 'pay-tamara.svg', 'pay-cod.svg'];

const WHATSAPP_URL = 'https://wa.me/971553633977';

function BackToTop() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          aria-label="العودة للأعلى"
          initial={{ opacity: 0, y: 16, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.9 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-24 left-6 z-[80] flex h-12 w-12 items-center justify-center rounded-full bg-rose text-white shadow-modal transition-colors hover:bg-rose-deep"
        >
          <svg viewBox="0 0 24 24" fill="none" className="absolute inset-0 m-auto h-12 w-12 text-white/30" aria-hidden>
            <circle cx="12" cy="12" r="10.5" stroke="currentColor" strokeWidth="1" strokeDasharray="2 3" />
          </svg>
          <ArrowUp className="h-5 w-5" strokeWidth={1.5} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

/** Floating WhatsApp button — bottom-left, pulsing halo */
export function WhatsAppFloat() {
  return (
    <motion.a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noreferrer"
      aria-label="راسلينا واتساب"
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 1.2, type: 'spring', stiffness: 260, damping: 18 }}
      className="group fixed bottom-6 left-6 z-[80] flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-modal"
    >
      <span className="animate-ping-ring absolute inset-0 rounded-full bg-[#25D366]" aria-hidden />
      {/* tooltip */}
      <span className="pointer-events-none absolute right-full mr-3 whitespace-nowrap rounded-full bg-plum px-4 py-2 text-xs font-medium text-blush-50 opacity-0 shadow-modal transition-all duration-300 group-hover:opacity-100">
        راسلينا واتساب
      </span>
      <svg viewBox="0 0 24 24" className="relative h-7 w-7 fill-current" aria-hidden>
        <path d="M12.04 2a9.9 9.9 0 0 0-8.5 14.93L2 22l5.2-1.5A9.9 9.9 0 1 0 12.04 2Zm0 1.8a8.1 8.1 0 1 1-4.13 15.05l-.3-.18-3.05.88.9-2.97-.2-.31a8.1 8.1 0 0 1 6.78-12.47Zm-3.1 4.2c-.17 0-.45.06-.68.32-.23.25-.9.87-.9 2.13 0 1.25.92 2.46 1.05 2.63.12.17 1.8 2.88 4.45 3.92 2.2.87 2.65.7 3.13.65.48-.04 1.54-.62 1.76-1.23.22-.6.22-1.13.15-1.24-.06-.1-.23-.17-.49-.3-.25-.12-1.54-.76-1.78-.85-.24-.08-.41-.13-.59.13-.17.26-.67.85-.82 1.02-.15.17-.3.2-.56.07a7.2 7.2 0 0 1-2.1-1.3 7.9 7.9 0 0 1-1.45-1.8c-.15-.26-.02-.4.12-.53.12-.12.26-.3.39-.46.13-.15.17-.26.26-.43.09-.18.05-.33-.02-.46-.07-.13-.58-1.4-.8-1.92-.2-.5-.41-.44-.58-.45l-.62-.02Z" />
      </svg>
    </motion.a>
  );
}

export default function Footer({ categories = [] }: { categories?: Category[] }) {
  const [email, setEmail] = useState('');

  const subscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    toast('أهلًا بكِ في نادي فويا 🌸');
    setEmail('');
  };

  return (
    <>
      <footer className="relative mt-24 bg-plum text-blush-50">
        {/* silky wave transition */}
        <svg viewBox="0 0 1440 90" preserveAspectRatio="none" className="absolute -top-[88px] right-0 h-[90px] w-full text-plum" aria-hidden>
          <path d="M0,50 C240,90 480,10 720,42 C960,74 1200,14 1440,48 L1440,90 L0,90 Z" fill="currentColor" opacity="0.35" />
          <path d="M0,66 C260,30 520,92 780,64 C1040,36 1240,78 1440,58 L1440,90 L0,90 Z" fill="currentColor" />
        </svg>

        {/* faint petals pattern */}
        {[...Array(5)].map((_, i) => (
          <img
            key={i}
            src="/petal.svg"
            alt=""
            aria-hidden
            className="pointer-events-none absolute opacity-[0.05]"
            style={{ top: `${10 + i * 18}%`, right: `${(i * 23) % 85}%`, width: 40 + (i % 3) * 22, transform: `rotate(${i * 40}deg)` }}
          />
        ))}

        <div className="container-voya relative grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-4">
          {/* brand */}
          <div>
            <Link href="/" aria-label="فويا — الرئيسية">
              <VoyaLogo light />
            </Link>
            <p className="mt-4 font-body text-sm leading-8 text-blush-50/75">
              نختار منتجاتنا بعناية ونجربها بأنفسنا لنضمن لكِ الجودة والمصداقية في كل شيء نقدمه. بوتيك إماراتي للجمال والعناية — بكل حب.
            </p>
            <div className="mt-5 flex gap-2">
              {[
                { Icon: Camera, href: 'https://instagram.com', label: 'إنستغرام' },
                { Icon: Music2, href: 'https://tiktok.com', label: 'تيك توك' },
                { Icon: MessageCircle, href: WHATSAPP_URL, label: 'واتساب' },
                { Icon: Mail, href: 'mailto:voyagroups@gmail.com', label: 'البريد' },
              ].map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-blush-50/15 text-blush-50/80 transition hover:-translate-y-1 hover:border-rose hover:bg-rose hover:text-white"
                >
                  <Icon className="h-[18px] w-[18px]" strokeWidth={1.5} />
                </a>
              ))}
            </div>
          </div>

          {/* shop */}
          <div>
            <h3 className="font-heading text-lg font-semibold text-blush-50">تسوّقي</h3>
            <span className="mt-2 block h-px w-10 bg-gold" aria-hidden />
            <ul className="mt-4 grid grid-cols-2 gap-x-2 gap-y-2.5 lg:grid-cols-1">
              {categories.map((c) => (
                <li key={c.slug}>
                  <Link href={`/products?category=${c.slug}`} className="text-sm text-blush-50/70 transition-colors hover:text-rose">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* customer care */}
          <div>
            <h3 className="font-heading text-lg font-semibold text-blush-50">خدمة العملاء</h3>
            <span className="mt-2 block h-px w-10 bg-gold" aria-hidden />
            <ul className="mt-4 space-y-2.5">
              {[
                { to: '/contact', label: 'تتبع الطلب' },
                { to: '/contact', label: 'سياسة الطلب' },
                { to: '/contact', label: 'الشحن والإرجاع' },
                { to: '/contact', label: 'الأسئلة الشائعة' },
                { to: '/contact', label: 'الخصوصية' },
              ].map((l) => (
                <li key={l.label}>
                  <Link href={l.to} className="text-sm text-blush-50/70 transition-colors hover:text-rose">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-5 space-y-1.5 text-sm text-blush-50/70">
              <p>
                واتساب:{' '}
                <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" dir="ltr" className="tnum hover:text-rose">
                  +971 55 3633 977
                </a>
              </p>
              <p>
                بريد:{' '}
                <a href="mailto:voyagroups@gmail.com" className="hover:text-rose">
                  voyagroups@gmail.com
                </a>
              </p>
            </div>
          </div>

          {/* newsletter */}
          <div>
            <h3 className="font-heading text-lg font-semibold text-blush-50">انضمي لنادي فويا 🌸</h3>
            <span className="mt-2 block h-px w-10 bg-gold" aria-hidden />
            <p className="mt-4 text-sm leading-7 text-blush-50/70">
              جديد المنتجات، الخصومات الخاصة، ونصائح الجمال — قبل الجميع.
            </p>
            <form onSubmit={subscribe} className="mt-4 flex overflow-hidden rounded-full border border-blush-50/20 bg-blush-50/10 p-1 backdrop-blur">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="بريدك الإلكتروني"
                className="w-full bg-transparent px-4 text-sm text-blush-50 placeholder:text-blush-50/50 focus:outline-none"
              />
              <button
                type="submit"
                className="shrink-0 rounded-full bg-gold px-5 py-2.5 text-sm font-bold text-plum transition hover:bg-gold-soft"
              >
                اشتراك
              </button>
            </form>
            <p className="mt-3 text-xs text-blush-50/50">بدون إزعاج — رسائلنا قليلة وجميلة، كبتلات الورد.</p>
          </div>
        </div>

        {/* bottom bar */}
        <div className="relative border-t border-blush-50/10">
          <div className="container-voya flex flex-col items-center justify-between gap-5 py-6 md:flex-row">
            <p className="text-xs text-blush-50/60">© 2025 VOYA STORE — صنع بحب في الإمارات 🇦🇪</p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {PAY_BADGES.map((b) => (
                <img key={b} src={`/${b}`} alt={b.replace('pay-', '').replace('.svg', '')} className="h-8 w-auto rounded-lg" loading="lazy" />
              ))}
            </div>
          </div>
        </div>
      </footer>
      <BackToTop />
    </>
  );
}
