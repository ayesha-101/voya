import { Router } from "express";
import { config } from "../config.js";
import { query, withTransaction } from "../db/pool.js";
import { asyncHandler } from "../lib/errors.js";
import { describePaymentMethod } from "../lib/payments.js";

export const paymentsRouter = Router();

/** الواجهة تسأل عن حالة الدفع لتعرف هل تعرض خيار البطاقة أصلًا. */
paymentsRouter.get("/config", (_req, res) => {
  res.json({
    enabled: config.paymentsEnabled,
    publishableKey: config.STRIPE_PUBLISHABLE_KEY ?? null,
    currency: "AED",
  });
});

/**
 * يُعيد المخزون المحجوز لطلب فشل دفعه — مرة واحدة فقط.
 * العلم stock_released يجعل إعادة إرسال نفس الـ webhook بلا أثر.
 */
async function releaseStock(client, orderId) {
  const { rows } = await client.query(
    `UPDATE orders SET stock_released = TRUE
      WHERE id = $1 AND stock_released = FALSE
      RETURNING id`,
    [orderId],
  );
  if (rows.length === 0) return false;

  await client.query(
    `UPDATE products p
        SET stock = p.stock + oi.qty
       FROM order_items oi
      WHERE oi.order_id = $1 AND oi.product_id = p.id`,
    [orderId],
  );
  return true;
}

async function markPaid(paymentIntent) {
  const { brand, wallet } = describePaymentMethod(paymentIntent);
  const { rows } = await query(
    `UPDATE orders
        SET payment_status = 'paid',
            status         = CASE WHEN status = 'pending' THEN 'confirmed' ELSE status END,
            payment_brand  = COALESCE($2, payment_brand),
            payment_wallet = COALESCE($3, payment_wallet),
            paid_at        = COALESCE(paid_at, now())
      WHERE payment_intent_id = $1 AND payment_status <> 'paid'
      RETURNING reference`,
    [paymentIntent.id, brand, wallet],
  );
  return rows[0]?.reference ?? null;
}

async function markFailed(paymentIntent) {
  return withTransaction(async (client) => {
    const { rows } = await client.query(
      `UPDATE orders
          SET payment_status = 'failed',
              status         = CASE WHEN status = 'pending' THEN 'cancelled' ELSE status END
        WHERE payment_intent_id = $1 AND payment_status NOT IN ('paid', 'refunded')
        RETURNING id, reference`,
      [paymentIntent.id],
    );
    if (!rows[0]) return null;

    await releaseStock(client, rows[0].id);
    return rows[0].reference;
  });
}

async function markRefunded(paymentIntentId) {
  return withTransaction(async (client) => {
    const { rows } = await client.query(
      `UPDATE orders
          SET payment_status = 'refunded',
              status         = 'cancelled'
        WHERE payment_intent_id = $1 AND payment_status <> 'refunded'
        RETURNING id, reference`,
      [paymentIntentId],
    );
    if (!rows[0]) return null;

    await releaseStock(client, rows[0].id);
    return rows[0].reference;
  });
}

/**
 * مستقبِل أحداث Stripe.
 * يُركّب في app.js قبل express.json لأن التحقّق من التوقيع يحتاج
 * نص الطلب الخام حرفًا بحرف.
 */
export const webhookHandler = asyncHandler(async (req, res) => {
  const stripe = req.app.locals.stripe;
  if (!stripe || !config.STRIPE_WEBHOOK_SECRET) {
    return res.status(503).json({ error: "الدفع الإلكتروني غير مفعّل" });
  }

  const signature = req.get("stripe-signature");
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      config.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    // توقيع غير صالح = الطلب ليس من Stripe. لا نكشف السبب ولا نعالجه.
    console.warn("[webhook] رُفض توقيع غير صالح:", err.message);
    return res.status(400).json({ error: "توقيع غير صالح" });
  }

  switch (event.type) {
    case "payment_intent.succeeded": {
      const reference = await markPaid(event.data.object);
      if (reference) console.log(`[webhook] تم دفع الطلب ${reference}`);
      break;
    }
    case "payment_intent.payment_failed":
    case "payment_intent.canceled": {
      const reference = await markFailed(event.data.object);
      if (reference) console.log(`[webhook] فشل دفع الطلب ${reference} — أُعيد المخزون`);
      break;
    }
    case "charge.refunded": {
      const intentId = event.data.object.payment_intent;
      if (intentId) {
        const reference = await markRefunded(intentId);
        if (reference) console.log(`[webhook] استُرجع مبلغ الطلب ${reference}`);
      }
      break;
    }
    default:
      // أحداث أخرى مقبولة بصمت حتى لا تُعيد Stripe إرسالها بلا نهاية
      break;
  }

  res.json({ received: true });
});

export { releaseStock };
