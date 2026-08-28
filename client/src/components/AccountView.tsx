"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { formatDateTime, formatPrice } from "@/lib/format";
import type { Order } from "@/lib/types";
import { useAuth } from "./AuthProvider";
import { LogoutIcon, PackageIcon } from "./Icons";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { PaymentBadge } from "./PaymentBadge";

export function AccountView() {
  const { user, ready, logout } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[] | null>(null);
  // نمنع إعادة التوجيه لصفحة الدخول أثناء تسجيل الخروج المتعمّد
  const [leaving, setLeaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ready || leaving) return;
    if (!user) {
      router.replace("/login?next=/account");
      return;
    }

    let cancelled = false;
    const load = async () => {
      try {
        const { orders } = await api<{ orders: Order[] }>("/api/orders");
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
  }, [ready, user, router, leaving]);

  if (!ready || !user) {
    return <div className="h-64 animate-pulse rounded-card bg-blush-100" />;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-card border border-blush-200 bg-blush-50 p-6">
        <div>
          <p className="text-lg font-extrabold text-ink">{user.name}</p>
          <p className="text-sm text-muted" dir="ltr">{user.email}</p>
          {user.phone && <p className="nums text-sm text-muted">{user.phone}</p>}
        </div>
        <div className="flex gap-2">
          {user.role === "admin" && (
            <Link
              href="/admin"
              className="rounded-full bg-plum-700 px-6 py-3 text-sm font-bold text-white transition hover:bg-plum-800"
            >
              لوحة التحكّم
            </Link>
          )}
          <button
            type="button"
            onClick={async () => {
              setLeaving(true);
              await logout();
              router.replace("/");
              router.refresh();
            }}
            className="flex items-center gap-2 rounded-full border border-blush-300 px-6 py-3 text-sm font-bold text-ink transition hover:border-red-300 hover:text-red-600"
          >
            <LogoutIcon className="h-4 w-4" />
            تسجيل الخروج
          </button>
        </div>
      </div>

      <section>
        <h2 className="mb-4 text-xl font-extrabold text-ink">طلباتي</h2>

        {error && (
          <p className="rounded-card bg-red-50 p-4 text-sm font-bold text-red-700">{error}</p>
        )}

        {orders === null && !error && (
          <div className="h-40 animate-pulse rounded-card bg-blush-100" />
        )}

        {orders?.length === 0 && (
          <div className="rounded-card border border-dashed border-blush-300 bg-blush-50 py-16 text-center">
            <PackageIcon className="mx-auto h-10 w-10 text-blush-400" />
            <p className="mt-3 font-bold text-ink">لا توجد طلبات بعد</p>
            <Link
              href="/products"
              className="mt-5 inline-block rounded-full bg-plum-700 px-8 py-3.5 font-bold text-white transition hover:bg-plum-800"
            >
              ابدأ التسوّق
            </Link>
          </div>
        )}

        <ul className="space-y-4">
          {orders?.map((o) => (
            <li key={o.reference} className="rounded-card border border-blush-200 bg-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-blush-100 pb-3">
                <div>
                  <p className="nums font-extrabold text-ink">{o.reference}</p>
                  <p className="nums text-xs text-muted">{formatDateTime(o.createdAt)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <OrderStatusBadge status={o.status} />
                  <span className="nums text-lg font-extrabold text-plum-700">
                    {formatPrice(o.total)}
                  </span>
                </div>
              </div>

              <ul className="mt-3 space-y-1.5 text-sm">
                {o.items.map((i) => (
                  <li key={i.slug} className="flex justify-between gap-3">
                    <span className="text-ink">{i.name}</span>
                    <span className="nums text-muted">×{i.qty}</span>
                    <span className="nums font-bold">{formatPrice(i.lineTotal)}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs text-muted">
                  التوصيل إلى: {o.shipping.emirate} — {o.shipping.area}
                </p>
                <PaymentBadge order={o} />
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
