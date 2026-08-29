"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { api, DEMO_MODE } from "@/lib/api";
import { demoProducts } from "@/data/demo-catalog";
import type { CartSummary, Product } from "@/lib/types";
import { useAuth } from "./AuthProvider";

/**
 * السلة تعمل في وضعين:
 *  - زائر: تُحفظ في localStorage وتُسعَّر محليًا من بيانات المنتجات.
 *  - مسجّل: مصدر الحقيقة هو الخادم (جدول cart_items)، وتُدمج سلة الزائر عند الدخول.
 */

const STORAGE_KEY = "voya:cart:v2";
const FREE_SHIPPING_THRESHOLD = 200;
const SHIPPING_FEE = 20;

type GuestLine = { slug: string; qty: number };

type CartValue = CartSummary & {
  ready: boolean;
  pending: boolean;
  error: string | null;
  add: (product: Product, qty?: number) => Promise<void>;
  setQty: (slug: string, qty: number) => Promise<void>;
  remove: (slug: string) => Promise<void>;
  clear: () => Promise<void>;
  guestLines: GuestLine[];
};

const EMPTY: CartSummary = {
  items: [],
  subtotal: 0,
  shippingFee: 0,
  total: 0,
  count: 0,
};

const CartContext = createContext<CartValue | null>(null);

function readGuest(): GuestLine[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (l): l is GuestLine =>
        !!l &&
        typeof l === "object" &&
        typeof (l as GuestLine).slug === "string" &&
        Number.isFinite((l as GuestLine).qty),
    );
  } catch {
    return [];
  }
}

function writeGuest(lines: GuestLine[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  } catch {
    /* التخزين المحلي معطّل — نكمل بالذاكرة فقط */
  }
}

function summarize(items: CartSummary["items"]): CartSummary {
  const subtotal =
    Math.round(items.reduce((s, i) => s + i.unitPrice * i.qty, 0) * 100) / 100;
  const shippingFee =
    subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  return {
    items,
    subtotal,
    shippingFee,
    total: Math.round((subtotal + shippingFee) * 100) / 100,
    count: items.reduce((n, i) => n + i.qty, 0),
  };
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user, ready: authReady } = useAuth();
  const [cart, setCart] = useState<CartSummary>(EMPTY);
  const [ready, setReady] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // كتالوج مصغّر للمنتجات التي أضافها الزائر، لتسعير سلته دون نداء خادم
  const guestCatalog = useRef(new Map<string, Product>());
  const [guestLines, setGuestLines] = useState<GuestLine[]>([]);

  const priceGuest = useCallback((lines: GuestLine[]) => {
    const items = lines.flatMap((l) => {
      const p = guestCatalog.current.get(l.slug);
      if (!p) return [];
      return [
        {
          productId: p.id,
          slug: p.slug,
          name: p.name,
          nameEn: p.nameEn,
          unitPrice: p.price,
          size: p.size,
          stock: p.stock,
          shape: p.shape,
          tone: p.tone,
          qty: l.qty,
          lineTotal: Math.round(p.price * l.qty * 100) / 100,
        },
      ];
    });
    return summarize(items);
  }, []);

  /** يحمّل تفاصيل منتجات سلة الزائر من الخادم لعرض الأسماء والأسعار. */
  const hydrateGuest = useCallback(
    async (lines: GuestLine[]) => {
      const missing = lines.filter((l) => !guestCatalog.current.has(l.slug));
      await Promise.all(
        missing.map(async (l) => {
          if (DEMO_MODE) {
            const demo = demoProducts.find((p) => p.slug === l.slug);
            if (demo) guestCatalog.current.set(l.slug, demo);
            return;
          }
          try {
            const { product } = await api<{ product: Product }>(
              `/api/products/${encodeURIComponent(l.slug)}`,
              { auth: false },
            );
            guestCatalog.current.set(l.slug, product);
          } catch {
            /* منتج حُذف أو أُرشف — يسقط من السلة تلقائيًا عند التسعير */
          }
        }),
      );
      setCart(priceGuest(lines));
    },
    [priceGuest],
  );

  // عند تغيّر حالة الدخول: ندمج سلة الزائر ثم نعتمد سلة الخادم
  useEffect(() => {
    if (!authReady) return;
    let cancelled = false;

    const sync = async () => {
      const lines = readGuest();
      if (!cancelled) setGuestLines(lines);

      if (user) {
        try {
          if (lines.length > 0) {
            const merged = await api<CartSummary>("/api/cart/merge", {
              method: "POST",
              json: { items: lines },
            });
            writeGuest([]);
            if (!cancelled) {
              setGuestLines([]);
              setCart(merged);
            }
          } else {
            const data = await api<CartSummary>("/api/cart");
            if (!cancelled) setCart(data);
          }
        } catch (err) {
          if (!cancelled) setError(err instanceof Error ? err.message : "تعذّر تحميل السلة");
        }
      } else {
        await hydrateGuest(lines);
      }
      if (!cancelled) setReady(true);
    };

    void sync();
    return () => {
      cancelled = true;
    };
  }, [authReady, user, hydrateGuest]);

  const run = useCallback(async (fn: () => Promise<void>) => {
    setPending(true);
    setError(null);
    try {
      await fn();
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ غير متوقع");
      throw err;
    } finally {
      setPending(false);
    }
  }, []);

  const add = useCallback(
    async (product: Product, qty = 1) => {
      await run(async () => {
        if (user) {
          const data = await api<CartSummary>("/api/cart/items", {
            method: "POST",
            json: { slug: product.slug, qty },
          });
          setCart(data);
          return;
        }
        guestCatalog.current.set(product.slug, product);
        const lines = readGuest();
        const found = lines.find((l) => l.slug === product.slug);
        const next = found
          ? lines.map((l) =>
              l.slug === product.slug
                ? { ...l, qty: Math.min(l.qty + qty, product.stock, 99) }
                : l,
            )
          : [...lines, { slug: product.slug, qty: Math.min(qty, product.stock, 99) }];
        writeGuest(next);
        setGuestLines(next);
        setCart(priceGuest(next));
      });
    },
    [user, run, priceGuest],
  );

  const setQty = useCallback(
    async (slug: string, qty: number) => {
      await run(async () => {
        if (user) {
          const data = await api<CartSummary>(
            `/api/cart/items/${encodeURIComponent(slug)}`,
            { method: "PATCH", json: { qty } },
          );
          setCart(data);
          return;
        }
        const lines = readGuest();
        const next =
          qty <= 0
            ? lines.filter((l) => l.slug !== slug)
            : lines.map((l) => (l.slug === slug ? { ...l, qty } : l));
        writeGuest(next);
        setGuestLines(next);
        setCart(priceGuest(next));
      });
    },
    [user, run, priceGuest],
  );

  const remove = useCallback((slug: string) => setQty(slug, 0), [setQty]);

  const clear = useCallback(async () => {
    await run(async () => {
      if (user) {
        const data = await api<CartSummary>("/api/cart", { method: "DELETE" });
        setCart(data);
        return;
      }
      writeGuest([]);
      setGuestLines([]);
      setCart(EMPTY);
    });
  }, [user, run]);

  const value = useMemo<CartValue>(
    () => ({
      ...cart,
      ready,
      pending,
      error,
      add,
      setQty,
      remove,
      clear,
      guestLines,
    }),
    [cart, ready, pending, error, add, setQty, remove, clear, guestLines],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}

