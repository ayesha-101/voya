import type { Metadata } from "next";
import { CheckoutForm } from "@/components/CheckoutForm";

export const metadata: Metadata = { title: "إتمام الطلب" };

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="text-3xl font-extrabold text-ink">إتمام الطلب</h1>
      <span className="mt-3 mb-8 block h-1 w-14 rounded-full bg-rose-500" />
      <CheckoutForm />
    </div>
  );
}
