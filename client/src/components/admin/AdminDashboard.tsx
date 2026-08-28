"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { formatDate, formatPrice } from "@/lib/format";
import type { AdminStats } from "@/lib/types";
import { OrderStatusBadge, STATUS_LABELS } from "../OrderStatusBadge";

export function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setStats(await api<AdminStats>("/api/admin/stats"));
      } catch (err) {
        setError(err instanceof Error ? err.message : "تعذّر تحميل الإحصاءات");
      }
    };
    void load();
  }, []);

  if (error) {
    return <p className="rounded-card bg-red-50 p-4 font-bold text-red-700">{error}</p>;
  }
  if (!stats) {
    return <div className="h-96 animate-pulse rounded-card bg-blush-100" />;
  }

  const cards = [
    { label: "إجمالي المبيعات المحصّلة", value: formatPrice(stats.totals.revenue), accent: true },
    { label: "الطلبات", value: String(stats.totals.orders) },
    { label: "بانتظار الدفع", value: String(stats.totals.awaiting_payment ?? 0) },
    { label: "المنتجات النشطة", value: String(stats.totals.products) },
    { label: "العملاء", value: String(stats.totals.customers) },
  ];

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map((c) => (
          <div
            key={c.label}
            className={`rounded-card border p-6 ${
              c.accent ? "border-plum-700 bg-plum-800 text-white" : "border-blush-200 bg-white"
            }`}
          >
            <p className={`text-xs ${c.accent ? "text-blush-200" : "text-muted"}`}>{c.label}</p>
            <p
              className={`nums mt-2 text-2xl font-extrabold ${
                c.accent ? "text-rose-400" : "text-plum-700"
              }`}
            >
              {c.value}
            </p>
          </div>
        ))}
      </div>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-card border border-blush-200 p-6">
          <h2 className="mb-4 font-extrabold text-ink">الطلبات حسب الحالة</h2>
          <ul className="space-y-2.5 text-sm">
            {Object.entries(STATUS_LABELS).map(([status, label]) => (
              <li key={status} className="flex items-center justify-between">
                <span className="text-muted">{label}</span>
                <span className="nums font-extrabold text-ink">
                  {stats.byStatus[status as keyof typeof stats.byStatus] ?? 0}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-card border border-blush-200 p-6">
          <h2 className="mb-4 font-extrabold text-ink">مخزون منخفض</h2>
          {stats.lowStock.length === 0 ? (
            <p className="text-sm text-muted">لا توجد منتجات قاربت على النفاد.</p>
          ) : (
            <ul className="space-y-2.5 text-sm">
              {stats.lowStock.map((p) => (
                <li key={p.slug} className="flex items-center justify-between gap-3">
                  <span className="text-ink">{p.name}</span>
                  <span
                    className={`nums rounded-full px-2.5 py-1 text-xs font-bold ${
                      p.stock === 0 ? "bg-red-100 text-red-700" : "bg-rose-400/25 text-rose-600"
                    }`}
                  >
                    {p.stock}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="rounded-card border border-blush-200 p-6">
        <h2 className="mb-4 font-extrabold text-ink">أحدث الطلبات</h2>
        {stats.recentOrders.length === 0 ? (
          <p className="text-sm text-muted">لا توجد طلبات بعد.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead className="border-b border-blush-200 text-xs text-muted">
                <tr>
                  <th className="p-2 text-start font-bold">المرجع</th>
                  <th className="p-2 text-start font-bold">العميل</th>
                  <th className="p-2 text-start font-bold">التاريخ</th>
                  <th className="p-2 text-start font-bold">الحالة</th>
                  <th className="p-2 text-start font-bold">الإجمالي</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map((o) => (
                  <tr key={o.reference} className="border-b border-blush-100 last:border-0">
                    <td className="nums p-2 font-bold">{o.reference}</td>
                    <td className="p-2">{o.customer.name}</td>
                    <td className="nums p-2 text-muted">{formatDate(o.createdAt)}</td>
                    <td className="p-2"><OrderStatusBadge status={o.status} /></td>
                    <td className="nums p-2 font-bold">{formatPrice(o.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
