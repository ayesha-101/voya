import { Router } from "express";
import { z } from "zod";
import { query, withTransaction } from "../db/pool.js";
import { ApiError, asyncHandler } from "../lib/errors.js";
import { priceCart } from "../lib/pricing.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

export const cartRouter = Router();

cartRouter.use(requireAuth);

const CART_SQL = `
  SELECT ci.qty, p.id, p.slug, p.name, p.name_en, p.price, p.size, p.stock,
         p.shape, p.tone_from, p.tone_to
    FROM cart_items ci
    JOIN products p ON p.id = ci.product_id
   WHERE ci.user_id = $1 AND p.is_active = TRUE
   ORDER BY ci.updated_at
`;

async function readCart(userId) {
  const { rows } = await query(CART_SQL, [userId]);
  const items = rows.map((r) => ({
    productId: r.id,
    slug: r.slug,
    name: r.name,
    nameEn: r.name_en,
    unitPrice: r.price,
    size: r.size,
    stock: r.stock,
    shape: r.shape,
    tone: [r.tone_from, r.tone_to],
    qty: r.qty,
    lineTotal: Math.round(r.price * r.qty * 100) / 100,
  }));
  return { items, ...priceCart(items), count: items.reduce((n, i) => n + i.qty, 0) };
}

const itemSchema = z.object({
  slug: z.string().trim().min(1).max(120),
  qty: z.number().int().min(1).max(99).default(1),
});

cartRouter.get("/", asyncHandler(async (req, res) => {
  res.json(await readCart(req.user.id));
}));

/** يضيف كمية إلى المنتج (يجمعها مع الموجود) دون تجاوز المخزون. */
cartRouter.post(
  "/items",
  validate({ body: itemSchema }),
  asyncHandler(async (req, res) => {
    const { slug, qty } = req.body;
    const { rows } = await query(
      "SELECT id, stock FROM products WHERE slug = $1 AND is_active = TRUE",
      [slug],
    );
    if (!rows[0]) throw ApiError.notFound("المنتج غير موجود");
    if (rows[0].stock < qty) throw ApiError.badRequest("الكمية المطلوبة تتجاوز المخزون");

    await query(
      `INSERT INTO cart_items (user_id, product_id, qty)
            VALUES ($1, $2, $3)
       ON CONFLICT (user_id, product_id)
       DO UPDATE SET qty = LEAST(cart_items.qty + EXCLUDED.qty, $4, 99),
                     updated_at = now()`,
      [req.user.id, rows[0].id, Math.min(qty, rows[0].stock), rows[0].stock],
    );
    res.status(201).json(await readCart(req.user.id));
  }),
);

/** يضبط الكمية على قيمة محدّدة، والصفر يحذف السطر. */
cartRouter.patch(
  "/items/:slug",
  validate({
    params: z.object({ slug: z.string().trim().min(1).max(120) }),
    body: z.object({ qty: z.number().int().min(0).max(99) }),
  }),
  asyncHandler(async (req, res) => {
    const { rows } = await query(
      "SELECT id, stock FROM products WHERE slug = $1 AND is_active = TRUE",
      [req.params.slug],
    );
    if (!rows[0]) throw ApiError.notFound("المنتج غير موجود");

    const { qty } = req.body;
    if (qty === 0) {
      await query("DELETE FROM cart_items WHERE user_id = $1 AND product_id = $2", [
        req.user.id,
        rows[0].id,
      ]);
    } else {
      if (qty > rows[0].stock) throw ApiError.badRequest("الكمية المطلوبة تتجاوز المخزون");
      await query(
        `INSERT INTO cart_items (user_id, product_id, qty) VALUES ($1, $2, $3)
         ON CONFLICT (user_id, product_id) DO UPDATE SET qty = $3, updated_at = now()`,
        [req.user.id, rows[0].id, qty],
      );
    }
    res.json(await readCart(req.user.id));
  }),
);

cartRouter.delete(
  "/items/:slug",
  validate({ params: z.object({ slug: z.string().trim().min(1).max(120) }) }),
  asyncHandler(async (req, res) => {
    await query(
      `DELETE FROM cart_items
        WHERE user_id = $1
          AND product_id = (SELECT id FROM products WHERE slug = $2)`,
      [req.user.id, req.params.slug],
    );
    res.json(await readCart(req.user.id));
  }),
);

cartRouter.delete("/", asyncHandler(async (req, res) => {
  await query("DELETE FROM cart_items WHERE user_id = $1", [req.user.id]);
  res.json(await readCart(req.user.id));
}));

/** يدمج سلة الزائر المحفوظة محليًا مع سلة الحساب بعد تسجيل الدخول. */
cartRouter.post(
  "/merge",
  validate({ body: z.object({ items: z.array(itemSchema).max(50) }) }),
  asyncHandler(async (req, res) => {
    await withTransaction(async (client) => {
      for (const item of req.body.items) {
        const { rows } = await client.query(
          "SELECT id, stock FROM products WHERE slug = $1 AND is_active = TRUE",
          [item.slug],
        );
        if (!rows[0]) continue; // نتجاهل المنتجات المحذوفة بدل رفض الدمج كله
        await client.query(
          `INSERT INTO cart_items (user_id, product_id, qty) VALUES ($1, $2, $3)
           ON CONFLICT (user_id, product_id)
           DO UPDATE SET qty = LEAST(GREATEST(cart_items.qty, EXCLUDED.qty), $4, 99),
                         updated_at = now()`,
          [req.user.id, rows[0].id, Math.min(item.qty, rows[0].stock), rows[0].stock],
        );
      }
    });
    res.json(await readCart(req.user.id));
  }),
);

export { readCart };
