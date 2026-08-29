"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Category } from "@/lib/types";
import { categoryName } from "@/lib/localize";
import { useLang, useT } from "./LangProvider";

const SORTS = ["featured", "price-asc", "price-desc", "rating", "discount", "newest"] as const;

export function ProductFilters({
  categories,
  total,
}: {
  categories: Category[];
  total: number;
}) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const t = useT();
  const { lang } = useLang();

  const active = params.get("category") ?? "all";
  const sort = params.get("sort") ?? "featured";
  const query = params.get("q") ?? "";

  /** يبني رابطًا بتعديل معامل واحد مع إبقاء الباقي كما هو. */
  function withParam(key: string, value: string | null) {
    const next = new URLSearchParams(params.toString());
    if (value === null || value === "" || value === "all" || value === "featured") {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    const qs = next.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }

  const chips = [
    active !== "all" && {
      key: "category",
      label: categoryName(
        categories.find((c) => c.slug === active) ?? { name: active, nameEn: active },
        lang,
      ),
    },
    query && { key: "q", label: `“${query}”` },
    sort !== "featured" && { key: "sort", label: t.sorts[sort as keyof typeof t.sorts] },
  ].filter(Boolean) as { key: string; label: string }[];

  return (
    <div className="mb-8 space-y-4">
      {/* شرائح التصنيفات — تُمرَّر أفقيًا على الجوال */}
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
        {[{ slug: "all", name: t.filters.all, nameEn: t.filters.all }, ...categories].map(
          (c) => (
            <Link
              key={c.slug}
              href={withParam("category", c.slug)}
              scroll={false}
              aria-current={active === c.slug ? "page" : undefined}
              className={`shrink-0 rounded-full border px-4 py-2 text-[13px] font-bold whitespace-nowrap transition ${
                active === c.slug
                  ? "border-plum-600 bg-plum-600 text-white"
                  : "border-blush-300 bg-white text-plum-900 hover:border-gold-400"
              }`}
            >
              {categoryName(c as Category, lang)}
            </Link>
          ),
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="nums text-sm text-muted">
          {total} {t.filters.results}
        </p>

        <label className="flex items-center gap-2 text-sm">
          <span className="text-muted">{t.filters.sortBy}</span>
          <select
            value={sort}
            onChange={(e) => router.push(withParam("sort", e.target.value))}
            className="rounded-full border border-blush-300 bg-white px-4 py-2 text-[13px] font-bold text-plum-900 outline-none focus:border-gold-500"
          >
            {SORTS.map((s) => (
              <option key={s} value={s}>
                {t.sorts[s]}
              </option>
            ))}
          </select>
        </label>
      </div>

      {chips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 border-t border-blush-200 pt-4">
          <span className="text-xs text-muted">{t.filters.active}</span>
          {chips.map((c) => (
            <Link
              key={c.key}
              href={withParam(c.key, null)}
              scroll={false}
              className="flex items-center gap-1.5 rounded-full bg-blush-100 px-3 py-1.5 text-[13px] font-bold text-plum-900 transition hover:bg-blush-200"
            >
              {c.label}
              <span aria-hidden className="text-muted">
                ✕
              </span>
            </Link>
          ))}
          <Link
            href={pathname}
            scroll={false}
            className="text-[13px] font-bold text-plum-600 hover:underline"
          >
            {t.filters.clear}
          </Link>
        </div>
      )}
    </div>
  );
}
