import { Suspense } from "react";
import type { Metadata } from "next";
import { AuthForm } from "@/components/AuthForm";

export const metadata: Metadata = { title: "تسجيل الدخول" };

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md px-6 py-14">
      <h1 className="text-3xl font-extrabold text-ink">تسجيل الدخول</h1>
      <span className="mt-3 mb-8 block h-1 w-14 rounded-full bg-rose-500" />
      <Suspense fallback={<div className="h-80 animate-pulse rounded-card bg-blush-100" />}>
        <AuthForm mode="login" />
      </Suspense>
    </div>
  );
}
