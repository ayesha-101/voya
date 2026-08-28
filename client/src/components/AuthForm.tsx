"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { ApiError } from "@/lib/api";
import { useAuth } from "./AuthProvider";

const field =
  "w-full rounded-xl border border-sand-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-sea-400";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const { login, register } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  const next = params.get("next") ?? "/";

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setFieldErrors({});

    const data = new FormData(e.currentTarget);
    const email = String(data.get("email") ?? "");
    const password = String(data.get("password") ?? "");

    try {
      const user =
        mode === "login"
          ? await login(email, password)
          : await register({
              name: String(data.get("name") ?? ""),
              email,
              phone: String(data.get("phone") ?? "") || undefined,
              password,
            });

      router.push(user.role === "admin" && next === "/" ? "/admin" : next);
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        if (err.details) {
          setFieldErrors(Object.fromEntries(err.details.map((d) => [d.field, d.message])));
        }
      } else {
        setError("تعذّر الاتصال بالخادم. تأكّد من تشغيل الواجهة البرمجية.");
      }
    } finally {
      setBusy(false);
    }
  }

  const err = (name: string) =>
    fieldErrors[name] ? (
      <span className="block text-xs font-bold text-red-600">{fieldErrors[name]}</span>
    ) : null;

  return (
    <form onSubmit={submit} className="space-y-4 rounded-card border border-sand-200 p-6">
      {error && (
        <p className="rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700">{error}</p>
      )}

      {mode === "register" && (
        <>
          <label className="block space-y-1.5">
            <span className="text-[13px] font-bold text-ink">الاسم الكامل</span>
            <input name="name" required minLength={2} autoComplete="name" className={field} />
            {err("name")}
          </label>
          <label className="block space-y-1.5">
            <span className="text-[13px] font-bold text-ink">رقم الجوال (اختياري)</span>
            <input
              name="phone"
              type="tel"
              dir="ltr"
              placeholder="+971 5X XXX XXXX"
              autoComplete="tel"
              className={`${field} text-start`}
            />
            {err("phone")}
          </label>
        </>
      )}

      <label className="block space-y-1.5">
        <span className="text-[13px] font-bold text-ink">البريد الإلكتروني</span>
        <input
          name="email"
          type="email"
          required
          dir="ltr"
          autoComplete="email"
          className={`${field} text-start`}
        />
        {err("email")}
      </label>

      <label className="block space-y-1.5">
        <span className="text-[13px] font-bold text-ink">كلمة المرور</span>
        <input
          name="password"
          type="password"
          required
          dir="ltr"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          className={`${field} text-start`}
        />
        {err("password")}
        {mode === "register" && (
          <span className="block text-[11px] text-muted">
            8 أحرف على الأقل، وتحتوي على حرف كبير وحرف صغير ورقم.
          </span>
        )}
      </label>

      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-full bg-sea-700 px-6 py-3.5 font-bold text-white transition hover:bg-sea-800 disabled:opacity-60"
      >
        {busy ? "جارٍ…" : mode === "login" ? "تسجيل الدخول" : "إنشاء الحساب"}
      </button>

      <p className="text-center text-sm text-muted">
        {mode === "login" ? (
          <>
            ليس لديك حساب؟{" "}
            <Link href="/register" className="font-bold text-sea-700 hover:underline">
              أنشئ حسابًا
            </Link>
          </>
        ) : (
          <>
            لديك حساب بالفعل؟{" "}
            <Link href="/login" className="font-bold text-sea-700 hover:underline">
              سجّل الدخول
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
