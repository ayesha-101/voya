"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { api, ApiError, DEMO_MODE } from "@/lib/api";
import { formatPrice } from "@/lib/format";
import { site } from "@/data/site";
import type { Order, PaymentConfig } from "@/lib/types";
import { StripePayment, type PaymentResult } from "./StripePayment";
import { paymentLabel } from "./PaymentBadge";
import { WalletMarks } from "./WalletMarks";
import { useAuth } from "./AuthProvider";
import { useCart } from "./CartProvider";

const emirates = [
  "دبي", "أبوظبي", "الشارقة", "عجمان", "رأس الخيمة", "الفجيرة", "أم القيوين",
];

type Payment = "cod" | "card";

export function CheckoutForm() {
  const { user } = useAuth();
  const { items, subtotal, shippingFee, total, count, ready, clear, guestLines } = useCart();
  const [payment, setPayment] = useState<Payment>("cod");
  const [order, setOrder] = useState<Order | null>(null);
  const [pendingPayment, setPendingPayment] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [payments, setPayments] = useState<PaymentConfig | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // نسأل الخادم هل الدفع الإلكتروني مهيّأ أصلًا قبل عرض الخيار
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (DEMO_MODE) {
        setPayments({ enabled: false, publishableKey: null, currency: "AED" });
        return;
      }
      try {
        const config = await api<PaymentConfig>("/api/payments/config", { auth: false });
        if (!cancelled) setPayments(config);
      } catch {
        if (!cancelled) {
          setPayments({ enabled: false, publishableKey: null, currency: "AED" });
        }
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!ready) {
    return <div className="h-72 animate-pulse rounded-card bg-blush-100" />;
  }

  if (order) {
    return (
      <div className="rounded-card border border-plum-200 bg-plum-50 p-10 text-center">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-plum-700 text-3xl text-white">
          ✓
        </span>
        <h2 className="mt-5 text-2xl font-extrabold text-ink">تم استلام طلبك بنجاح</h2>
        <p className="nums mt-2 text-sm text-muted">رقم الطلب: {order.reference}</p>
        <p className="nums mt-1 text-lg font-extrabold text-plum-700">
          {formatPrice(order.total)}
        </p>
        <p className="mt-1 text-xs text-muted">{paymentLabel(order)}</p>
        <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-ink">
          {pendingPayment
            ? "دفعتك قيد المعالجة لدى البنك. سنؤكّد الطلب فور اكتمالها ونرسل لك رسالة."
            : `سيتواصل معك فريقنا خلال ساعات لتأكيد الطلب. التوصيل المتوقع خلال 24 – 48 ساعة داخل ${site.country}.`}
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link
            href="/products"
            className="rounded-full bg-plum-700 px-8 py-3.5 font-bold text-white transition hover:bg-plum-800"
          >
            متابعة التسوّق
          </Link>
          {user && (
            <Link
              href="/account"
              className="rounded-full border border-blush-300 px-8 py-3.5 font-bold text-plum-700 transition hover:bg-blush-50"
            >
              عرض طلباتي
            </Link>
          )}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-card border border-dashed border-blush-300 bg-blush-50 py-20 text-center">
        <p className="text-lg font-bold text-ink">لا توجد منتجات في السلة</p>
        <Link
          href="/products"
          className="mt-6 inline-block rounded-full bg-plum-700 px-8 py-3.5 font-bold text-white transition hover:bg-plum-800"
        >
          تصفّح المنتجات
        </Link>
      </div>
    );
  }

  /** يجمع نص الطلب من النموذج — يستخدمه مسارا الدفع كلاهما. */
  function orderPayload(method: Payment) {
    const form = formRef.current;
    if (!form) throw new Error("النموذج غير جاهز");
    const data = new FormData(form);

    return {
      customer: {
        name: String(data.get("name") ?? ""),
        email: String(data.get("email") ?? ""),
        phone: String(data.get("phone") ?? ""),
      },
      shipping: {
        emirate: String(data.get("emirate") ?? ""),
        area: String(data.get("area") ?? ""),
        address: String(data.get("address") ?? ""),
        notes: String(data.get("notes") ?? ""),
      },
      paymentMethod: method,
      // المستخدم المسجّل: الخادم يقرأ سلته. الزائر: نرسل سطوره.
      ...(user ? {} : { items: guestLines }),
    };
  }

  function reportError(err: unknown, fallback: string) {
    if (err instanceof ApiError) {
      setError(err.message);
      if (err.details) {
        setFieldErrors(
          Object.fromEntries(
            err.details.map((d) => [d.field.split(".").pop() ?? d.field, d.message]),
          ),
        );
      }
    } else {
      setError(fallback);
    }
  }

  /** الدفع عند الاستلام: الطلب يُنشأ ويُؤكَّد مباشرة. */
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (payment === "card") return; // مسار البطاقة يبدأ من زر Stripe

    setSubmitting(true);
    setError(null);
    setFieldErrors({});

    try {
      const { order } = await api<{ order: Order }>("/api/orders", {
        method: "POST",
        json: orderPayload("cod"),
      });
      await finish(order, false);
    } catch (err) {
      reportError(err, "تعذّر إرسال الطلب. تأكّد من اتصالك وحاول مجددًا.");
    } finally {
      setSubmitting(false);
    }
  }

  async function finish(placed: Order, processing: boolean) {
    setPendingPayment(processing);
    setOrder(placed);
    await clear().catch(() => {
      /* الطلب نجح؛ فشل تنظيف السلة لا يجب أن يخفي التأكيد */
    });
  }

  /** يُنشئ طلب البطاقة على الخادم ويعيد سرّ نيّة الدفع لعناصر Stripe. */
  async function createCardOrder() {
    setError(null);
    setFieldErrors({});
    try {
      const res = await api<{ order: Order; clientSecret: string }>("/api/orders", {
        method: "POST",
        json: orderPayload("card"),
      });
      if (!res.clientSecret) throw new Error("لم يُرجع الخادم بيانات الدفع");
      return { order: res.order, clientSecret: res.clientSecret };
    } catch (err) {
      reportError(err, "تعذّر تجهيز عملية الدفع");
      throw err;
    }
  }

  const cardsEnabled = Boolean(payments?.enabled && payments.publishableKey);

  const field =
    "w-full rounded-xl border border-blush-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-plum-400";
  const err = (name: string) =>
    fieldErrors[name] ? (
      <span className="block text-xs font-bold text-red-600">{fieldErrors[name]}</span>
    ) : null;

  return (
    <form
      ref={formRef}
      onSubmit={submit}
      className="grid gap-8 lg:grid-cols-[1.6fr_1fr] lg:items-start"
    >
      <div className="space-y-8">
        {!user && (
          <p className="rounded-card border border-blush-200 bg-blush-50 p-4 text-sm text-ink">
            تطلب كزائر.{" "}
            <Link href="/login?next=/checkout" className="font-bold text-plum-700 hover:underline">
              سجّل الدخول
            </Link>{" "}
            لحفظ الطلب في حسابك ومتابعته لاحقًا.
          </p>
        )}

        {error && (
          <p className="rounded-card bg-red-50 p-4 text-sm font-bold text-red-700">{error}</p>
        )}

        <fieldset className="space-y-4 rounded-card border border-blush-200 p-6">
          <legend className="px-2 text-sm font-extrabold text-ink">بيانات التوصيل</legend>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1.5">
              <span className="text-[13px] font-bold text-ink">الاسم الكامل</span>
              <input name="name" required defaultValue={user?.name ?? ""} autoComplete="name" className={field} />
              {err("name")}
            </label>
            <label className="space-y-1.5">
              <span className="text-[13px] font-bold text-ink">رقم الجوال</span>
              <input
                name="phone"
                required
                type="tel"
                dir="ltr"
                inputMode="tel"
                defaultValue={user?.phone ?? ""}
                placeholder="+971 5X XXX XXXX"
                autoComplete="tel"
                className={`${field} text-start`}
              />
              {err("phone")}
            </label>
          </div>

          <label className="block space-y-1.5">
            <span className="text-[13px] font-bold text-ink">البريد الإلكتروني</span>
            <input
              name="email"
              type="email"
              required
              dir="ltr"
              defaultValue={user?.email ?? ""}
              autoComplete="email"
              className={`${field} text-start`}
            />
            {err("email")}
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1.5">
              <span className="text-[13px] font-bold text-ink">الإمارة</span>
              <select name="emirate" required defaultValue="" className={field}>
                <option value="" disabled>اختر الإمارة</option>
                {emirates.map((e) => (
                  <option key={e} value={e}>{e}</option>
                ))}
              </select>
              {err("emirate")}
            </label>
            <label className="space-y-1.5">
              <span className="text-[13px] font-bold text-ink">المنطقة / الحي</span>
              <input name="area" required className={field} />
              {err("area")}
            </label>
          </div>

          <label className="block space-y-1.5">
            <span className="text-[13px] font-bold text-ink">العنوان التفصيلي</span>
            <textarea
              name="address"
              required
              rows={3}
              placeholder="اسم الشارع، رقم المبنى، رقم الشقة، أقرب معلم"
              className={field}
            />
            {err("address")}
          </label>

          <label className="block space-y-1.5">
            <span className="text-[13px] font-bold text-ink">ملاحظات (اختياري)</span>
            <textarea name="notes" rows={2} className={field} />
          </label>
        </fieldset>

        <fieldset className="space-y-3 rounded-card border border-blush-200 p-6">
          <legend className="px-2 text-sm font-extrabold text-ink">طريقة الدفع</legend>

          {([
            {
              value: "cod" as const,
              title: "الدفع عند الاستلام",
              body: "ادفع نقدًا للمندوب عند وصول الطلب",
              disabled: false,
            },
            {
              value: "card" as const,
              title: "بطاقة، Apple Pay، أو Google Pay",
              body: cardsEnabled
                ? "فيزا وماستركارد ومدى — والمحافظ تظهر تلقائيًا حسب جهازك"
                : "غير مفعّل على هذا الخادم",
              disabled: !cardsEnabled,
            },
          ]).map((opt) => (
            <label
              key={opt.value}
              className={`flex items-start gap-3 rounded-xl border p-4 transition ${
                opt.disabled
                  ? "cursor-not-allowed border-blush-200 opacity-55"
                  : payment === opt.value
                    ? "cursor-pointer border-plum-600 bg-plum-50"
                    : "cursor-pointer border-blush-200 hover:border-blush-300"
              }`}
            >
              <input
                type="radio"
                name="payment"
                value={opt.value}
                checked={payment === opt.value}
                disabled={opt.disabled}
                onChange={() => setPayment(opt.value)}
                className="mt-1 h-4 w-4 accent-[var(--color-plum-700)]"
              />
              <span className="flex-1">
                <span className="block text-sm font-bold text-ink">{opt.title}</span>
                <span className="block text-xs text-muted">{opt.body}</span>
              </span>
              {opt.value === "card" && <WalletMarks />}
            </label>
          ))}

          {payment === "card" && payments?.publishableKey && (
            <div className="border-t border-blush-200 pt-5">
              <StripePayment
                publishableKey={payments.publishableKey}
                amount={total}
                createOrder={createCardOrder}
                validateForm={() => formRef.current?.reportValidity() ?? false}
                onSuccess={(result: PaymentResult) =>
                  void finish(result.order, result.status === "processing")
                }
                onCancelled={() => {
                  // الخادم يُعيد المخزون عبر webhook؛ نُعيد العميل لسلته
                  setError(
                    (prev) =>
                      prev ??
                      "لم تكتمل عملية الدفع. لم يُخصم أي مبلغ — يمكنك المحاولة مجددًا.",
                  );
                }}
              />
            </div>
          )}

          {payment === "card" && payments && !payments.publishableKey && (
            <p className="rounded-xl bg-blush-100 p-3 text-[13px] leading-6 text-muted">
              الدفع الإلكتروني غير مهيّأ على هذا الخادم. أضف مفاتيح Stripe في
              <code className="mx-1 rounded bg-white px-1.5 py-0.5" dir="ltr">server/.env</code>
              أو اختر الدفع عند الاستلام.
            </p>
          )}
        </fieldset>
      </div>

      <aside className="sticky top-40 space-y-4 rounded-card border border-blush-200 bg-blush-50 p-6">
        <h2 className="text-lg font-extrabold text-ink">
          ملخّص الطلب <span className="nums text-sm font-normal text-muted">({count})</span>
        </h2>

        <ul className="max-h-64 space-y-3 overflow-y-auto border-b border-blush-200 pb-4 text-sm">
          {items.map((item) => (
            <li key={item.slug} className="flex items-start justify-between gap-3">
              <span className="text-ink">{item.name}</span>
              <span className="nums shrink-0 text-muted">×{item.qty}</span>
              <span className="nums shrink-0 font-bold">{formatPrice(item.lineTotal)}</span>
            </li>
          ))}
        </ul>

        <dl className="space-y-3 border-b border-blush-200 pb-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted">المجموع الفرعي</dt>
            <dd className="nums font-bold">{formatPrice(subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">الشحن</dt>
            <dd className="nums font-bold">
              {shippingFee === 0 ? "مجاني" : formatPrice(shippingFee)}
            </dd>
          </div>
        </dl>

        <div className="flex items-baseline justify-between">
          <span className="font-bold text-ink">الإجمالي</span>
          <span className="nums text-2xl font-extrabold text-plum-700">{formatPrice(total)}</span>
        </div>

        {payment === "cod" ? (
          <>
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-full bg-plum-700 px-6 py-4 font-bold text-white transition hover:bg-plum-800 active:scale-[0.99] disabled:opacity-60"
            >
              {submitting ? "جارٍ إرسال الطلب…" : "تأكيد الطلب"}
            </button>
            <p className="text-center text-[11px] leading-5 text-muted">
              بالضغط على تأكيد الطلب فإنك توافق على شروط الاستخدام وسياسة الاسترجاع.
            </p>
          </>
        ) : (
          <p className="rounded-xl bg-white p-3 text-center text-[12px] leading-5 text-muted">
            أكمل بيانات التوصيل ثم ادفع من قسم «طريقة الدفع».
          </p>
        )}
      </aside>
    </form>
  );
}
