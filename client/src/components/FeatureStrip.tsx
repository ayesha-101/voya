"use client";

import { useT } from "./LangProvider";

export function FeatureStrip() {
  const t = useT();
  return (
    <section className="border-y border-blush-200 bg-white">
      <div className="mx-auto grid max-w-[1360px] gap-7 px-10 py-7 sm:grid-cols-2 lg:grid-cols-4">
        {t.services.map((f) => (
          <div key={f.title} className="flex items-center gap-3.5">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-gold-200 bg-gold-100 text-base text-gold-600">
              ◇
            </span>
            <div>
              <p className="text-sm font-bold">{f.title}</p>
              <p className="mt-0.5 text-xs text-muted">{f.body}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
