/**
 * المفضّلة — مخزن خارج React ومتزامن مع localStorage.
 * useSyncExternalStore يبقي عرض الخادم فارغًا ثم يقرأ المحفوظ بعد الترطيب.
 */
const STORAGE_KEY = "voya:wishlist:v1";
const EMPTY: readonly string[] = [];

let slugs: readonly string[] = EMPTY;
let hydrated = false;
const listeners = new Set<() => void>();

function read(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((s) => typeof s === "string") : [];
  } catch {
    return [];
  }
}

function commit(next: readonly string[], persist = true) {
  slugs = next;
  if (persist) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* التخزين المحلي معطّل — نكمل بالذاكرة */
    }
  }
  for (const listener of listeners) listener();
}

export function subscribeWishlist(listener: () => void) {
  listeners.add(listener);
  if (!hydrated) {
    hydrated = true;
    commit(read(), false);
  }
  return () => {
    listeners.delete(listener);
  };
}

export const getWishlistSnapshot = () => slugs;
export const getWishlistServerSnapshot = () => EMPTY;

export function toggleWishlist(slug: string) {
  commit(slugs.includes(slug) ? slugs.filter((s) => s !== slug) : [...slugs, slug]);
}

export function clearWishlist() {
  commit([]);
}

if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === STORAGE_KEY) commit(read(), false);
  });
}
