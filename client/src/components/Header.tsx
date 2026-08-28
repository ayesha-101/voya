"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { Category, User } from "@/lib/types";
import { useAuth } from "./AuthProvider";
import { useCart } from "./CartProvider";
import { CartIcon, CloseIcon, MenuIcon, SearchIcon, UserIcon } from "./Icons";
import { Logo } from "./Logo";

function buildLinks(categories: Category[]) {
  return [
    { href: "/products", label: "كل المنتجات" },
    ...categories.map((c) => ({ href: `/products?category=${c.slug}`, label: c.name })),
    { href: "/about", label: "من نحن" },
    { href: "/contact", label: "تواصل معنا" },
  ];
}

function accountHref(user: User | null) {
  if (!user) return "/login";
  return user.role === "admin" ? "/admin" : "/account";
}

export function Header({ categories }: { categories: Category[] }) {
  const links = buildLinks(categories);
  const { count, ready } = useCart();
  const { user, ready: authReady } = useAuth();
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
    <header className="sticky top-0 z-50 border-b border-blush-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-18 max-w-7xl items-center gap-4 px-4 py-3 sm:px-6">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="grid h-10 w-10 place-items-center rounded-lg text-plum-800 hover:bg-blush-100 lg:hidden"
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
            className="w-full rounded-full border border-blush-200 bg-blush-50 py-2.5 pe-4 ps-11 text-sm outline-none transition focus:border-plum-400 focus:bg-white"
          />
        </form>

        <div className="ms-auto flex items-center gap-2 lg:ms-0">
          <Link
            href={accountHref(user)}
            className="grid h-11 w-11 place-items-center rounded-full border border-blush-300 text-plum-700 transition hover:border-plum-400 hover:bg-blush-50"
            aria-label={authReady && user ? `حسابي — ${user.name}` : "تسجيل الدخول"}
            title={authReady && user ? user.name : "تسجيل الدخول"}
          >
            <UserIcon className="h-5 w-5" />
          </Link>

          <Link
            href="/cart"
            className="relative grid h-11 w-11 place-items-center rounded-full bg-plum-700 text-white transition hover:bg-plum-800"
            aria-label={`السلة${ready && count ? ` — ${count} منتج` : ""}`}
          >
            <CartIcon className="h-5 w-5" />
            {ready && count > 0 && (
              <span className="nums absolute -end-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-rose-500 px-1 text-[11px] font-bold text-plum-900">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* شريط التصنيفات — سطح المكتب */}
      <nav className="hidden border-t border-blush-100 lg:block">
        <ul className="mx-auto flex max-w-7xl items-center gap-1 px-6 text-[14px]">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="block rounded-lg px-3.5 py-2.5 font-medium text-ink transition hover:bg-blush-100 hover:text-plum-700"
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
            className="absolute inset-0 bg-plum-900/50"
            onClick={() => setOpen(false)}
            aria-label="إغلاق القائمة"
          />
          <div className="absolute inset-y-0 end-0 flex w-[86%] max-w-sm flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-blush-200 p-4">
              <Logo />
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="grid h-10 w-10 place-items-center rounded-lg hover:bg-blush-100"
                aria-label="إغلاق"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={search} className="relative border-b border-blush-100 p-4">
              <SearchIcon className="pointer-events-none absolute start-7 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-muted" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                type="search"
                placeholder="ابحث عن منتج…"
                aria-label="ابحث في المتجر"
                className="w-full rounded-full border border-blush-200 bg-blush-50 py-2.5 pe-4 ps-11 text-sm outline-none focus:border-plum-400 focus:bg-white"
              />
            </form>

            <ul className="flex-1 overflow-y-auto p-2">
              {links.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-xl px-4 py-3 font-medium text-ink transition hover:bg-blush-100"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
              <li className="mt-2 border-t border-blush-200 pt-2">
                <Link
                  href={accountHref(user)}
                  onClick={() => setOpen(false)}
                  className="block rounded-xl px-4 py-3 font-bold text-plum-700 transition hover:bg-blush-100"
                >
                  {authReady && user
                    ? user.role === "admin"
                      ? "لوحة التحكّم"
                      : "حسابي وطلباتي"
                    : "تسجيل الدخول"}
                </Link>
              </li>
            </ul>
          </div>
        </div>
      )}
    </header>
  );
}
