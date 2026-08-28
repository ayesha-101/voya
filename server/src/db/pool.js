import pg from "pg";
import { config } from "../config.js";

pg.types.setTypeParser(1700, (value) => (value === null ? null : Number(value)));
pg.types.setTypeParser(20, (value) => (value === null ? null : Number(value)));

// في بيئة Vercel Serverless نخفض الاتصالات لتجنب اختناق قاعدة البيانات
const isServerless = process.env.VERCEL === "1" || process.env.NODE_ENV === "production";

export const pool = new pg.Pool({
  connectionString: config.DATABASE_URL,
  max: isServerless ? 1 : 10,
  idleTimeoutMillis: isServerless ? 10_000 : 30_000,
  connectionTimeoutMillis: 10_000,
  ...(config.DB_SCHEMA !== "public"
    ? { options: `-c search_path=${config.DB_SCHEMA},public` }
    : {}),
});

pool.on("error", (err) => {
  console.error("خطأ غير متوقع في اتصال قاعدة البيانات:", err);
});

export const query = (text, params) => pool.query(text, params);

export async function withTransaction(fn) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
