"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Flower2, Lock } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import type { Order } from "@/lib/types";
import { useAuth } from "@/components/AuthProvider";
import { useCart } from "@/components/CartProvider";
import { toTemplateItem } from "@/components/cartAdapter";
import { StripePayment, type PaymentResult } from "@/components/StripePayment";
import Stepper from "@/components/checkout/Stepper";
import ShippingStep from "@/components/checkout/ShippingStep";
import PaymentStep, { type PaymentMethod } from "@/components/checkout/PaymentStep";
import ReviewStep from "@/components/checkout/ReviewStep";
import CheckoutSummary from "@/components/checkout/CheckoutSummary";
import OrderSuccess from "@/components/checkout/OrderSuccess";
import { computeTotals, initialShipping } from "@/components/checkout/order";
import type { OrderSnapshot, ShippingData } from "@/components/checkout/order";
import { useCouponStore } from "@/components/cart/coupon";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

type Step = 0 | 1 | 2;
type PaymentConfig = { enabled: boolean; publishableKey: string | null };

function EmptyCheckout() {
  return (
    <div className="container-voya flex flex-col items-center py-24 text-center">
      <div className="shadow-card relative flex h-36 w-36 items-center justify-center rounded-full bg-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/petal.svg" alt="" aria-hidden className="absolute top-3 -right-2 h-6 w-6 opacity-60" />
        <Flower2 className="text-rose h-20 w-20" strokeWidth={1} />
      </div>
      <h1 className="mt-8 text-3xl font-bold">لا يوجد طلب لإتمامه</h1>
      <p className="font-body text-ink-soft mt-3">
        سلتكِ فارغة — أضيفي منتجات أولًا ثم عودي لإتمام الطلب.
      </p>
      <Link
        href="/products"
        className="bg-gradient-rose hover:shadow-card-hover mt-7 rounded-full px-10 py-3.5 text-sm font-bold text-white transition-shadow duration-300"
      >
        تسوّقي الآن
      </Link>
    </div>
  );
}

