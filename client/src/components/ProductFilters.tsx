"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Category } from "@/lib/types";

const sorts = [
  { value: "featured", label: "الأكثر رواجًا" },
  { value: "price-asc", label: "السعر: من الأقل" },
  { value: "price-desc", label: "السعر: من الأعلى" },
  { value: "rating", label: "الأعلى تقييمًا" },
  { value: "discount", label: "أعلى خصم" },
  { value: "newest", label: "الأحدث" },
];

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

  const active = params.get("category") ?? "all";
  const sort = params.get("sort") ?? "featured";

  function hrefFor(category: string) {
    const next = new URLSearchParams(params.toString());
    if (category === "all") next.delete("category");
    else next.set("category", category);
    const qs = next.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }

  function changeSort(value: string) {
    const next = new URLSearchParams(params.toString());
    if (value === "featured") next.delete("sort");
    else next.set("sort", value);
    const qs = next.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  return (
    <div className="mb-8 space-y-4">
      <div className="no-scrollbar -mx-6 flex gap-2 overflow-x-auto px-6 pb-1">
        {[{ slug: "all", name: "الكل" }, ...categories].map((c) => (
          <Link
            key={c.slug}
            href={hrefFor(c.slug)}
            scroll={false}
            className={`shrink-0 rounded-full border px-4 py-2 text-[13px] font-bold transition ${
              active === c.slug
                ? "border-sea-700 bg-sea-700 text-white"
                : "border-sand-300 bg-white text-ink hover:border-sea-400"
            }`}
          >
            {c.name}
          </Link>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="nums text-sm text-muted">{total} منتج</p>
        <label className="flex items-center gap-2 text-sm">
          <span className="text-muted">ترتيب حسب:</span>
          <select
            value={sort}
            onChange={(e) => changeSort(e.target.value)}
            className="rounded-full border border-sand-300 bg-white px-4 py-2 text-[13px] font-bold text-ink outline-none focus:border-sea-400"
          >
            {sorts.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}
