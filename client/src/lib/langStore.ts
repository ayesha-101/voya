/**
 * مخزن اللغة خارج React ومتزامن مع localStorage.
 * useSyncExternalStore يجعل العرض على الخادم عربيًا دائمًا ثم يقرأ
 * الاختيار المحفوظ بعد الترطيب، فلا يحدث تعارض بين الخادم والعميل.
 */
export type Lang = "ar" | "en";

const STORAGE_KEY = "voya:lang";
const DEFAULT: Lang = "ar";

let current: Lang = DEFAULT;
let hydrated = false;
const listeners = new Set<() => void>();

function read(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === "ar" || saved === "en" ? saved : DEFAULT;
  } catch {
    // التخزين المحلي معطّل (تصفّح خاص) — نبقى على الافتراضي
    return DEFAULT;
  }
}

function emit() {
  for (const listener of listeners) listener();
}

export function subscribeLang(listener: () => void) {
  listeners.add(listener);
  if (!hydrated) {
    hydrated = true;
    current = read();
    emit();
  }
  return () => {
    listeners.delete(listener);
  };
}

export const getLangSnapshot = () => current;
export const getLangServerSnapshot = (): Lang => DEFAULT;

export function setLang(next: Lang) {
  if (next === current) return;
  current = next;
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {
    /* ignore */
  }
  emit();
}

// مزامنة بين تبويبات المتصفح المفتوحة
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key !== STORAGE_KEY) return;
    current = read();
    emit();
  });
}
