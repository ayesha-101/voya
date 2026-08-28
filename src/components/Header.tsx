"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { categories } from "@/data/products";
import { useCart } from "./useCart";
import { CartIcon, CloseIcon, MenuIcon, SearchIcon } from "./Icons";
import { Logo } from "./Logo";

const links = [
  { href: "/products", label: "كل المنتجات" },
  ...categories.map((c) => ({ href: `/products?category=${c.slug}`, label: c.name })),
  { href: "/about", label: "من نحن" },
  { href: "/contact", label: "تواصل معنا" },
];

export function Header() {
  const { count, ready } = useCart();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  function search(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/products?q=${encodeURIComponent(q)}` : "/products");
    setOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-sand-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-18 max-w-7xl items-center gap-4 px-4 py-3 sm:px-6">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="grid h-10 w-10 place-items-center rounded-lg text-sea-800 hover:bg-sand-100 lg:hidden"
          aria-label="فتح القائمة"
        >
          <MenuIcon className="h-6 w-6" />
        </button>

        <Logo />

        <form onSubmit={search} className="relative mx-auto hidden max-w-md flex-1 lg:block">
          <SearchIcon className="pointer-events-none absolute start-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            type="search"
            placeholder="ابحث عن منتج…"
            aria-label="ابحث في المتجر"
            className="w-full rounded-full border border-sand-200 bg-sand-50 py-2.5 pe-4 ps-11 text-sm outline-none transition focus:border-sea-400 focus:bg-white"
          />
        </form>

        <Link
          href="/cart"
          className="relative ms-auto grid h-11 w-11 place-items-center rounded-full bg-sea-700 text-white transition hover:bg-sea-800 lg:ms-0"
          aria-label={`السلة${ready && count ? ` — ${count} منتج` : ""}`}
        >
          <CartIcon className="h-5 w-5" />
          {ready && count > 0 && (
            <span className="nums absolute -end-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-gold-500 px-1 text-[11px] font-bold text-sea-900">
              {count}
            </span>
          )}
        </Link>
      </div>

      {/* شريط التصنيفات — سطح المكتب */}
      <nav className="hidden border-t border-sand-100 lg:block">
        <ul className="mx-auto flex max-w-7xl items-center gap-1 px-6 text-[14px]">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="block rounded-lg px-3.5 py-2.5 font-medium text-ink transition hover:bg-sand-100 hover:text-sea-700"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* قائمة الجوال */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-sea-900/50"
            onClick={() => setOpen(false)}
            aria-label="إغلاق القائمة"
          />
          <div className="absolute inset-y-0 end-0 flex w-[86%] max-w-sm flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-sand-200 p-4">
              <Logo />
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="grid h-10 w-10 place-items-center rounded-lg hover:bg-sand-100"
                aria-label="إغلاق"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={search} className="relative border-b border-sand-100 p-4">
              <SearchIcon className="pointer-events-none absolute start-7 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-muted" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                type="search"
                placeholder="ابحث عن منتج…"
                aria-label="ابحث في المتجر"
                className="w-full rounded-full border border-sand-200 bg-sand-50 py-2.5 pe-4 ps-11 text-sm outline-none focus:border-sea-400 focus:bg-white"
              />
            </form>

            <ul className="flex-1 overflow-y-auto p-2">
              {links.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-xl px-4 py-3 font-medium text-ink transition hover:bg-sand-100"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </header>
  );
}
