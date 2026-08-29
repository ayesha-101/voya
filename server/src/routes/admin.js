import { Router } from "express";
import { z } from "zod";
import { query } from "../db/pool.js";
import { ApiError, asyncHandler } from "../lib/errors.js";
import { toOrder, toProduct } from "../lib/serialize.js";
import { requireAdmin } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

export const adminRouter = Router();

adminRouter.use(requireAdmin);

const SELECT = `
  SELECT p.*, c.slug AS category_slug, c.name AS category_name, c.name_en AS category_name_en
    FROM products p JOIN categories c ON c.id = p.category_id
`;

const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/, "لون غير صالح (مثال: #c25b8a)");

const productBody = z.object({
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9-]+$/, "المعرّف يقبل حروفًا إنجليزية صغيرة وأرقامًا وشرطات فقط")
    .min(2)
    .max(120),
  name: z.string().trim().min(2).max(160),
  nameEn: z.string().trim().max(160).default(""),
  category: z.string().trim().min(1).max(60),
  price: z.number().positive().max(1_000_000),
  compareAt: z.number().positive().max(1_000_000).nullable().optional(),
  size: z.string().trim().max(60).default(""),
  rating: z.number().min(0).max(5).default(5),
  reviews: z.number().int().min(0).default(0),
  badge: z.string().trim().max(40).nullable().optional(),
  short: z.string().trim().max(300).default(""),
  description: z.string().trim().max(4000).default(""),
  howToUse: z.string().trim().max(2000).default(""),
  benefits: z.array(z.string().trim().max(120)).max(12).default([]),
  ingredients: z.array(z.string().trim().max(120)).max(20).default([]),
  shape: z.enum(["bottle", "jar", "tube", "box", "pouch"]).default("bottle"),
  tone: z.tuple([hex, hex]).default(["#c25b8a", "#6b2a48"]),
  stock: z.number().int().min(0).max(100_000).default(0),
  isActive: z.boolean().default(true),
});

async function categoryIdOf(slug) {
  const { rows } = await query("SELECT id FROM categories WHERE slug = $1", [slug]);
  if (!rows[0]) throw ApiError.badRequest(`التصنيف غير موجود: ${slug}`);
  return rows[0].id;
}

// ------------------------------------------------------------ إحصاءات
adminRouter.get(
  "/stats",
  asyncHandler(async (_req, res) => {
    const [totals, byStatus, recent, lowStock] = await Promise.all([
      query(`
        SELECT
          (SELECT COUNT(*)::int FROM products WHERE is_active)            AS products,
          (SELECT COUNT(*)::int FROM orders)                              AS orders,
          (SELECT COUNT(*)::int FROM users WHERE role = 'customer')       AS customers,
          -- الإيراد يحتسب الدفع عند الاستلام غير الملغى، والبطاقة المدفوعة فعلًا
          (SELECT COALESCE(SUM(total), 0) FROM orders
            WHERE status <> 'cancelled'
              AND (payment_method <> 'card' OR payment_status = 'paid'))  AS revenue,
          (SELECT COUNT(*)::int FROM orders
            WHERE payment_method = 'card' AND payment_status = 'processing') AS awaiting_payment
      `),
      query("SELECT status, COUNT(*)::int AS count FROM orders GROUP BY status"),
      query("SELECT * FROM orders ORDER BY created_at DESC LIMIT 5"),
      query(`${SELECT} WHERE p.stock <= 10 AND p.is_active ORDER BY p.stock LIMIT 5`),
    ]);

    res.json({
      totals: totals.rows[0],
      byStatus: Object.fromEntries(byStatus.rows.map((r) => [r.status, r.count])),
      recentOrders: recent.rows.map((o) => toOrder(o)),
      lowStock: lowStock.rows.map(toProduct),
    });
  }),
);

// ------------------------------------------------------------ المنتجات
adminRouter.get(
  "/products",
  validate({
    query: z.object({
      q: z.string().trim().max(120).optional(),
      limit: z.coerce.number().int().min(1).max(200).default(100),
    }),
  }),
  asyncHandler(async (req, res) => {
    const { q, limit } = req.validatedQuery;
    const params = [];
    let where = "";
    if (q) {
      params.push(`%${q}%`);
      where = "WHERE p.name ILIKE $1 OR p.slug ILIKE $1";
    }
    params.push(limit);
    const { rows } = await query(
      `${SELECT} ${where} ORDER BY p.created_at DESC LIMIT $${params.length}`,
      params,
    );
    res.json({ products: rows.map(toProduct) });
  }),
);

adminRouter.post(
  "/products",
  validate({ body: productBody }),
  asyncHandler(async (req, res) => {
    const b = req.body;
    if (b.compareAt != null && b.compareAt <= b.price) {
      throw ApiError.badRequest("سعر المقارنة يجب أن يكون أعلى من السعر");
    }
    const categoryId = await categoryIdOf(b.category);

    const { rows } = await query(
      `INSERT INTO products
         (slug, name, name_en, category_id, price, compare_at, size, rating, reviews,
          badge, short, description, how_to_use, benefits, ingredients,
          shape, tone_from, tone_to, stock, is_active)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)
       RETURNING id`,
      [
        b.slug, b.name, b.nameEn, categoryId, b.price, b.compareAt ?? null, b.size,
        b.rating, b.reviews, b.badge ?? null, b.short, b.description, b.howToUse,
        b.benefits, b.ingredients, b.shape, b.tone[0], b.tone[1], b.stock, b.isActive,
      ],
    );
    const { rows: full } = await query(`${SELECT} WHERE p.id = $1`, [rows[0].id]);
    res.status(201).json({ product: toProduct(full[0]) });
  }),
);

