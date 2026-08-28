/**
 * مخزن السلة — خارج React ومتزامن مع localStorage.
 * نستخدم useSyncExternalStore حتى تبقى نتيجة العرض على الخادم فارغة
 * ثم تُملأ من التخزين المحلي بعد الترطيب (hydration) دون تعارض.
 */
export type CartLine = { slug: string; qty: number };
export type CartState = { lines: CartLine[]; ready: boolean };

const STORAGE_KEY = "voya:cart:v1";
const EMPTY: CartState = { lines: [], ready: false };

let state: CartState = EMPTY;
const listeners = new Set<() => void>();

function read(): CartLine[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (l): l is CartLine =>
        !!l &&
        typeof l === "object" &&
        typeof (l as CartLine).slug === "string" &&
        Number.isFinite((l as CartLine).qty) &&
        (l as CartLine).qty > 0,
    );
  } catch {
    // التخزين المحلي قد يكون معطّلًا (تصفّح خاص) — نتعامل معه كسلة فارغة
    return [];
  }
}

function write(lines: CartLine[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  } catch {
    /* ignore */
  }
}

function commit(lines: CartLine[], persist = true) {
  state = { lines, ready: true };
  if (persist) write(lines);
  for (const listener of listeners) listener();
}

export function subscribeCart(listener: () => void) {
  listeners.add(listener);
  if (!state.ready) commit(read(), false);
  return () => {
    listeners.delete(listener);
  };
}

export const getCartSnapshot = () => state;
export const getCartServerSnapshot = () => EMPTY;

export function addLine(slug: string, qty = 1) {
  const found = state.lines.find((l) => l.slug === slug);
  commit(
    found
      ? state.lines.map((l) =>
          l.slug === slug ? { ...l, qty: Math.min(l.qty + qty, 99) } : l,
        )
      : [...state.lines, { slug, qty: Math.min(qty, 99) }],
  );
}

export function setLineQty(slug: string, qty: number) {
  commit(
    qty <= 0
      ? state.lines.filter((l) => l.slug !== slug)
      : state.lines.map((l) => (l.slug === slug ? { ...l, qty: Math.min(qty, 99) } : l)),
  );
}

export function removeLine(slug: string) {
  commit(state.lines.filter((l) => l.slug !== slug));
}

export function clearCart() {
  commit([]);
}

// مزامنة بين تبويبات المتصفح المفتوحة
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === STORAGE_KEY) commit(read(), false);
  });
}
