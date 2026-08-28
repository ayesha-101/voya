"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { formatDateTime, formatPrice } from "@/lib/format";
import type { Order, OrderStatus } from "@/lib/types";
import { OrderStatusBadge, STATUS_LABELS } from "../OrderStatusBadge";
import { PaymentBadge } from "../PaymentBadge";

const FILTERS: { value: "" | OrderStatus; label: string }[] = [
  { value: "", label: "الكل" },
  ...(Object.entries(STATUS_LABELS) as [OrderStatus, string][]).map(([value, label]) => ({
    value,
    label,
  })),
];

export function AdminOrders() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [filter, setFilter] = useState<"" | OrderStatus>("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  // زيادة العدّاد تُعيد التحميل بعد تغيير حالة أي طلب
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const { orders } = await api<{ orders: Order[] }>(
          `/api/admin/orders${filter ? `?status=${filter}` : ""}`,
        );
        if (!cancelled) setOrders(orders);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "تعذّر تحميل الطلبات");
        }
      }
    };
    void load();

    return () => {
      cancelled = true;
    };
  }, [filter, reloadKey]);

  async function changeStatus(reference: string, status: OrderStatus) {
    setBusy(reference);
    setError(null);
    try {
      await api(`/api/admin/orders/${encodeURIComponent(reference)}/status`, {
        method: "PATCH",
        json: { status },
      });
      setReloadKey((n) => n + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذّر تحديث الحالة");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <button
            key={f.value || "all"}
            type="button"
            onClick={() => setFilter(f.value)}
            className={`shrink-0 rounded-full border px-4 py-2 text-[13px] font-bold transition ${
              filter === f.value
                ? "border-plum-700 bg-plum-700 text-white"
                : "border-blush-300 bg-white text-ink hover:border-plum-400"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error && (
        <p className="rounded-card bg-red-50 p-4 text-sm font-bold text-red-700">{error}</p>
      )}

      {orders === null ? (
        <div className="h-96 animate-pulse rounded-card bg-blush-100" />
      ) : orders.length === 0 ? (
        <div className="rounded-card border border-dashed border-blush-300 bg-blush-50 py-16 text-center">
          <p className="font-bold text-ink">لا توجد طلبات بهذه الحالة</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {orders.map((o) => (
            <li key={o.reference} className="rounded-card border border-blush-200 bg-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="nums font-extrabold text-ink">{o.reference}</p>
                  <p className="nums text-xs text-muted">
                    {formatDateTime(o.createdAt)}
                  </p>
                </div>

                <div className="text-sm">
                  <p className="font-bold text-ink">{o.customer.name}</p>
                  <p className="nums text-xs text-muted" dir="ltr">{o.customer.phone}</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <OrderStatusBadge status={o.status} />
                  <PaymentBadge order={o} />
                </div>

                <span className="nums text-lg font-extrabold text-plum-700">
                  {formatPrice(o.total)}
                </span>

                <select
                  value={o.status}
                  disabled={busy === o.reference}
                  onChange={(e) => void changeStatus(o.reference, e.target.value as OrderStatus)}
                  aria-label={`تغيير حالة الطلب ${o.reference}`}
                  className="rounded-full border border-blush-300 bg-white px-3 py-2 text-[13px] font-bold outline-none focus:border-plum-400 disabled:opacity-50"
                >
                  {(Object.entries(STATUS_LABELS) as [OrderStatus, string][]).map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => setExpanded(expanded === o.reference ? null : o.reference)}
                  className="rounded-full border border-blush-300 px-4 py-2 text-[13px] font-bold text-plum-700 transition hover:border-plum-400"
                >
                  {expanded === o.reference ? "إخفاء" : "التفاصيل"}
                </button>
              </div>

              {expanded === o.reference && (
                <div className="mt-4 grid gap-4 border-t border-blush-100 pt-4 sm:grid-cols-2">
                  <div>
                    <h3 className="mb-2 text-sm font-bold text-ink">المنتجات</h3>
                    <ul className="space-y-1.5 text-sm">
                      {o.items.map((i) => (
                        <li key={i.slug} className="flex justify-between gap-3">
                          <span className="text-ink">{i.name}</span>
                          <span className="nums text-muted">×{i.qty}</span>
                          <span className="nums font-bold">{formatPrice(i.lineTotal)}</span>
                        </li>
                      ))}
                    </ul>
                    <dl className="mt-3 space-y-1 border-t border-blush-100 pt-3 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-muted">المجموع الفرعي</dt>
                        <dd className="nums">{formatPrice(o.subtotal)}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-muted">الشحن</dt>
                        <dd className="nums">
                          {o.shippingFee === 0 ? "مجاني" : formatPrice(o.shippingFee)}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <div className="text-sm">
                    <h3 className="mb-2 font-bold text-ink">التوصيل</h3>
                    <p className="text-muted">
                      {o.shipping.emirate} — {o.shipping.area}
                    </p>
                    <p className="mt-1 text-muted">{o.shipping.address}</p>
                    {o.shipping.notes && (
                      <p className="mt-2 rounded-xl bg-blush-50 p-2.5 text-xs text-ink">
                        ملاحظات: {o.shipping.notes}
                      </p>
                    )}
                    <p className="mt-3 text-xs text-muted" dir="ltr">{o.customer.email}</p>
                    <div className="mt-3">
                      <PaymentBadge order={o} />
                    </div>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
