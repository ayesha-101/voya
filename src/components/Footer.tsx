import Link from "next/link";
import { categories } from "@/data/products";
import { site } from "@/data/site";
import { icons } from "./Icons";
import { Logo } from "./Logo";

const help = [
  { href: "/about", label: "من نحن" },
  { href: "/contact", label: "تواصل معنا" },
  { href: "/shipping", label: "الشحن والتوصيل" },
  { href: "/returns", label: "الاستبدال والاسترجاع" },
  { href: "/privacy", label: "سياسة الخصوصية" },
];

export function Footer() {
  return (
    <footer className="mt-20 bg-sea-900 text-sand-100">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-4">
          <Logo inverted />
          <p className="text-sm leading-6 text-sand-200/80">{site.description}</p>
          <div className="flex gap-2">
            {site.social.map((s) => {
              const Icon = icons[s.icon];
              return (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  target="_blank"
                  rel="noreferrer"
                  className="grid h-10 w-10 place-items-center rounded-full bg-white/10 transition hover:bg-gold-500 hover:text-sea-900"
                >
                  <Icon className="h-5 w-5" />
                </a>
              );
            })}
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-bold text-white">التصنيفات</h3>
          <ul className="space-y-2.5 text-sm text-sand-200/80">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link href={`/products?category=${c.slug}`} className="hover:text-gold-400">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-bold text-white">خدمة العملاء</h3>
          <ul className="space-y-2.5 text-sm text-sand-200/80">
            {help.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-gold-400">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-bold text-white">تواصل معنا</h3>
          <ul className="space-y-2.5 text-sm text-sand-200/80">
            <li>
              <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="nums hover:text-gold-400">
                {site.phone}
              </a>
            </li>
            <li>
              <a href={`mailto:${site.email}`} className="hover:text-gold-400">
                {site.email}
              </a>
            </li>
            <li>{site.country}</li>
            <li className="pt-2 text-xs text-sand-200/60">
              السبت – الخميس، 9 صباحًا – 9 مساءً
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-5 text-xs text-sand-200/70 sm:flex-row">
          <p className="nums">© {new Date().getFullYear()} {site.nameEn} — جميع الحقوق محفوظة</p>
          <div className="flex items-center gap-2">
            {["VISA", "MASTERCARD", "MADA", "APPLE PAY", "الدفع عند الاستلام"].map((m) => (
              <span
                key={m}
                className="rounded-md bg-white/10 px-2.5 py-1.5 text-[10px] font-bold tracking-wide"
              >
                {m}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
