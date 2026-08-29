"use client";

import { createContext, useContext, useEffect, useMemo, useSyncExternalStore } from "react";
import { dictionary, type Dict } from "@/i18n/dictionary";
import {
  getLangServerSnapshot,
  getLangSnapshot,
  setLang,
  subscribeLang,
  type Lang,
} from "@/lib/langStore";

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: Dict };

const LangContext = createContext<Ctx | null>(null);

export function LangProvider({ children }: { children: React.ReactNode }) {
  const lang = useSyncExternalStore(
    subscribeLang,
    getLangSnapshot,
    getLangServerSnapshot,
  );

  // العنصر <html> يُحدَّث مباشرة لأن اتجاه الصفحة يسبق شجرة React
  useEffect(() => {
    const html = document.documentElement;
    html.lang = lang;
    html.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);

  const value = useMemo(() => ({ lang, setLang, t: dictionary[lang] as Dict }), [lang]);
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used inside <LangProvider>");
  return ctx;
}

export function useT() {
  return useLang().t;
}
