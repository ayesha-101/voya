"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Heart, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import type { Category } from "@/lib/types";
import { useCart } from "./CartProvider";
import { useWishlist } from "./useWishlist";
import { useUI } from "./UIProvider";
import { CATEGORY_ICONS, DefaultCategoryIcon } from "./CategoryIcons";
import { cn } from "@/lib/utils";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const ANNOUNCEMENTS = [
  "شحن مجاني للطلبات فوق 200 د.إ 🌸",
  "منتجات أصلية 100% — نجربها بأنفسنا قبل أن نقدمها لكِ",
  "توصيل سريع داخل الإمارات خلال 1–3 أيام",
];

const NAV_LINKS = [
  { to: "/", label: "الرئيسية" },
  { to: "/products", label: "المتجر" },
  { to: "/about", label: "من نحن" },
  { to: "/contact", label: "تواصل معنا" },
];

function RoseIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M12 2c4 2.2 6 6 3.6 10.4C13.4 16.6 9 18.6 5.4 16.4 1.8 14.2 2.4 9.6 5.6 7 8.2 4.9 12 5 13.4 7.4c1 1.8-.2 4-2.2 4.2-1.4.2-2.6-.8-2.4-2.2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path d="M12 15c0 3-1.4 5.4-4 7" stroke="#7FA98C" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function AnnouncementBar() {
  const [dismissed, setDismissed] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % ANNOUNCEMENTS.length), 4000);
    return () => clearInterval(t);
  }, []);

  if (dismissed) return null;

  return (
    <div className="bg-gradient-rose relative flex h-[42px] items-center justify-center overflow-hidden text-white">
      <div className="shimmer-gold animate-shimmer pointer-events-none absolute inset-0" aria-hidden />
      <AnimatePresence mode="wait">
        <motion.p
          key={index}
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -16, opacity: 0 }}
          transition={{ duration: 0.4, ease: EASE }}
          className="px-10 text-center text-[13px] font-medium"
        >
          {ANNOUNCEMENTS[index]}
        </motion.p>
      </AnimatePresence>
      <button
        type="button"
        aria-label="إغلاق الشريط"
        onClick={() => setDismissed(true)}
        className="absolute top-1/2 left-3 -translate-y-1/2 rounded-full p-1 text-white/80 transition-colors hover:bg-white/15 hover:text-white"
      >
        <X className="h-4 w-4" strokeWidth={1.5} />
      </button>
    </div>
  );
}

export function VoyaLogo({ light = false }: { light?: boolean }) {
  return (
    <span className="group flex items-center gap-2">
      <span className="relative">
        <span
          className={cn(
            "font-ruqaa text-[34px] leading-none font-bold",
            light ? "text-blush-50" : "text-plum",
          )}
        >
          فويا
        </span>
        <svg viewBox="0 0 90 8" className="text-gold absolute -bottom-1.5 right-0 w-full" aria-hidden>
          <path
            d="M2 5 C 25 1, 60 8, 88 3"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
      </span>
      <RoseIcon className="text-rose h-6 w-6 transition-transform duration-500 group-hover:rotate-12" />
    </span>
  );
}