adminRouter.put(
  "/products/:slug",
  validate({
    params: z.object({ slug: z.string().trim().min(1).max(120) }),
    body: productBody,
  }),
  asyncHandler(async (req, res) => {
    const b = req.body;
    if (b.compareAt != null && b.compareAt <= b.price) {
      throw ApiError.badRequest("سعر المقارنة يجب أن يكون أعلى من السعر");
    }
    const categoryId = await categoryIdOf(b.category);

    const { rows } = await query(
      `UPDATE products SET
         slug=$2, name=$3, name_en=$4, category_id=$5, price=$6, compare_at=$7, size=$8,
         rating=$9, reviews=$10, badge=$11, short=$12, description=$13, how_to_use=$14,
         benefits=$15, ingredients=$16, shape=$17, tone_from=$18, tone_to=$19,
         stock=$20, is_active=$21
       WHERE slug = $1
       RETURNING id`,
      [
        req.params.slug, b.slug, b.name, b.nameEn, categoryId, b.price, b.compareAt ?? null,
        b.size, b.rating, b.reviews, b.badge ?? null, b.short, b.description, b.howToUse,
        b.benefits, b.ingredients, b.shape, b.tone[0], b.tone[1], b.stock, b.isActive,
      ],
    );
    if (!rows[0]) throw ApiError.notFound("المنتج غير موجود");

    const { rows: full } = await query(`${SELECT} WHERE p.id = $1`, [rows[0].id]);
    res.json({ product: toProduct(full[0]) });
  }),
);

/**
 * الحذف أرشفة (is_active = false) وليس حذفًا فعليًا، حتى تبقى الطلبات
 * التاريخية سليمة. الحذف النهائي متاح بـ ?hard=true وينجح فقط إن لم
 * يُطلب المنتج من قبل.
 */
adminRouter.delete(
  "/products/:slug",
  validate({
    params: z.object({ slug: z.string().trim().min(1).max(120) }),
    query: z.object({ hard: z.enum(["true", "false"]).default("false") }),
  }),
  asyncHandler(async (req, res) => {
    if (req.validatedQuery.hard === "true") {
      const { rows } = await query(
        `SELECT p.id, COUNT(oi.id)::int AS ordered
           FROM products p LEFT JOIN order_items oi ON oi.product_id = p.id
          WHERE p.slug = $1 GROUP BY p.id`,
        [req.params.slug],
      );
      if (!rows[0]) throw ApiError.notFound("المنتج غير موجود");
      if (rows[0].ordered > 0) {
        throw ApiError.conflict(
          "لا يمكن الحذف النهائي لمنتج مرتبط بطلبات سابقة — استخدم الأرشفة",
        );
      }
      await query("DELETE FROM products WHERE id = $1", [rows[0].id]);
      return res.json({ deleted: true, slug: req.params.slug });
    }

    const { rows } = await query(
      "UPDATE products SET is_active = FALSE WHERE slug = $1 RETURNING slug",
      [req.params.slug],
    );
    if (!rows[0]) throw ApiError.notFound("المنتج غير موجود");
    res.json({ archived: true, slug: rows[0].slug });
  }),
);

// ------------------------------------------------------------ الطلبات
adminRouter.get(
  "/orders",
  validate({
    query: z.object({
      status: z
        .enum(["pending", "confirmed", "shipped", "delivered", "cancelled"])
        .optional(),
      paymentStatus: z
        .enum(["unpaid", "processing", "paid", "failed", "refunded"])
        .optional(),
      limit: z.coerce.number().int().min(1).max(200).default(50),
    }),
  }),
  asyncHandler(async (req, res) => {
    const { status, paymentStatus, limit } = req.validatedQuery;
    const params = [];
    const filters = [];
    if (status) {
      params.push(status);
      filters.push(`status = $${params.length}`);
    }
    if (paymentStatus) {
      params.push(paymentStatus);
      filters.push(`payment_status = $${params.length}`);
    }
    const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
    params.push(limit);
    const { rows } = await query(
      `SELECT * FROM orders ${where} ORDER BY created_at DESC LIMIT $${params.length}`,
      params,
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

adminRouter.patch(
  "/orders/:reference/status",
  validate({
    params: z.object({ reference: z.string().trim().min(4).max(40) }),
    body: z.object({
      status: z.enum(["pending", "confirmed", "shipped", "delivered", "cancelled"]),
    }),
  }),
  asyncHandler(async (req, res) => {
    const { rows } = await query(
      "UPDATE orders SET status = $2 WHERE reference = $1 RETURNING *",
      [req.params.reference, req.body.status],
    );
    if (!rows[0]) throw ApiError.notFound("الطلب غير موجود");
    res.json({ order: toOrder(rows[0]) });
  }),
);