export default function CheckoutView() {
  const { user } = useAuth();
  const { items: rawItems, subtotal, guestLines, clear } = useCart();
  const items = rawItems.map(toTemplateItem);
  const coupon = useCouponStore((s) => s.code);
  const removeCoupon = useCouponStore((s) => s.remove);

  const [step, setStep] = useState<Step>(0);
  const [shipping, setShipping] = useState<ShippingData>(initialShipping);
  const [payment, setPayment] = useState<PaymentMethod>("cod");
  const [order, setOrder] = useState<OrderSnapshot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [payments, setPayments] = useState<PaymentConfig | null>(null);

  const totals = computeTotals(subtotal, coupon, shipping.method, payment);

  // إعدادات الدفع تُقرأ من الخادم؛ إن لم تُهيّأ مفاتيح Stripe يبقى
  // الدفع عند الاستلام هو الخيار الوحيد.
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const config = await api<PaymentConfig>("/api/payments/config", { auth: false });
        if (!cancelled) setPayments(config);
      } catch {
        if (!cancelled) setPayments({ enabled: false, publishableKey: null });
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const goTo = (s: Step) => {
    setStep(s);
    window.scrollTo(0, 0);
  };

  /** حمولة الطلب — الأسعار تُحتسب على الخادم، لا نرسلها إطلاقًا. */
  const orderPayload = (method: "cod" | "card") => ({
    customer: {
      name: shipping.fullName,
      email: shipping.email,
      phone: shipping.phone,
    },
    shipping: {
      emirate: shipping.city,
      area: shipping.district,
      address: shipping.address,
      notes: shipping.notes,
    },
    paymentMethod: method,
    // المستخدم المسجّل: الخادم يقرأ سلته. الزائر: نرسل سطوره.
    ...(user ? {} : { items: guestLines }),
  });

  /** لقطة العرض تُبنى من الطلب الذي أعاده الخادم، لا من حساب محلي. */
  const snapshotOf = (placed: Order): OrderSnapshot => ({
    orderNumber: placed.reference,
    items,
    subtotal: placed.subtotal,
    shipping: placed.shippingFee,
    discount: totals.discount,
    total: placed.total,
  });

  const finish = async (placed: Order) => {
    setOrder(snapshotOf(placed));
    removeCoupon();
    await clear().catch(() => {
      /* الطلب نجح؛ فشل تنظيف السلة لا يجب أن يخفي التأكيد */
    });
    window.scrollTo(0, 0);
  };

  const describe = (err: unknown, fallback: string) =>
    err instanceof ApiError ? err.message : fallback;

  /** الدفع عند الاستلام: الطلب يُنشأ ويُؤكَّد مباشرة. */
  const confirmCod = async () => {
    setError(null);
    try {
      const { order: placed } = await api<{ order: Order }>("/api/orders", {
        method: "POST",
        json: orderPayload("cod"),
      });
      await finish(placed);
    } catch (err) {
      setError(describe(err, "تعذّر إرسال الطلب. تأكّدي من اتصالك وحاولي مجددًا."));
      throw err;
    }
  };

  /** البطاقة: الطلب يُنشأ أولًا ثم يُدفع عبر Stripe. */
  const createCardOrder = async () => {
    setError(null);
    const res = await api<{ order: Order; clientSecret: string }>("/api/orders", {
      method: "POST",
      json: orderPayload("card"),
    });
    if (!res.clientSecret) throw new Error("لم يُرجع الخادم بيانات الدفع");
    return { order: res.order, clientSecret: res.clientSecret };
  };

  const onCardResult = (result: PaymentResult) => {
    void finish(result.order);
  };

  const cardsEnabled = Boolean(payments?.enabled && payments.publishableKey);

  if (items.length === 0 && !order) return <EmptyCheckout />;

  return (
    <div className="container-voya py-10 md:py-14">
      <div className="text-ink-soft flex items-center justify-center gap-2 text-sm font-semibold">
        <Lock className="text-success h-4 w-4" strokeWidth={1.5} />
        دفع آمن ومشفّر
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE }}
        className="mx-auto mt-6 max-w-xl"
      >
        <Stepper current={order ? 3 : step} />
      </motion.div>

      {order ? (
        <div className="mx-auto mt-10 max-w-2xl">
          <OrderSuccess order={order} />
        </div>
      ) : (
        <div className="mt-10 grid items-start gap-8 lg:grid-cols-[minmax(0,58fr)_minmax(0,42fr)]">
          <div>
            {error && (
              <p
                role="alert"
                className="mb-4 rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700"
              >
                {error}
              </p>
            )}

            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={step}
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 40 }}
                transition={{ duration: 0.5, ease: EASE }}
              >
                {step === 0 && (
                  <ShippingStep
                    data={shipping}
                    onChange={setShipping}
                    onNext={() => goTo(1)}
                    subtotal={subtotal}
                  />
                )}
                {step === 1 && (
                  <PaymentStep
                    method={payment}
                    onMethodChange={setPayment}
                    onBack={() => goTo(0)}
                    onConfirm={() => goTo(2)}
                    total={totals.total}
                    shipping={shipping}
                    cardsEnabled={cardsEnabled}
                  />
                )}
                {step === 2 && (
                  <ReviewStep
                    shipping={shipping}
                    payment={payment}
                    totals={totals}
                    onBack={() => goTo(1)}
                    onConfirm={confirmCod}
                    cardSlot={
                      payment === "card" && cardsEnabled ? (
                        <StripePayment
                          publishableKey={payments!.publishableKey!}
                          amount={totals.total}
                          createOrder={createCardOrder}
                          validateForm={() => true}
                          onSuccess={onCardResult}
                          onCancelled={() =>
                            setError("أُلغيت عملية الدفع ولم يُخصم أي مبلغ.")
                          }
                        />
                      ) : null
                    }
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="order-first lg:sticky lg:top-28 lg:order-none">
            <CheckoutSummary method={shipping.method} payment={payment} />
          </div>
        </div>
      )}
    </div>
  );
}