function MobileMenu({
  open,
  onClose,
  categories,
}: {
  open: boolean;
  onClose: () => void;
  categories: Category[];
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          className="bg-plum fixed inset-0 z-[70] flex flex-col"
        >
          {[...Array(6)].map((_, i) => (
            <motion.img
              key={i}
              src="/petal.svg"
              alt=""
              aria-hidden
              className="pointer-events-none absolute opacity-20"
              style={{ top: `${8 + i * 15}%`, right: `${(i * 37) % 88}%`, width: 18 + (i % 3) * 8 }}
              animate={{ y: [0, 26, 0], rotate: [0, 18, -10, 0] }}
              transition={{ duration: 9 + i, repeat: Infinity, ease: "easeInOut" }}
            />
          ))}
          <div className="flex items-center justify-between px-6 py-6">
            <Link href="/" onClick={onClose} aria-label="فويا — الرئيسية">
              <VoyaLogo light />
            </Link>
            <button
              type="button"
              onClick={onClose}
              aria-label="إغلاق القائمة"
              className="border-blush-50/20 text-blush-50 rounded-full border p-2.5"
            >
              <X className="h-5 w-5" strokeWidth={1.5} />
            </button>
          </div>
          <nav className="flex flex-1 flex-col gap-3 px-8 pt-6">
            {NAV_LINKS.map((l, i) => (
              <motion.div
                key={l.to}
                initial={{ y: 28, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.08 + i * 0.07, duration: 0.55, ease: EASE }}
              >
                <Link
                  href={l.to}
                  onClick={onClose}
                  className="font-heading text-cream hover:text-rose text-[30px] font-semibold transition-colors"
                >
                  {l.label}
                </Link>
              </motion.div>
            ))}
            <motion.div
              initial={{ y: 28, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.55, ease: EASE }}
              className="mt-4 grid grid-cols-2 gap-2"
            >
              {categories.map((c) => (
                <Link
                  key={c.slug}
                  href={`/products?category=${c.slug}`}
                  onClick={onClose}
                  className="border-blush-50/15 text-blush-50/85 hover:border-rose hover:text-rose rounded-full border px-4 py-2 text-center text-sm transition-colors"
                >
                  {c.name}
                </Link>
              ))}
            </motion.div>
          </nav>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="border-blush-50/15 mx-8 mb-8 border-t pt-5"
          >
            <p className="text-blush-50/70 text-sm">
              راسلينا واتساب: <span dir="ltr" className="tnum">+971 55 3633 977</span>
            </p>
            <p className="text-blush-50/70 mt-1 text-sm">voyagroups@gmail.com</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function Navbar({ categories }: { categories: Category[] }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [catsOpen, setCatsOpen] = useState(false);
  const { count, ready } = useCart();
  const wishlist = useWishlist();
  const { openCart, openSearch } = useUI();
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    // قراءة أولى بعد التركيب حتى لا يتغيّر الحال داخل جسم التأثير
    const id = requestAnimationFrame(onScroll);
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const cartCount = ready ? count : 0;
  const isActive = (to: string) => (to === "/" ? pathname === "/" : pathname.startsWith(to));

  const navLink = (l: { to: string; label: string }) => (
    <li key={l.to}>
      <Link
        href={l.to}
        className={cn(
          "hover:text-rose-deep relative py-1 text-[15px] font-medium transition-colors",
          isActive(l.to)
            ? "text-plum after:bg-gold after:absolute after:-bottom-0.5 after:right-0 after:h-0.5 after:w-full after:rounded-full"
            : "text-ink-soft",
        )}
      >
        {l.label}
      </Link>
    </li>
  );

  return (
    <>
      <AnnouncementBar />
      <header
        className={cn(
          "sticky top-0 z-50 transition-all duration-500",
          scrolled
            ? "border-blush-200 bg-blush-50/90 border-b shadow-[0_4px_24px_rgba(150,97,122,0.08)] backdrop-blur-[18px]"
            : "border-b border-transparent bg-transparent",
        )}
      >
        <nav className="container-voya flex h-[76px] items-center justify-between gap-4">
          <Link href="/" aria-label="فويا — الرئيسية">
            <VoyaLogo />
          </Link>

          <ul className="hidden items-center gap-7 lg:flex">
            {NAV_LINKS.slice(0, 2).map(navLink)}
            <li
              className="relative"
              onMouseEnter={() => setCatsOpen(true)}
              onMouseLeave={() => setCatsOpen(false)}
            >
              <button
                type="button"
                onClick={() => setCatsOpen((v) => !v)}
                className="text-ink-soft hover:text-rose-deep flex items-center gap-1 py-1 text-[15px] font-medium transition-colors"
                aria-expanded={catsOpen}
              >
                الفئات
                <ChevronDown
                  className={cn("h-4 w-4 transition-transform", catsOpen && "rotate-180")}
                  strokeWidth={1.5}
                />
              </button>
              <AnimatePresence>
                {catsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.98 }}
                    transition={{ duration: 0.3, ease: EASE }}
                    className="border-blush-200 shadow-card-hover absolute top-full right-0 w-[430px] rounded-[24px] border bg-white p-4 pt-3"
                  >
                    <ul className="grid grid-cols-2 gap-1.5">
                      {categories.map((c) => {
                        const Icon = CATEGORY_ICONS[c.slug] ?? DefaultCategoryIcon;
                        return (
                          <li key={c.slug}>
                            <Link
                              href={`/products?category=${c.slug}`}
                              onClick={() => setCatsOpen(false)}
                              className="group/item hover:bg-blush-100 flex items-center gap-3 rounded-2xl px-3 py-2.5 transition-colors"
                            >
                              <span className="bg-blush-100 text-mauve group-hover/item:bg-rose flex h-9 w-9 items-center justify-center rounded-full transition-colors group-hover/item:text-white">
                                <Icon className="h-4 w-4" strokeWidth={1.5} />
                              </span>
                              <span className="text-plum text-sm font-medium">{c.name}</span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
            {NAV_LINKS.slice(2).map(navLink)}
          </ul>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              aria-label="بحث"
              onClick={openSearch}
              className="text-plum hover:bg-blush-100 hover:text-rose-deep flex h-10 w-10 items-center justify-center rounded-full transition hover:-translate-y-0.5"
            >
              <Search className="h-5 w-5" strokeWidth={1.5} />
            </button>
            <Link
              href="/wishlist"
              aria-label="المفضلة"
              className="text-plum hover:bg-blush-100 hover:text-rose-deep relative hidden h-10 w-10 items-center justify-center rounded-full transition hover:-translate-y-0.5 sm:flex"
            >
              <Heart className="h-5 w-5" strokeWidth={1.5} />
              {wishlist.count > 0 && (
                <span className="tnum bg-rose absolute -top-0.5 -left-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-bold text-white">
                  {wishlist.count}
                </span>
              )}
            </Link>
            <button
              type="button"
              aria-label="سلة التسوق"
              onClick={openCart}
              className="text-plum hover:bg-blush-100 hover:text-rose-deep relative flex h-10 w-10 items-center justify-center rounded-full transition hover:-translate-y-0.5"
            >
              <ShoppingBag className="h-5 w-5" strokeWidth={1.5} />
              {cartCount > 0 && (
                <motion.span
                  key={cartCount}
                  initial={{ scale: 1.5 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 18 }}
                  className="tnum bg-rose absolute -top-0.5 -left-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-bold text-white"
                >
                  {cartCount}
                </motion.span>
              )}
            </button>
            <Link
              href="/account"
              aria-label="الحساب"
              className="text-plum hover:bg-blush-100 hover:text-rose-deep hidden h-10 w-10 items-center justify-center rounded-full transition hover:-translate-y-0.5 sm:flex"
            >
              <User className="h-5 w-5" strokeWidth={1.5} />
            </Link>
            <button
              type="button"
              aria-label="القائمة"
              onClick={() => setMobileOpen(true)}
              className="text-plum hover:bg-blush-100 flex h-10 w-10 items-center justify-center rounded-full transition lg:hidden"
            >
              <Menu className="h-5 w-5" strokeWidth={1.5} />
            </button>
          </div>
        </nav>
      </header>
      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} categories={categories} />
    </>
  );
}
