import { createApp } from "./app.js";
import { config } from "./config.js";
import { pool } from "./db/pool.js";

const app = createApp();

const server = app.listen(config.PORT, () => {
  console.log(`\n✓ واجهة ڤويا البرمجية تعمل على http://localhost:${config.PORT}`);
  console.log(`  البيئة: ${config.NODE_ENV}`);
  console.log(`  الأصول المسموحة: ${config.corsOrigins.join(", ")}\n`);
});

async function shutdown(signal) {
  console.log(`\n${signal} — إيقاف الخادم…`);
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
  // إن لم يُغلق خلال 10 ثوانٍ نُنهي بالقوة
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
