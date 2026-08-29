"use client";

import type { Category } from "@/lib/types";
import { categoryName } from "@/lib/localize";
import { useLang, useT } from "./LangProvider";

export function ProductsHeading({
  category,
  query,
}: {
  category?: Category;
  query?: string;
}) {
  const t = useT();
  const { lang } = useLang();

  const title = query
    ? `${t.sections.searchResults} “${query}”`
    : category
      ? categoryName(category, lang)
      : t.navExtra.all;

  return (
    <header className="mb-8">
      <h1 className="display text-3xl text-plum-900 sm:text-[42px]">{title}</h1>
      {category?.blurb && !query && (
        <p className="mt-2 text-sm text-muted">{category.blurb}</p>
      )}
      <span className="mt-4 block h-px w-24 bg-linear-to-l from-gold-500 to-transparent" />
    </header>
  );
}
