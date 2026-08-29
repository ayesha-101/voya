"use client";

import Link from "next/link";
import type { Category } from "@/lib/types";
import { useCart } from "./CartProvider";
import { useLang, useT } from "./LangProvider";
import { categoryName } from "@/lib/localize";
import { LangToggle } from "./LangToggle";
import { useUI } from "./UIProvider";
import { useWishlist } from "./useWishlist";

export function Header({ categories }: { categories: Category[] }) {
  const t = useT();
  const { lang } = useLang();
  const { openCart, openSearch } = useUI();
  const wishlist = useWishlist();
  const { count, ready } = useCart();

  const links = [
    { href: "/products", label: t.navExtra.all },
    ...categories.map((c) => ({ href: `/products?category=${c.slug}`, label: categoryName(c, lang) })),
    { href: "/about", label: t.navExtra.about },
    { href: "/contact", label: t.navExtra.contact },
  ];


  return (
    <header className="sticky top-0 z-50 border-b border-blush-300 bg-blush-50/95 backdrop-blur">
      <div className="overflow-hidden bg-gradient-to-r from-plum-800 via-plum-600 to-plum-400">
        <div className="flex w-max animate-marquee py-2.5 text-[13px] font-medium text-gold-100">
          {[0, 1].map((copy) => (
            <div key={copy} className="flex gap-14 pe-14 whitespace-nowrap">
              {t.announcements.map((a) => (
                <span key={a}>{a}</span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto flex max-w-[1360px] items-center gap-3 px-4 py-4 sm:gap-5 sm:px-10">
        <Link href="/" className="flex shrink-0 items-baseline gap-2.5">
          <span className="display text-[26px] tracking-[0.16em] text-plum-700 sm:text-[34px] sm:tracking-[0.18em]">
            VOYA
          </span>
          {/* الوصف يختفي على الشاشات الضيقة ليبقى الهيدر في عرض الصفحة */}
          <span className="hidden text-xs tracking-[0.08em] text-muted sm:inline">
            {t.brandSub}
          </span>
        </Link>

        <button
          type="button"
          onClick={openSearch}
          className="hidden max-w-md flex-1 items-center gap-3 rounded-full border border-blush-300 bg-white px-5 py-2.5 text-start text-sm text-muted transition hover:border-gold-400 lg:flex"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.7">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          {t.searchPlaceholder}
        </button>

        <div className="ms-auto flex shrink-0 items-center gap-1.5 sm:gap-2.5">
          <button
            type="button"
            onClick={openSearch}
            aria-label={t.search.title}
            className="grid h-10 w-10 place-items-center rounded-full border border-blush-300 text-plum-700 transition hover:border-gold-400 lg:hidden"
          >
            <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="1.7">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
          </button>

          <Link
            href="/wishlist"
            aria-label={t.wish.title}
            className="relative grid h-10 w-10 place-items-center rounded-full border border-blush-300 text-plum-700 transition hover:border-gold-400"
          >
            <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="1.7">
              <path d="M12 20.3 4.6 13a4.6 4.6 0 0 1 6.5-6.5l.9.9.9-.9A4.6 4.6 0 0 1 19.4 13z" />
            </svg>
            {wishlist.count > 0 && (
              <span className="nums absolute -end-1 -top-1 grid h-4.5 min-w-4.5 place-items-center rounded-full bg-plum-600 px-1 text-[10px] font-bold text-white">
                {wishlist.count}
              </span>
            )}
          </Link>

          <LangToggle />
          <Link
            href="/account"
            className="hidden rounded-full border border-blush-300 px-4 py-2.5 text-sm text-plum-700 transition hover:border-gold-500 hover:text-gold-700 sm:inline-block"
          >
            {t.account}
          </Link>
          <button
            type="button"
            onClick={openCart}
            aria-label={t.cart}
            className="flex items-center gap-2 rounded-full bg-plum-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-plum-700 sm:gap-2.5 sm:px-5 sm:py-3"
          >
            <span className="hidden sm:inline">{t.cart}</span>
            <span className="nums rounded-full bg-gold-400 px-2 text-xs font-bold text-plum-900">
              {ready ? count : 0}
            </span>
          </button>
        </div>
      </div>

      <nav className="border-t border-blush-200">
        {/* يمرَّر أفقيًا على الشاشات الضيقة بدل أن يوسّع الصفحة كلها */}
        <ul className="no-scrollbar mx-auto flex max-w-[1360px] gap-1 overflow-x-auto px-4 sm:px-10">
          {links.map((l) => (
            <li key={l.href} className="shrink-0">
              <Link
                href={l.href}
                className="block rounded-full px-4 py-3.5 text-sm font-medium whitespace-nowrap text-plum-900 transition hover:bg-blush-100 hover:text-plum-600"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
