import Link from "next/link";
import type { Category } from "@/lib/types";
import { categoryIcons, LeafIcon } from "./Icons";

export function CategoryStrip({ categories }: { categories: Category[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
      {categories.map((c) => {
        const Icon = categoryIcons[c.slug as keyof typeof categoryIcons] ?? LeafIcon;
        return (
          <Link
            key={c.slug}
            href={`/products?category=${c.slug}`}
            className="group flex flex-col items-center gap-3 rounded-card border border-sand-200 bg-white p-5 text-center transition hover:-translate-y-1 hover:shadow-lg hover:shadow-sea-900/5"
          >
            <span
              className="grid h-16 w-16 place-items-center rounded-full text-white transition group-hover:scale-110"
              style={{ background: c.tone }}
              aria-hidden
            >
              <Icon className="h-7 w-7" />
            </span>
            <span className="text-sm font-bold text-ink">{c.name}</span>
            <span className="text-[11px] leading-4 text-muted">{c.blurb}</span>
            <span className="nums text-[11px] text-sea-600">{c.productCount} منتج</span>
          </Link>
        );
      })}
    </div>
  );
}
