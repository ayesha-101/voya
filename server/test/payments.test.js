import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import Stripe from "stripe";
import { createApp } from "../src/app.js";
import { pool, query } from "../src/db/pool.js";

/**
 * اختبارات الدفع تعمل بلا أي نداء شبكة:
 *  - إنشاء نيّة الدفع يُحقن بعميل Stripe مزيّف.
 *  - التحقّق من توقيع الـ webhook يستخدم مكتبة Stripe الحقيقية،
 *    والتوقيع يُولَّد محليًا بنفس خوارزميتها.
 */

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
const realStripe = new Stripe("sk_test_dummy_key_for_signing_only", {
  apiVersion: "2025-09-30.clover",
});

let base;
let server;
const created = [];

// عميل Stripe مزيّف: يسجّل ما أُرسل إليه ويعيد نيّة دفع واقعية الشكل
const fakeStripe = {
  paymentIntents: {
    create: async (params, options) => {
      created.push({ params, options });
      const id = `pi_test_${created.length}_${Date.now()}`;
      return { id, client_secret: `${id}_secret_abc`, status: "requires_payment_method" };
    },
  },
  webhooks: realStripe.webhooks,
};

before(async () => {
  server = createApp({ stripe: fakeStripe }).listen(0);
  await new Promise((r) => server.once("listening", r));
  base = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  server.close();
  await pool.end();
});

const api = async (path, options = {}) => {
  const res = await fetch(base + path, {
    ...options,
    headers: {
      ...(options.json ? { "content-type": "application/json" } : {}),
      ...(options.token ? { authorization: `Bearer ${options.token}` } : {}),
      ...options.headers,
    },
    body: options.json ? JSON.stringify(options.json) : options.body,
  });
  return { status: res.status, body: await res.json().catch(() => null) };
};

const customer = { name: "عميل بطاقة", email: "card@example.com", phone: "+971501234567" };
const shipping = { emirate: "دبي", area: "المرقبات", address: "شارع 5، مبنى 9" };

const placeCardOrder = (items) =>
  api("/api/orders", {
    method: "POST",
    json: { customer, shipping, paymentMethod: "card", items },
  });

const stockOf = async (slug) =>
  (await api(`/api/products/${slug}`)).body.product.stock;

