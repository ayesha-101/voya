"use client";

import {
  Elements,
  ExpressCheckoutElement,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe, type Appearance, type Stripe } from "@stripe/stripe-js";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Order } from "@/lib/types";
import { formatPrice } from "@/lib/format";

/**
 * مظهر عناصر Stripe مطابق لهوية المتجر (أخضر بحري + خط Tajawal).
 */
const appearance: Appearance = {
  theme: "flat",
  variables: {
    colorPrimary: "#87355b",
    colorBackground: "#ffffff",
    colorText: "#2c1720",
    colorDanger: "#dc2626",
    fontFamily: "var(--font-tajawal), system-ui, sans-serif",
    borderRadius: "12px",
    spacingUnit: "4px",
  },
  rules: {
    ".Input": { border: "1px solid #f6e0dd", boxShadow: "none", padding: "12px" },
    ".Input:focus": { border: "1px solid #d67ea6", boxShadow: "none" },
    ".Label": { fontWeight: "700", fontSize: "13px", marginBottom: "6px" },
  },
};

// عميل Stripe واحد لكل مفتاح — تحميله متكرّرًا يبطئ الصفحة بلا داعٍ.
// نبتلع الرفض هنا ونتعامل مع الفشل كـ null، فمانع الإعلانات لا يُسقط الصفحة.
const clients = new Map<string, Promise<Stripe | null>>();
function stripeClient(publishableKey: string) {
  let client = clients.get(publishableKey);
  if (!client) {
    client = loadStripe(publishableKey, { locale: "ar" }).catch(() => null);
    clients.set(publishableKey, client);
  }
  return client;
}

export type PaymentResult =
  | { status: "succeeded"; order: Order }
  | { status: "processing"; order: Order };

type Props = {
  publishableKey: string;
  amount: number;
  /** يُنشئ الطلب على الخادم ويعيد سرّ نيّة الدفع. */
  createOrder: () => Promise<{ order: Order; clientSecret: string }>;
  /** يتحقّق من صحة نموذج التوصيل قبل فتح أي واجهة دفع. */
  validateForm: () => boolean;
  onSuccess: (result: PaymentResult) => void;
  onCancelled: (order: Order) => void;
};

export function StripePayment(props: Props) {
  const [scriptFailed, setScriptFailed] = useState(false);

  // سكربت Stripe يُحجب أحيانًا بمانع إعلانات أو شبكة مقيّدة —
  // نُخبر العميل بوضوح بدل أن يرى نموذج دفع فارغًا.
  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      const loaded = await stripeClient(props.publishableKey);
      if (!cancelled) setScriptFailed(loaded === null);
    };
    void check();
    return () => {
      cancelled = true;
    };
  }, [props.publishableKey]);

  const options = useMemo(
    () => ({
      mode: "payment" as const,
      // Stripe يتعامل مع الدرهم بالفلوس
      amount: Math.round(props.amount * 100),
      currency: "aed",
      appearance,
      paymentMethodCreation: "manual" as const,
    }),
    [props.amount],
  );

  if (scriptFailed) {
    return (
      <div className="space-y-3 rounded-xl bg-red-50 p-4 text-sm leading-6 text-red-800">
        <p className="font-bold">تعذّر تحميل نافذة الدفع</p>
        <p>
          قد يكون السبب مانع إعلانات أو اتصالًا مقيّدًا يحجب
          <code className="mx-1 rounded bg-white px-1.5 py-0.5" dir="ltr">js.stripe.com</code>.
          عطّل المانع وأعد تحميل الصفحة، أو اختر الدفع عند الاستلام.
        </p>
      </div>
    );
  }

  return (
    <Elements stripe={stripeClient(props.publishableKey)} options={options}>
      <PaymentInner {...props} />
    </Elements>
  );
}

function PaymentInner({
  amount,
  createOrder,
  validateForm,
  onSuccess,
  onCancelled,
}: Props) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [walletsReady, setWalletsReady] = useState(false);
  // نتجنّب إنشاء طلبين لو ضغط العميل مرتين بسرعة
  const inFlight = useRef(false);

  async function pay() {
    if (!stripe || !elements || inFlight.current) return;

    if (!validateForm()) {
      setError("أكمل بيانات التوصيل أولًا");
      return;
    }

    inFlight.current = true;
    setBusy(true);
    setError(null);

    let placed: { order: Order; clientSecret: string } | null = null;

    try {
      // 1) تحقّق Stripe من صحة بيانات البطاقة قبل إنشاء أي طلب
      const submitted = await elements.submit();
      if (submitted.error) {
        setError(submitted.error.message ?? "تحقّق من بيانات البطاقة");
        return;
      }

      // 2) الخادم ينشئ الطلب ويحجز المخزون ويعيد سرّ نيّة الدفع
      placed = await createOrder();

      // 3) تأكيد الدفع — قد يتطلّب تحويلًا لبنك العميل (3-D Secure)
      const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret: placed.clientSecret,
        confirmParams: {
          return_url:
            `${window.location.origin}/checkout/confirm` +
            `?order=${encodeURIComponent(placed.order.reference)}` +
            `&email=${encodeURIComponent(placed.order.customer.email)}`,
        },
        redirect: "if_required",
      });

      if (confirmError) {
        setError(confirmError.message ?? "تعذّرت عملية الدفع");
        // الخادم يُلغي الطلب ويعيد المخزون عبر webhook من Stripe
        onCancelled(placed.order);
        return;
      }

      onSuccess({
        status: paymentIntent?.status === "succeeded" ? "succeeded" : "processing",
        order: placed.order,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذّر إتمام الدفع");
      if (placed) onCancelled(placed.order);
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      {/* أزرار المحافظ — تظهر فقط على الأجهزة التي تدعمها */}
      <div className={walletsReady ? "space-y-3" : "hidden"}>
        <ExpressCheckoutElement
          options={{
            buttonHeight: 48,
            buttonTheme: { applePay: "black", googlePay: "black" },
            layout: { maxColumns: 2, maxRows: 1 },
          }}
          onReady={({ availablePaymentMethods }) =>
            setWalletsReady(Boolean(availablePaymentMethods))
          }
          onConfirm={pay}
        />
        <div className="flex items-center gap-3 text-xs text-muted">
          <span className="h-px flex-1 bg-blush-200" />
          أو ادفع بالبطاقة
          <span className="h-px flex-1 bg-blush-200" />
        </div>
      </div>

      <PaymentElement
        options={{
          layout: "tabs",
          // المحافظ معروضة أعلاه، فلا نكرّرها داخل عنصر البطاقة
          wallets: { applePay: "never", googlePay: "never" },
          fields: { billingDetails: { address: { country: "never" } } },
        }}
      />

      {error && (
        <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={pay}
        disabled={busy || !stripe}
        className="w-full rounded-full bg-plum-700 px-6 py-4 font-bold text-white transition hover:bg-plum-800 active:scale-[0.99] disabled:opacity-60"
      >
        {busy ? "جارٍ معالجة الدفع…" : `ادفع ${formatPrice(amount)}`}
      </button>

      <p className="text-center text-[11px] leading-5 text-muted">
        الدفع مُشفّر ومعالَج عبر Stripe. لا نحفظ بيانات بطاقتك على خوادمنا.
      </p>
    </div>
  );
}
