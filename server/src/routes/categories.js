import { Router } from "express";
import { query } from "../db/pool.js";
import { asyncHandler } from "../lib/errors.js";

export const categoriesRouter = Router();

categoriesRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const { rows } = await query(
      `SELECT c.slug, c.name, c.name_en AS "nameEn", c.blurb, c.tone,
              COUNT(p.id) FILTER (WHERE p.is_active) ::int AS product_count
         FROM categories c
         LEFT JOIN products p ON p.category_id = c.id
        GROUP BY c.id
        ORDER BY c.position, c.id`,
    );
    res.json({ categories: rows.map((r) => ({ ...r, productCount: r.product_count })) });
  }),
);
