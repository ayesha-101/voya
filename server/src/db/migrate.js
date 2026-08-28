import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { pool } from "./pool.js";

const here = dirname(fileURLToPath(import.meta.url));
const fresh = process.argv.includes("--fresh");

const DROP = `
  DROP TABLE IF EXISTS order_items, orders, cart_items, products, categories, users CASCADE;
  DROP FUNCTION IF EXISTS touch_updated_at CASCADE;
`;

try {
  if (fresh) {
    console.log("… حذف الجداول القديمة (--fresh)");
    await pool.query(DROP);
  }
  const sql = await readFile(join(here, "schema.sql"), "utf8");
  await pool.query(sql);
  console.log("✓ تم تطبيق المخطّط بنجاح");
} catch (err) {
  console.error("✗ فشلت الهجرة:", err.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
