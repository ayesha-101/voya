import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { config } from "./config.js";
import { attachUser } from "./middleware/auth.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { authRouter } from "./routes/auth.js";
import { productsRouter } from "./routes/products.js";
import { categoriesRouter } from "./routes/categories.js";
import { cartRouter } from "./routes/cart.js";
import { ordersRouter } from "./routes/orders.js";
import { adminRouter } from "./routes/admin.js";

export function createApp() {
  const app = express();

  // نثق بالوكيل الأول فقط حتى يعمل تحديد المعدّل على IP الحقيقي
  // دون أن يتمكّن العميل من تزوير X-Forwarded-For.
  app.set("trust proxy", 1);
  app.disable("x-powered-by");

  app.use(
    helmet({
      // واجهة برمجية JSON فقط — لا تُقدّم HTML، فلا حاجة لسياسة محتوى الصفحة
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: { policy: "cross-origin" },
    }),
  );

  app.use(
    cors({
      origin(origin, cb) {
        // نسمح بالطلبات بلا Origin (curl، تطبيقات الجوال، الفحوصات الصحية)
        if (!origin || config.corsOrigins.includes(origin)) return cb(null, true);
        cb(new Error(`أصل غير مسموح به: ${origin}`));
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    }),
  );

  app.use(express.json({ limit: "100kb" }));
  app.use(cookieParser());

  if (config.NODE_ENV !== "test") {
    app.use(morgan(config.isProd ? "combined" : "dev"));
  }

  // سقف عام لكل الواجهة يحدّ من إساءة الاستخدام
  app.use(
    rateLimit({
      windowMs: 60_000,
      limit: config.NODE_ENV === "test" ? 100_000 : 300,
      standardHeaders: "draft-7",
      legacyHeaders: false,
      message: { error: "طلبات كثيرة جدًا. حاول بعد قليل." },
    }),
  );

  app.get("/api/health", (_req, res) =>
    res.json({ ok: true, env: config.NODE_ENV, time: new Date().toISOString() }),
  );

  app.use(attachUser);

  app.use("/api/auth", authRouter);
  app.use("/api/products", productsRouter);
  app.use("/api/categories", categoriesRouter);
  app.use("/api/cart", cartRouter);
  app.use("/api/orders", ordersRouter);
  app.use("/api/admin", adminRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
