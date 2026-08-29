"use client";

import { useLang } from "./LangProvider";

export function LangToggle() {
  const { lang, setLang } = useLang();
  const base = "rounded-full px-3.5 py-2 text-[13px] font-bold transition";
  return (
    <div className="flex items-center gap-1 rounded-full border border-blush-300 bg-white p-1">
      <button
        type="button"
        onClick={() => setLang("ar")}
        className={`${base} ${lang === "ar" ? "bg-plum-600 text-white" : "text-plum-600 hover:bg-blush-100"}`}
        style={{ fontFamily: "var(--font-ar)" }}
      >
        العربية
      </button>
      <button
        type="button"
        onClick={() => setLang("en")}
        className={`${base} ${lang === "en" ? "bg-plum-600 text-white" : "text-plum-600 hover:bg-blush-100"}`}
        style={{ fontFamily: "var(--font-en)" }}
      >
        EN
      </button>
    </div>
  );
}
