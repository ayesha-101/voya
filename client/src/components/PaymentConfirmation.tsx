"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import { site } from "@/data/site";
import type { Order } from "@/lib/types";
import { paymentLabel } from "./PaymentBadge";

/**
 * صفحة العودة بعد التحقّق البنكي (3-D Secure).
 * حالة الطلب الحقيقية تأتي من الخادم بعد أن يستقبل webhook من Stripe،
 * فنستعلم عنها بفواصل متباعدة بدل الاعتماد على معاملات الرابط.
 */
const POLL_DELAYS = [0, 1500, 3000, 5000, 8000];

export function PaymentConfirmation() {
  const params = useSearchParams();
  const reference = params.get("order");
  const email = params.get("email");

  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const poll = async () => {
      if (!reference) {
        setError("رابط غير مكتمل — رقم الطلب مفقود");
        setSettled(true);
        return;
      }

      for (const delay of POLL_DELAYS) {
        if (cancelled) return;
        if (delay) await new Promise((r) => setTimeout(r, delay));

        try {
          const path = `/api/orders/${encodeURIComponent(reference)}${
            email ? `?email=${encodeURIComponent(email)}` : ""
          }`;
          const { order } = await api<{ order: Order }>(path);
          if (cancelled) return;
          setOrder(order);
          // نتوقّف فور استقرار حالة الدفع
          if (order.paymentStatus !== "processing") {
            setSettled(true);
            return;
          }
        } catch (err) {
          if (cancelled) return;
          setError(err instanceof Error ? err.message : "تعذّر جلب حالة الطلب");
          setSettled(true);
          return;
        }
      }
      if (!cancelled) setSettled(true);
    };

    void poll();
    return () => {
      cancelled = true;
    };
  }, [reference, email]);

  if (error) {
    return (
      <Panel tone="warn" icon="!" title="تعذّر عرض حالة الطلب">
        <p>{error}</p>
        <p className="mt-2 text-sm">
          إن خُصم المبلغ من بطاقتك تواصل معنا على{" "}
          <a href={`mailto:${site.email}`} className="font-bold text-sea-700 hover:underline">
            {site.email}
          </a>{" "}
          مع رقم الطلب.
        </p>
      </Panel>
    );
  }

  if (!order || (!settled && order.paymentStatus === "processing")) {
    return (
      <Panel tone="info" icon="…" title="جارٍ تأكيد الدفع">
        <p>لا تُغلق هذه الصفحة — نتحقّق من بنكك الآن.</p>
      </Panel>
    );
  }

  if (order.paymentStatus === "paid") {
    return (
      <Panel tone="ok" icon="✓" title="تم الدفع بنجاح">
        <p className="nums text-sm text-muted">رقم الطلب: {order.reference}</p>
        <p className="nums mt-1 text-xl font-extrabold text-sea-700">
          {formatPrice(order.total)}
        </p>
        <p className="mt-1 text-xs text-muted">{paymentLabel(order)}</p>
        <p className="mx-auto mt-4 max-w-md text-sm leading-7">
          التوصيل المتوقع خلال 24 – 48 ساعة داخل {site.country}.
        </p>
        <Actions />
      </Panel>
    );
  }

  if (order.paymentStatus === "failed") {
    return (
      <Panel tone="warn" icon="✕" title="لم تكتمل عملية الدفع">
        <p>لم يُخصم أي مبلغ من بطاقتك. يمكنك المحاولة مجددًا.</p>
        <Actions retry />
      </Panel>
    );
  }

  return (
    <Panel tone="info" icon="…" title="الدفع قيد المعالجة">
      <p className="nums text-sm text-muted">رقم الطلب: {order.reference}</p>
      <p className="mx-auto mt-3 max-w-md text-sm leading-7">
        بنكك لم يُنهِ العملية بعد. سنؤكّد الطلب فور اكتمالها ونرسل لك رسالة.
      </p>
      <Actions />
    </Panel>
  );
}

function Actions({ retry = false }: { retry?: boolean }) {
  return (
    <div className="mt-7 flex flex-wrap justify-center gap-3">
      <Link
        href={retry ? "/checkout" : "/products"}
        className="rounded-full bg-sea-700 px-8 py-3.5 font-bold text-white transition hover:bg-sea-800"
      >
        {retry ? "المحاولة مجددًا" : "متابعة التسوّق"}
      </Link>
      <Link
        href="/account"
        className="rounded-full border border-sand-300 px-8 py-3.5 font-bold text-sea-700 transition hover:bg-sand-50"
      >
        طلباتي
      </Link>
    </div>
  );
}

const TONES = {
  ok: "border-sea-200 bg-sea-50 text-ink",
  info: "border-sand-200 bg-sand-50 text-ink",
  warn: "border-red-200 bg-red-50 text-red-800",
} as const;

const ICONS = {
  ok: "bg-sea-700 text-white",
  info: "bg-sand-300 text-ink",
  warn: "bg-red-600 text-white",
} as const;

function Panel({
  tone,
  icon,
  title,
  children,
}: {
  tone: keyof typeof TONES;
  icon: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`rounded-card border p-10 text-center ${TONES[tone]}`}>
      <span
        className={`mx-auto grid h-16 w-16 place-items-center rounded-full text-3xl ${ICONS[tone]}`}
      >
        {icon}
      </span>
      <h1 className="mt-5 text-2xl font-extrabold text-ink">{title}</h1>
      <div className="mt-2">{children}</div>
    </div>
  );
}
