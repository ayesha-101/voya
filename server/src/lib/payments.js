import Stripe from "stripe";
import { config } from "../config.js";

/**
 * عميل Stripe يُنشأ مرة واحدة عند إقلاع التطبيق ويُمرَّر عبر app.locals،
 * حتى يمكن حقن بديل في الاختبارات دون أي نداء شبكة.
 */
export function createStripeClient() {
  if (!config.STRIPE_SECRET_KEY) return null;
  return new Stripe(config.STRIPE_SECRET_KEY, {
    // تثبيت الإصدار يمنع تغييرات Stripe المستقبلية من كسر التكامل فجأة
    apiVersion: "2025-09-30.clover",
    appInfo: { name: "VOYA Store", version: "1.0.0" },
    maxNetworkRetries: 2,
  });
}

/** الدرهم عملة بكسور من مئة، فالمبالغ تُرسل إلى Stripe بالفلوس. */
export function toMinorUnits(amount) {
  return Math.round(amount * 100);
}

export function fromMinorUnits(amount) {
  return Math.round(amount) / 100;
}

/**
 * يستخرج وسيلة الدفع المعروضة للعميل من نيّة الدفع:
 * «Apple Pay» أو «Google Pay» أو اسم شبكة البطاقة.
 */
export function describePaymentMethod(paymentIntent) {
  const card =
    paymentIntent?.latest_charge?.payment_method_details?.card ??
    paymentIntent?.payment_method?.card ??
    null;

  if (!card) return { brand: null, wallet: null };

  return {
    brand: card.brand ?? null,
    wallet: card.wallet?.type ?? null, // apple_pay | google_pay | link | …
  };
}

export const WALLET_LABELS = {
  apple_pay: "Apple Pay",
  google_pay: "Google Pay",
  link: "Link",
};
