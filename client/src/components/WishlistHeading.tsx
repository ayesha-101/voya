"use client";

import { useT } from "./LangProvider";

export function WishlistHeading() {
  const t = useT();
  return (
    <header className="mb-8">
      <h1 className="display text-3xl text-plum-900 sm:text-[42px]">{t.wish.title}</h1>
      <span className="mt-4 block h-px w-24 bg-linear-to-l from-gold-500 to-transparent" />
    </header>
  );
}
