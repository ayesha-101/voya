"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

type Panel = "cart" | "search" | null;

type UIValue = {
  panel: Panel;
  openCart: () => void;
  openSearch: () => void;
  close: () => void;
};

const UIContext = createContext<UIValue | null>(null);

/** يتحكّم في اللوحات المنزلقة — واحدة مفتوحة في كل وقت. */
export function UIProvider({ children }: { children: React.ReactNode }) {
  const [panel, setPanel] = useState<Panel>(null);

  const openCart = useCallback(() => setPanel("cart"), []);
  const openSearch = useCallback(() => setPanel("search"), []);
  const close = useCallback(() => setPanel(null), []);

  const value = useMemo(
    () => ({ panel, openCart, openSearch, close }),
    [panel, openCart, openSearch, close],
  );

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export function useUI() {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error("useUI must be used inside <UIProvider>");
  return ctx;
}