/** يبني نص حدث Stripe موقّعًا بنفس صيغة توقيعها الحقيقية. */
function signedEvent(type, object) {
  const payload = JSON.stringify({
    id: `evt_test_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    type,
    data: { object },
  });
  const header = realStripe.webhooks.generateTestHeaderString({
    payload,
    secret: WEBHOOK_SECRET,
  });
  return { payload, header };
}

const sendWebhook = async (type, object, header) => {
  const signed = signedEvent(type, object);
  const res = await fetch(`${base}/api/payments/webhook`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "stripe-signature": header ?? signed.header,
    },
    body: signed.payload,
  });
  return { status: res.status, body: await res.json().catch(() => null) };
};

describe("إعدادات الدفع", () => {
  it("تُبلغ الواجهة بأن الدفع الإلكتروني مفعّل", async () => {
    const { status, body } = await api("/api/payments/config");
    assert.equal(status, 200);
    assert.equal(body.enabled, true);
    assert.equal(body.currency, "AED");
    assert.ok(body.publishableKey.startsWith("pk_"));
  });
});

describe("إنشاء طلب بالبطاقة", () => {
  it("يُنشئ نيّة دفع ويعيد client secret", async () => {
    const { status, body } = await placeCardOrder([{ slug: "hand-cream", qty: 2 }]);
    assert.equal(status, 201);
    assert.ok(body.clientSecret.includes("_secret_"));
    assert.equal(body.order.paymentMethod, "card");
    assert.equal(body.order.paymentStatus, "processing");
  });

  it("يرسل المبلغ إلى Stripe بالفلوس وبعملة الدرهم", async () => {
    const before = created.length;
    const { body } = await placeCardOrder([{ slug: "hand-cream", qty: 1 }]);
    const sent = created[before].params;
    // 79 د.إ + 20 شحن = 99 د.إ = 9900 فلس
    assert.equal(body.order.total, 99);
    assert.equal(sent.amount, 9900);
    assert.equal(sent.currency, "aed");
    assert.equal(sent.automatic_payment_methods.enabled, true);
    assert.equal(sent.metadata.reference, body.order.reference);
  });

  it("يستخدم مفتاح تكرار مشتقًا من مرجع الطلب", async () => {
    const before = created.length;
    const { body } = await placeCardOrder([{ slug: "hand-cream", qty: 1 }]);
    assert.equal(created[before].options.idempotencyKey, `order-${body.order.reference}`);
  });

  it("يحجز المخزون فور إنشاء الطلب", async () => {
    const before = await stockOf("konjac-sponge");
    await placeCardOrder([{ slug: "konjac-sponge", qty: 3 }]);
    assert.equal(await stockOf("konjac-sponge"), before - 3);
  });

  it("لا ينشئ نيّة دفع لطلب الدفع عند الاستلام", async () => {
    const before = created.length;
    const { body } = await api("/api/orders", {
      method: "POST",
      json: { customer, shipping, items: [{ slug: "hand-cream", qty: 1 }] },
    });
    assert.equal(created.length, before);
    assert.equal(body.clientSecret, null);
    assert.equal(body.order.paymentStatus, "unpaid");
  });
});

describe("مستقبِل أحداث Stripe", () => {
  it("يرفض توقيعًا غير صالح", async () => {
    const res = await sendWebhook(
      "payment_intent.succeeded",
      { id: "pi_whatever" },
      "t=1,v1=deadbeef",
    );
    assert.equal(res.status, 400);
  });

  it("يرفض الطلب بلا ترويسة توقيع", async () => {
    const res = await fetch(`${base}/api/payments/webhook`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ type: "payment_intent.succeeded" }),
    });
    assert.equal(res.status, 400);
  });

  it("ينجح الدفع فيؤكّد الطلب ويسجّل Apple Pay", async () => {
    const { body } = await placeCardOrder([{ slug: "dry-brush", qty: 1 }]);
    const { rows } = await query(
      "SELECT payment_intent_id FROM orders WHERE reference = $1",
      [body.order.reference],
    );

    const res = await sendWebhook("payment_intent.succeeded", {
      id: rows[0].payment_intent_id,
      latest_charge: {
        payment_method_details: {
          card: { brand: "visa", wallet: { type: "apple_pay" } },
        },
      },
    });
    assert.equal(res.status, 200);

    const order = (
      await api(`/api/orders/${body.order.reference}?email=${customer.email}`)
    ).body.order;
    assert.equal(order.paymentStatus, "paid");
    assert.equal(order.status, "confirmed");
    assert.equal(order.paymentWallet, "apple_pay");
    assert.equal(order.paymentBrand, "visa");
    assert.ok(order.paidAt);
  });

  it("يسجّل Google Pay أيضًا", async () => {
    const { body } = await placeCardOrder([{ slug: "dry-brush", qty: 1 }]);
    const { rows } = await query(
      "SELECT payment_intent_id FROM orders WHERE reference = $1",
      [body.order.reference],
    );
    await sendWebhook("payment_intent.succeeded", {
      id: rows[0].payment_intent_id,
      latest_charge: {
        payment_method_details: {
          card: { brand: "mastercard", wallet: { type: "google_pay" } },
        },
      },
    });
    const order = (
      await api(`/api/orders/${body.order.reference}?email=${customer.email}`)
    ).body.order;
    assert.equal(order.paymentWallet, "google_pay");
  });

  it("يفشل الدفع فيُلغي الطلب ويعيد المخزون", async () => {
    const before = await stockOf("body-butter");
    const { body } = await placeCardOrder([{ slug: "body-butter", qty: 2 }]);
    assert.equal(await stockOf("body-butter"), before - 2);

    const { rows } = await query(
      "SELECT payment_intent_id FROM orders WHERE reference = $1",
      [body.order.reference],
    );
    const res = await sendWebhook("payment_intent.payment_failed", {
      id: rows[0].payment_intent_id,
    });
    assert.equal(res.status, 200);

    assert.equal(await stockOf("body-butter"), before, "يجب أن يعود المخزون كما كان");
    const order = (
      await api(`/api/orders/${body.order.reference}?email=${customer.email}`)
    ).body.order;
    assert.equal(order.paymentStatus, "failed");
    assert.equal(order.status, "cancelled");
  });

  it("إعادة إرسال حدث الفشل لا تعيد المخزون مرتين", async () => {
    const before = await stockOf("bath-soak");
    const { body } = await placeCardOrder([{ slug: "bath-soak", qty: 4 }]);
    const { rows } = await query(
      "SELECT payment_intent_id FROM orders WHERE reference = $1",
      [body.order.reference],
    );
    const intent = { id: rows[0].payment_intent_id };

    await sendWebhook("payment_intent.payment_failed", intent);
    await sendWebhook("payment_intent.payment_failed", intent);
    await sendWebhook("payment_intent.canceled", intent);

    assert.equal(await stockOf("bath-soak"), before, "المخزون يُعاد مرة واحدة فقط");
  });

  it("حدث نجاح مكرّر لا يغيّر وقت الدفع", async () => {
    const { body } = await placeCardOrder([{ slug: "hand-cream", qty: 1 }]);
    const { rows } = await query(
      "SELECT payment_intent_id FROM orders WHERE reference = $1",
      [body.order.reference],
    );
    const intent = { id: rows[0].payment_intent_id };

    await sendWebhook("payment_intent.succeeded", intent);
    const first = (
      await api(`/api/orders/${body.order.reference}?email=${customer.email}`)
    ).body.order.paidAt;

    await sendWebhook("payment_intent.succeeded", intent);
    const second = (
      await api(`/api/orders/${body.order.reference}?email=${customer.email}`)
    ).body.order.paidAt;

    assert.equal(first, second);
  });

  it("الفشل بعد الدفع لا يُلغي طلبًا مدفوعًا", async () => {
    const { body } = await placeCardOrder([{ slug: "hand-cream", qty: 1 }]);
    const { rows } = await query(
      "SELECT payment_intent_id FROM orders WHERE reference = $1",
      [body.order.reference],
    );
    const intent = { id: rows[0].payment_intent_id };

    await sendWebhook("payment_intent.succeeded", intent);
    await sendWebhook("payment_intent.payment_failed", intent);

    const order = (
      await api(`/api/orders/${body.order.reference}?email=${customer.email}`)
    ).body.order;
    assert.equal(order.paymentStatus, "paid");
    assert.equal(order.status, "confirmed");
  });

  it("الاسترجاع يُلغي الطلب ويعيد المخزون", async () => {
    const before = await stockOf("shower-gel");
    const { body } = await placeCardOrder([{ slug: "shower-gel", qty: 2 }]);
    const { rows } = await query(
      "SELECT payment_intent_id FROM orders WHERE reference = $1",
      [body.order.reference],
    );
    await sendWebhook("payment_intent.succeeded", { id: rows[0].payment_intent_id });
    await sendWebhook("charge.refunded", { payment_intent: rows[0].payment_intent_id });

    const order = (
      await api(`/api/orders/${body.order.reference}?email=${customer.email}`)
    ).body.order;
    assert.equal(order.paymentStatus, "refunded");
    assert.equal(await stockOf("shower-gel"), before);
  });

  it("يتجاهل الأحداث غير المعنيّة بهدوء", async () => {
    const res = await sendWebhook("customer.created", { id: "cus_123" });
    assert.equal(res.status, 200);
    assert.equal(res.body.received, true);
  });
});

describe("الإيراد في لوحة المدير", () => {
  it("لا يحتسب طلب بطاقة لم يُدفع", async () => {
    const login = await api("/api/auth/login", {
      method: "POST",
      json: { email: "admin@byvoyastore.com", password: "Admin@12345" },
    });
    const token = login.body.token;

    const before = (await api("/api/admin/stats", { token })).body.totals.revenue;
    await placeCardOrder([{ slug: "ritual-gift-set", qty: 1 }]);
    const after = (await api("/api/admin/stats", { token })).body.totals.revenue;

    assert.equal(after, before, "الطلب قيد الدفع لا يُضاف للإيراد");
  });

  it("يحتسبه بعد نجاح الدفع", async () => {
    const login = await api("/api/auth/login", {
      method: "POST",
      json: { email: "admin@byvoyastore.com", password: "Admin@12345" },
    });
    const token = login.body.token;

    const before = (await api("/api/admin/stats", { token })).body.totals.revenue;
    const { body } = await placeCardOrder([{ slug: "glow-duo", qty: 1 }]);
    const { rows } = await query(
      "SELECT payment_intent_id FROM orders WHERE reference = $1",
      [body.order.reference],
    );
    await sendWebhook("payment_intent.succeeded", { id: rows[0].payment_intent_id });

    const after = (await api("/api/admin/stats", { token })).body.totals.revenue;
    assert.equal(after, before + body.order.total);
  });
});

describe("أعطال بوابة الدفع", () => {
  it("تُترجم عطل الاتصال برسالة عربية ولا تترك طلبًا معلّقًا", async () => {
    const failing = {
      paymentIntents: {
        create: async () => {
          const err = new Error("Invalid JSON received from the Stripe API");
          err.type = "StripeAPIError";
          throw err;
        },
      },
      webhooks: realStripe.webhooks,
    };
    const srv = createApp({ stripe: failing }).listen(0);
    await new Promise((r) => srv.once("listening", r));
    const url = `http://127.0.0.1:${srv.address().port}`;

    const stockBefore = (
      await (await fetch(`${url}/api/products/scalp-oil`)).json()
    ).product.stock;

    const res = await fetch(`${url}/api/orders`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        customer,
        shipping,
        paymentMethod: "card",
        items: [{ slug: "scalp-oil", qty: 2 }],
      }),
    });
    const body = await res.json();

    assert.equal(res.status, 502);
    assert.match(body.error, /بوابة الدفع/);
    assert.doesNotMatch(body.error, /Stripe/);

    // المعاملة تراجعت: لا طلب مُنشأ ولا مخزون محجوز
    const stockAfter = (
      await (await fetch(`${url}/api/products/scalp-oil`)).json()
    ).product.stock;
    assert.equal(stockAfter, stockBefore);

    const { rows } = await query(
      "SELECT COUNT(*)::int AS n FROM orders WHERE customer_email = $1 AND payment_status = 'processing' AND payment_intent_id IS NULL",
      [customer.email],
    );
    assert.equal(rows[0].n, 0, "لا يبقى طلب بلا نيّة دفع");

    srv.close();
  });

  it("تُترجم رفض البطاقة إلى 400 برسالة واضحة", async () => {
    const declining = {
      paymentIntents: {
        create: async () => {
          const err = new Error("Your card was declined.");
          err.type = "StripeCardError";
          throw err;
        },
      },
      webhooks: realStripe.webhooks,
    };
    const srv = createApp({ stripe: declining }).listen(0);
    await new Promise((r) => srv.once("listening", r));
    const url = `http://127.0.0.1:${srv.address().port}`;

    const res = await fetch(`${url}/api/orders`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        customer, shipping, paymentMethod: "card",
        items: [{ slug: "scalp-oil", qty: 1 }],
      }),
    });
    const body = await res.json();
    assert.equal(res.status, 400);
    assert.match(body.error, /رُفضت البطاقة/);

    srv.close();
  });
});
