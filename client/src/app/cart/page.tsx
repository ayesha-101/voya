import type { Metadata } from "next";
import { CartView } from "@/components/CartView";

export const metadata: Metadata = { title: "سلة التسوّق" };

export default function CartPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="text-3xl font-extrabold text-ink">سلة التسوّق</h1>
      <span className="mt-3 mb-8 block h-1 w-14 rounded-full bg-gold-500" />
      <CartView />
    </div>
  );
}
