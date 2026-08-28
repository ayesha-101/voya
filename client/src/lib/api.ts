/** عميل الواجهة البرمجية — كل نداءات الخادم تمر من هنا. */

/**
 * حين لا يُضبط NEXT_PUBLIC_API_URL يعمل المتجر في «وضع العرض»:
 * كتالوج مضمّن، بلا خادم ولا قاعدة بيانات. ضبط الرابط يُطفئه فورًا.
 */
export const DEMO_MODE = !process.env.NEXT_PUBLIC_API_URL;

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export class ApiError extends Error {
  status: number;
  details?: { field: string; message: string }[];

  constructor(status: number, message: string, details?: ApiError["details"]) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

const TOKEN_KEY = "voya:token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* التخزين المحلي قد يكون معطّلًا */
  }
}

export async function api<T>(
  path: string,
  options: RequestInit & { json?: unknown; auth?: boolean } = {},
): Promise<T> {
  const { json, auth = true, headers, ...rest } = options;
  const token = auth ? getToken() : null;

  const res = await fetch(`${API_URL}${path}`, {
    ...rest,
    credentials: "include",
    headers: {
      ...(json !== undefined ? { "content-type": "application/json" } : {}),
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    ...(json !== undefined ? { body: JSON.stringify(json) } : {}),
  });

  if (res.status === 204) return undefined as T;

  const body = await res.json().catch(() => null);

  if (!res.ok) {
    throw new ApiError(
      res.status,
      body?.error ?? `فشل الطلب (${res.status})`,
      body?.details,
    );
  }
  return body as T;
}

/**
 * يطلب من خادم Next إبطال كاش صفحات المنتجات بعد تعديل من اللوحة.
 * الفشل هنا لا يُفشل الحفظ — الكاش سينتهي تلقائيًا خلال دقيقة.
 */
export async function revalidateStore() {
  const token = getToken();
  if (!token) return;
  try {
    await fetch("/api/revalidate", {
      method: "POST",
      headers: { authorization: `Bearer ${token}` },
    });
  } catch {
    /* تجاهل — إعادة التحقق الزمنية ستتكفّل بالأمر */
  }
}
