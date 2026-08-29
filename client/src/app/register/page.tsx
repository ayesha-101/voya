import { Suspense } from "react";
import type { Metadata } from "next";
import { AuthForm } from "@/components/AuthForm";

export const metadata: Metadata = { title: "إنشاء حساب" };

export default function RegisterPage() {
  return (
    <div className="mx-auto max-w-md px-6 py-14">
      <h1 className="text-3xl font-extrabold text-ink">إنشاء حساب</h1>
      <p className="mt-2 text-sm text-muted">
        احفظ عناوينك وتابع طلباتك في أي وقت.
      </p>
      <span className="mt-3 mb-8 block h-1 w-14 rounded-full bg-gold-500" />
      <Suspense fallback={<div className="h-96 animate-pulse rounded-card bg-blush-100" />}>
        <AuthForm mode="register" />
      </Suspense>
    </div>
  );
}
