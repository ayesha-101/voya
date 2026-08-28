import type { Order, PaymentStatus } from "@/lib/types";

const LABELS: Record<PaymentStatus, string> = {
  unpaid: "غير مدفوع",
  processing: "قيد الدفع",
  paid: "مدفوع",
  failed: "فشل الدفع",
  refunded: "مُسترجَع",
};

const STYLES: Record<PaymentStatus, string> = {
  unpaid: "bg-blush-200 text-ink",
  processing: "bg-rose-400/30 text-rose-600",
  paid: "bg-plum-700 text-white",
  failed: "bg-red-100 text-red-700",
  refunded: "bg-blush-300 text-ink",
};

const WALLETS: Record<string, string> = {
  apple_pay: "Apple Pay",
  google_pay: "Google Pay",
  link: "Link",
};

/** يصف كيف دُفع الطلب: أبل باي، جوجل باي، اسم البطاقة، أو عند الاستلام. */
export function paymentLabel(order: Order) {
  if (order.paymentMethod === "cod") return "الدفع عند الاستلام";
  if (order.paymentWallet && WALLETS[order.paymentWallet]) {
    return WALLETS[order.paymentWallet];
  }
  if (order.paymentBrand) {
    return `بطاقة ${order.paymentBrand.toUpperCase()}`;
  }
  return "بطاقة ائتمانية";
}

export function PaymentBadge({ order }: { order: Order }) {
  // الدفع عند الاستلام لا يحمل حالة دفع إلكتروني تُعرض
  if (order.paymentMethod === "cod") {
    return (
      <span className="rounded-full bg-blush-200 px-3 py-1 text-xs font-bold text-ink">
        الدفع عند الاستلام
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={`rounded-full px-3 py-1 text-xs font-bold ${STYLES[order.paymentStatus]}`}
      >
        {LABELS[order.paymentStatus]}
      </span>
      <span className="text-xs text-muted">{paymentLabel(order)}</span>
    </span>
  );
}
