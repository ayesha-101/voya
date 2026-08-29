import Link from "next/link";
import type { Category } from "@/lib/types";

const ART = [
  "linear-gradient(150deg, #f7dbe4, #b8788c)",
  "linear-gradient(150deg, #f6e0cf, #c98f6c)",
  "linear-gradient(150deg, #efd9e6, #8a4a63)",
  "linear-gradient(150deg, #f7c9d3, #a7315a)",
  "linear-gradient(150deg, #f0dcb0, #b08430)",
  "linear-gradient(150deg, #e7c37a, #8a6a1d)",
  "linear-gradient(150deg, #f3e2e0, #b8788c)",
  "linear-gradient(150deg, #d8b9c6, #4c2333)",
];

export function CategoryStrip({ categories }: { categories: Category[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {categories.map((c, i) => (
        <Link
          key={c.slug}
          href={`/products?category=${c.slug}`}
          className="flex items-center gap-3.5 rounded-card border border-blush-200 bg-white p-3.5 transition hover:-translate-y-1 hover:border-gold-400 hover:shadow-[0_16px_32px_rgba(108,42,72,.12)]"
        >
          <span
            className="display grid h-[76px] w-[76px] shrink-0 place-items-center rounded-[20px] text-[26px] text-white"
            style={{ background: ART[i % ART.length] }}
            aria-hidden
          >
            {c.name.trim().charAt(0)}
          </span>
          <span className="flex flex-col gap-1">
            <span className="text-base font-bold text-plum-900">{c.name}</span>
            <span className="text-xs text-muted">{c.blurb}</span>
          </span>
        </Link>
      ))}
    </div>
  );
}
