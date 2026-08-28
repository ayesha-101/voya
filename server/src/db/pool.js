import pg from "pg";
import { config } from "../config.js";

// نُعيد الأرقام العشرية (numeric) كأرقام JS بدل نصوص حتى تُحسب الأسعار مباشرة
pg.types.setTypeParser(1700, (value) => (value === null ? null : Number(value)));
pg.types.setTypeParser(20, (value) => (value === null ? null : Number(value)));

export const pool = new pg.Pool({
  connectionString: config.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
});

pool.on("error", (err) => {
  console.error("خطأ غير متوقع في اتصال قاعدة البيانات:", err);
});

export const query = (text, params) => pool.query(text, params);

/** ينفّذ دالة داخل معاملة واحدة مع تراجع تلقائي عند أي خطأ. */
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
