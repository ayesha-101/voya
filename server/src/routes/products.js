import { Router } from "express";
import { z } from "zod";
import { query } from "../db/pool.js";
import { ApiError, asyncHandler } from "../lib/errors.js";
import { toProduct } from "../lib/serialize.js";
import { validate } from "../middleware/validate.js";

export const productsRouter = Router();

const SELECT = `
  SELECT p.*, c.slug AS category_slug, c.name AS category_name, c.name_en AS category_name_en
    FROM products p
    JOIN categories c ON c.id = p.category_id
`;

const SORTS = {
  featured: "p.reviews DESC, p.rating DESC",
  "price-asc": "p.price ASC",
  "price-desc": "p.price DESC",
  rating: "p.rating DESC, p.reviews DESC",
  discount: "((p.compare_at - p.price) / p.compare_at) DESC",
  newest: "p.created_at DESC",
};

const listSchema = z.object({
  category: z.string().trim().max(60).optional(),
  q: z.string().trim().max(120).optional(),
  sort: z.enum(Object.keys(SORTS)).default("featured"),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

productsRouter.get(
  "/",
  validate({ query: listSchema }),
  asyncHandler(async (req, res) => {
    const { category, q, sort, limit, offset } = req.validatedQuery;

    const where = ["p.is_active = TRUE"];
    const params = [];

    if (category && category !== "all") {
      params.push(category);
      where.push(`c.slug = $${params.length}`);
    }
    if (q) {
      params.push(`%${q}%`);
      const i = params.length;
      where.push(
        `(p.name ILIKE $${i} OR p.name_en ILIKE $${i} OR p.short ILIKE $${i}
          OR p.description ILIKE $${i} OR array_to_string(p.ingredients, ' ') ILIKE $${i})`,
      );
    }
    // ترتيب "أعلى خصم" لا معنى له للمنتجات بلا سعر مقارنة
    if (sort === "discount") where.push("p.compare_at IS NOT NULL");

    const clause = `WHERE ${where.join(" AND ")}`;

    const [list, count] = await Promise.all([
      query(
        `${SELECT} ${clause} ORDER BY ${SORTS[sort]} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
        [...params, limit, offset],
      ),
      query(`SELECT COUNT(*)::int AS total FROM products p JOIN categories c ON c.id = p.category_id ${clause}`, params),
    ]);

    res.json({
      products: list.rows.map(toProduct),
      total: count.rows[0].total,
      limit,
      offset,
    });
  }),
);

productsRouter.get(
  "/:slug",
  validate({ params: z.object({ slug: z.string().trim().min(1).max(120) }) }),
  asyncHandler(async (req, res) => {
    const { rows } = await query(`${SELECT} WHERE p.slug = $1 AND p.is_active = TRUE`, [
      req.params.slug,
    ]);
    if (!rows[0]) throw ApiError.notFound("المنتج غير موجود");

    const product = toProduct(rows[0]);

    // منتجات مقترحة: من نفس التصنيف أولًا ثم الأكثر مبيعًا
    const { rows: rel } = await query(
      `${SELECT}
        WHERE p.is_active = TRUE AND p.slug <> $1
        ORDER BY (c.slug = $2) DESC, p.reviews DESC
        LIMIT 4`,
      [product.slug, product.category],
    );

    res.json({ product, related: rel.map(toProduct) });
  }),
);
