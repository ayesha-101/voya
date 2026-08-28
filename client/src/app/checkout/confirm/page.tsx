import { Suspense } from "react";
import type { Metadata } from "next";
import { PaymentConfirmation } from "@/components/PaymentConfirmation";

export const metadata: Metadata = { title: "تأكيد الدفع" };

export default function ConfirmPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-14">
      <Suspense fallback={<div className="h-72 animate-pulse rounded-card bg-sand-100" />}>
        <PaymentConfirmation />
      </Suspense>
    </div>
  );
}
