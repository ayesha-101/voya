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
import { paymentsRouter, webhookHandler } from "./routes/payments.js";
import { createStripeClient } from "./lib/payments.js";

export function createApp({ stripe = createStripeClient() } = {}) {
  const app = express();

  app.locals.stripe = stripe;

  if (config.isProd) {
    app.set("trust proxy", 1);
  }
  app.disable("x-powered-by");

  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: { policy: "cross-origin" },
    }),
  );

  app.use(
    cors({
      origin(origin, cb) {
        if (!origin || config.corsOrigins.includes(origin)) return cb(null, true);
        cb(new Error(`أصل غير مسموح به: ${origin}`));
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    }),
  );

  app.post(
    "/api/payments/webhook",
    express.raw({ type: "application/json", limit: "1mb" }),
    webhookHandler,
  );

  app.use(express.json({ limit: "100kb" }));
  app.use(cookieParser());

  if (config.NODE_ENV !== "test") {
    app.use(morgan(config.isProd ? "combined" : "dev"));
  }

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
  app.use("/api/payments", paymentsRouter);
  app.use("/api/admin", adminRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
