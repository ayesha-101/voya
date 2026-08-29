import bcrypt from "bcryptjs";
import { pool, withTransaction } from "./pool.js";
import { config } from "../config.js";
import { categories, products } from "./catalog.js";

const users = [
  {
    name: "مدير المتجر",
    email: "admin@byvoyastore.com",
    phone: "+971500000000",
    password: "Admin@12345",
    role: "admin",
  },
  {
    name: "نورة العتيبي",
    email: "noura@example.com",
    phone: "+971501234567",
    password: "Customer@123",
    role: "customer",
  },
];

try {
  await withTransaction(async (client) => {
    await client.query("TRUNCATE order_items, orders, cart_items, products, categories, users RESTART IDENTITY CASCADE");

    const categoryId = new Map();
    for (const [i, c] of categories.entries()) {
      const { rows } = await client.query(
        `INSERT INTO categories (slug, name, name_en, blurb, tone, position)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        [c.slug, c.name, c.nameEn ?? "", c.blurb, c.tone, i],
      );
      categoryId.set(c.slug, rows[0].id);
    }
    console.log(`✓ ${categories.length} تصنيفات`);

    for (const p of products) {
      await client.query(
        `INSERT INTO products
           (slug, name, name_en, category_id, price, compare_at, size, rating, reviews,
            badge, short, description, how_to_use, benefits, ingredients,
            shape, tone_from, tone_to, stock)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)`,
        [
          p.slug, p.name, p.nameEn, categoryId.get(p.category), p.price,
          p.compareAt ?? null, p.size, p.rating, p.reviews, p.badge ?? null,
          p.short, p.description, p.howToUse ?? "", p.benefits, p.ingredients,
          p.shape, p.tone[0], p.tone[1], p.stock,
        ],
      );
    }
    console.log(`✓ ${products.length} منتجًا`);

    for (const u of users) {
      const hash = await bcrypt.hash(u.password, config.BCRYPT_ROUNDS);
      await client.query(
        `INSERT INTO users (name, email, phone, password_hash, role)
         VALUES ($1, $2, $3, $4, $5)`,
        [u.name, u.email, u.phone, hash, u.role],
      );
    }
    console.log(`✓ ${users.length} مستخدمين`);
  });

  console.log("\nحسابات التجربة:");
  for (const u of users) console.log(`  ${u.role.padEnd(9)} ${u.email} / ${u.password}`);
} catch (err) {
  console.error("✗ فشلت تعبئة البيانات:", err.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
