import type { OrderStatus } from "@/lib/types";

export const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "قيد المراجعة",
  confirmed: "مؤكّد",
  shipped: "تم الشحن",
  delivered: "تم التسليم",
  cancelled: "ملغى",
};

const STYLES: Record<OrderStatus, string> = {
  pending: "bg-blush-200 text-ink",
  confirmed: "bg-plum-100 text-plum-800",
  shipped: "bg-rose-400/30 text-rose-600",
  delivered: "bg-plum-700 text-white",
  cancelled: "bg-red-100 text-red-700",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-bold ${STYLES[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}
