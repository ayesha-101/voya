"use client";

import Link from "next/link";
import type { Category } from "@/lib/types";
import { site } from "@/data/site";
import { useT } from "./LangProvider";

export function Footer({ categories }: { categories: Category[] }) {
  const t = useT();

  return (
    <footer className="mt-20 bg-plum-900 text-[#f4dde5]">
      <div className="mx-auto grid max-w-[1360px] gap-10 px-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1.2fr]">
        <div className="flex flex-col gap-4">
          <span className="display text-[34px] tracking-[0.18em] text-gold-400">VOYA</span>
          <p className="max-w-[42ch] text-sm leading-[1.9] text-[#e6c9d3]">{t.footer.about}</p>
          <div className="flex gap-2.5 pt-1">
            {site.social.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-gold-400/40 px-4 py-2 text-xs transition hover:bg-gold-400 hover:text-plum-900"
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-[13px] tracking-[0.12em] text-gold-400">{t.footer.categories}</h3>
          <ul className="flex flex-col gap-2.5 text-sm text-[#e6c9d3]">
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
          <h3 className="mb-4 text-[13px] tracking-[0.12em] text-gold-400">{t.footer.help}</h3>
          <ul className="flex flex-col gap-2.5 text-sm text-[#e6c9d3]">
            {t.footer.links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-gold-400">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-[13px] tracking-[0.12em] text-gold-400">{t.footer.contact}</h3>
          <ul className="flex flex-col gap-2.5 text-sm text-[#e6c9d3]">
            <li className="nums">{site.phone}</li>
            <li>{site.email}</li>
            <li>{site.country}</li>
            <li className="pt-1 text-[13px] text-[#cba7b7]">{t.footer.hours}</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gold-400/20">
        <div className="mx-auto flex max-w-[1360px] flex-col items-center justify-between gap-4 px-10 py-5 text-xs text-[#d7b6c3] sm:flex-row">
          <p className="nums">© {new Date().getFullYear()} {site.nameEn} — {t.footer.rights}</p>
          <div className="flex gap-2">
            {["VISA", "MASTERCARD", "APPLE PAY", t.footer.cod].map((m) => (
              <span key={m} className="rounded-lg border border-gold-400/30 px-3 py-1.5 text-[10px] font-bold tracking-wide">
                {m}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
