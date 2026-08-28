import { Router } from "express";
import { randomBytes } from "node:crypto";
import { z } from "zod";
import { query, withTransaction } from "../db/pool.js";
import { ApiError, asyncHandler } from "../lib/errors.js";
import { priceCart } from "../lib/pricing.js";
import { toOrder } from "../lib/serialize.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

export const ordersRouter = Router();

const EMIRATES = [
  "دبي", "أبوظبي", "الشارقة", "عجمان", "رأس الخيمة", "الفجيرة", "أم القيوين",
];

const createSchema = z.object({
  customer: z.object({
    name: z.string().trim().min(2, "الاسم قصير جدًا").max(80),
    email: z.email("بريد إلكتروني غير صالح").max(160),
    phone: z.string().trim().regex(/^\+?[\d\s-]{7,20}$/, "رقم جوال غير صالح"),
  }),
  shipping: z.object({
    emirate: z.enum(EMIRATES, { message: "اختر إمارة صالحة" }),
    area: z.string().trim().min(2, "المنطقة مطلوبة").max(120),
    address: z.string().trim().min(5, "العنوان قصير جدًا").max(500),
    notes: z.string().trim().max(500).default(""),
  }),
  paymentMethod: z.enum(["cod", "card"]).default("cod"),
  // الزائر يرسل سلته؛ المستخدم المسجّل تُقرأ سلته من قاعدة البيانات
  items: z
    .array(
      z.object({
        slug: z.string().trim().min(1).max(120),
        qty: z.number().int().min(1).max(99),
      }),
    )
    .max(50)
    .optional(),
});

const reference = () => `VY-${randomBytes(4).toString("hex").toUpperCase()}`;

ordersRouter.post(
  "/",
  validate({ body: createSchema }),
  asyncHandler(async (req, res) => {
    const { customer, shipping, paymentMethod } = req.body;

    if (paymentMethod === "card") {
      throw ApiError.badRequest(
        "الدفع بالبطاقة غير مفعّل بعد — اختر الدفع عند الاستلام",
      );
    }

    const order = await withTransaction(async (client) => {
      // مصدر السطور: سلة الحساب للمستخدم المسجّل، أو ما أرسله الزائر
      let requested;
      if (req.user) {
        const { rows } = await client.query(
          `SELECT p.slug, ci.qty FROM cart_items ci
             JOIN products p ON p.id = ci.product_id
            WHERE ci.user_id = $1`,
          [req.user.id],
        );
        requested = rows;
      } else {
        requested = req.body.items ?? [];
      }

      if (requested.length === 0) throw ApiError.badRequest("السلة فارغة");

      // نقفل صفوف المنتجات حتى لا يبيع طلبان متزامنان آخر قطعة في المخزون
      const slugs = requested.map((i) => i.slug);
      const { rows: found } = await client.query(
        `SELECT id, slug, name, price, stock
           FROM products
          WHERE slug = ANY($1::text[]) AND is_active = TRUE
          ORDER BY id
          FOR UPDATE`,
        [slugs],
      );

      const bySlug = new Map(found.map((p) => [p.slug, p]));
      const lines = [];

      for (const item of requested) {
        const product = bySlug.get(item.slug);
        if (!product) throw ApiError.badRequest(`المنتج غير متوفر: ${item.slug}`);
        if (product.stock < item.qty) {
          throw ApiError.conflict(
            `الكمية المتوفرة من «${product.name}» هي ${product.stock} فقط`,
          );
        }
        lines.push({
          productId: product.id,
          slug: product.slug,
          name: product.name,
          // السعر يُقرأ من قاعدة البيانات دائمًا، فلا يستطيع العميل تحديده
          unitPrice: product.price,
          qty: item.qty,
          lineTotal: Math.round(product.price * item.qty * 100) / 100,
        });
      }

      const { subtotal, shippingFee, total } = priceCart(lines);

      const { rows: created } = await client.query(
        `INSERT INTO orders
           (reference, user_id, customer_name, customer_email, customer_phone,
            emirate, area, address, notes, payment_method, subtotal, shipping_fee, total)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
         RETURNING *`,
        [
          reference(), req.user?.id ?? null, customer.name, customer.email, customer.phone,
          shipping.emirate, shipping.area, shipping.address, shipping.notes,
          paymentMethod, subtotal, shippingFee, total,
        ],
      );
      const row = created[0];

      for (const line of lines) {
        await client.query(
          `INSERT INTO order_items
             (order_id, product_id, product_slug, product_name, unit_price, qty, line_total)
           VALUES ($1,$2,$3,$4,$5,$6,$7)`,
          [row.id, line.productId, line.slug, line.name, line.unitPrice, line.qty, line.lineTotal],
        );
        await client.query("UPDATE products SET stock = stock - $2 WHERE id = $1", [
          line.productId,
          line.qty,
        ]);
      }

      if (req.user) {
        await client.query("DELETE FROM cart_items WHERE user_id = $1", [req.user.id]);
      }

      return toOrder(
        row,
        lines.map((l) => ({
          product_id: l.productId,
          product_slug: l.slug,
          product_name: l.name,
          unit_price: l.unitPrice,
          qty: l.qty,
          line_total: l.lineTotal,
        })),
      );
    });

    res.status(201).json({ order });
  }),
);

ordersRouter.get(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { rows } = await query(
      "SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50",
      [req.user.id],
    );
    if (rows.length === 0) return res.json({ orders: [] });

    const { rows: items } = await query(
      "SELECT * FROM order_items WHERE order_id = ANY($1::bigint[])",
      [rows.map((o) => o.id)],
    );
    const byOrder = new Map();
    for (const i of items) {
      if (!byOrder.has(i.order_id)) byOrder.set(i.order_id, []);
      byOrder.get(i.order_id).push(i);
    }

    res.json({ orders: rows.map((o) => toOrder(o, byOrder.get(o.id) ?? [])) });
  }),
);

/** تتبّع الطلب — متاح للزائر بالمرجع + البريد، وللمالك مباشرة. */
ordersRouter.get(
  "/:reference",
  validate({
    params: z.object({ reference: z.string().trim().min(4).max(40) }),
    query: z.object({ email: z.email().optional() }),
  }),
  asyncHandler(async (req, res) => {
    const { rows } = await query("SELECT * FROM orders WHERE reference = $1", [
      req.params.reference,
    ]);
    const order = rows[0];
    if (!order) throw ApiError.notFound("الطلب غير موجود");

    const isOwner = req.user && order.user_id === req.user.id;
    const isAdmin = req.user?.role === "admin";
    const emailMatches =
      req.validatedQuery.email &&
      req.validatedQuery.email.toLowerCase() === order.customer_email.toLowerCase();

    if (!isOwner && !isAdmin && !emailMatches) {
      throw ApiError.forbidden("لا تملك صلاحية عرض هذا الطلب");
    }

    const { rows: items } = await query(
      "SELECT * FROM order_items WHERE order_id = $1",
      [order.id],
    );
    res.json({ order: toOrder(order, items) });
  }),
);
