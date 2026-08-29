"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api, DEMO_MODE } from "@/lib/api";
import { demoProducts } from "@/data/demo-catalog";
import { formatPrice } from "@/lib/format";
import { productName } from "@/lib/localize";
import type { Product } from "@/lib/types";
import { useLang, useT } from "./LangProvider";
import { ProductArt } from "./ProductArt";
import { SlideOver } from "./SlideOver";
import { useUI } from "./UIProvider";

const MIN = 2;
const LIMIT = 6;

function searchDemo(q: string) {
  const needle = q.trim().toLowerCase();
  return demoProducts
    .filter((p) =>
      [p.name, p.nameEn, p.short, p.categoryName, ...p.ingredients]
        .join(" ")
        .toLowerCase()
        .includes(needle),
    )
    .slice(0, LIMIT);
}

export function SearchOverlay() {
  const { panel, close } = useUI();
  const t = useT();
  const { lang } = useLang();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [busy, setBusy] = useState(false);

  const open = panel === "search";

  useEffect(() => {
    const term = query.trim();
    if (!open || term.length < MIN) return;

    let cancelled = false;
    // تأخير قصير حتى لا يُرسل نداء مع كل حرف
    const timer = setTimeout(async () => {
      setBusy(true);
      try {
        if (DEMO_MODE) {
          const hits = searchDemo(term);
          if (!cancelled) {
            setResults(hits);
            setTotal(hits.length);
          }
        } else {
          const data = await api<{ products: Product[]; total: number }>(
            `/api/products?q=${encodeURIComponent(term)}&limit=${LIMIT}`,
            { auth: false },
          );
          if (!cancelled) {
            setResults(data.products);
            setTotal(data.total);
          }
        }
      } catch {
        if (!cancelled) {
          setResults([]);
          setTotal(0);
        }
      } finally {
        if (!cancelled) setBusy(false);
      }
    }, 220);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, open]);

  const term = query.trim();
  // النتائج تُعرض فقط لبحث مكتمل، فلا حاجة لتفريغها داخل effect
  const visible = open && term.length >= MIN ? results : [];

  return (
    <SlideOver
      open={open}
      onClose={() => {
        setQuery("");
        close();
      }}
      title={t.search.title}
    >
      <input
        autoFocus
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={t.search.placeholder}
        aria-label={t.search.placeholder}
        className="w-full rounded-full border border-blush-300 bg-white px-5 py-3 text-sm outline-none transition focus:border-gold-500"
      />

      <div className="mt-5">
        {term.length < MIN ? (
          <p className="py-10 text-center text-sm text-muted">{t.search.hint}</p>
        ) : busy && visible.length === 0 ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-card bg-blush-100" />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted">{t.search.empty}</p>
        ) : (
          <>
            <p className="nums mb-3 text-xs text-muted">
              {total} {t.search.results}
            </p>
            <ul className="space-y-2">
              {visible.map((p) => (
                <li key={p.slug}>
                  <Link
                    href={`/products/${p.slug}`}
                    onClick={close}
                    className="flex items-center gap-3 rounded-card border border-blush-200 bg-white p-2.5 transition hover:border-gold-400"
                  >
                    <span className="h-16 w-14 shrink-0 rounded-xl bg-blush-50 p-1">
                      <ProductArt
                        shape={p.shape}
                        tone={p.tone}
                        label={productName(p, lang)}
                        className="h-full w-full"
                      />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-bold text-plum-900">
                        {productName(p, lang)}
                      </span>
                      <span className="nums block text-sm font-extrabold text-plum-700">
                        {formatPrice(p.price, lang)}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>

            {total > visible.length && (
              <Link
                href={`/products?q=${encodeURIComponent(term)}`}
                onClick={close}
                className="mt-4 block rounded-full border border-blush-300 py-3 text-center text-sm font-bold text-plum-700 transition hover:border-gold-400"
              >
                {t.search.viewAll}
              </Link>
            )}
          </>
        )}
      </div>
    </SlideOver>
  );
}
