import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().min(0).default(4000),
  DATABASE_URL: z.string().min(1, "DATABASE_URL مطلوب — انسخ .env.example إلى .env"),
  DB_SCHEMA: z
    .string()
    .regex(/^[a-z_][a-z0-9_]*$/, "اسم المخطّط يقبل حروفًا إنجليزية صغيرة وأرقامًا وشرطة سفلية")
    .max(63)
    .default("public"),
  JWT_SECRET: z
    .string()
    .min(32, "JWT_SECRET يجب أن يكون 32 حرفًا على الأقل"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  CORS_ORIGINS: z.string().default("http://localhost:3000"),
  COOKIE_SECURE: z
    .string()
    .default("false")
    .transform((v) => v === "true"),
  BCRYPT_ROUNDS: z.coerce.number().int().min(4).max(15).default(12),
  // Stripe اختياري — يقبل فاضي أو يبدأ بالبادئة الصحيحة
  STRIPE_SECRET_KEY: z.union([
    z.string().startsWith("sk_"),
    z.literal(""),
  ]).optional(),
  STRIPE_PUBLISHABLE_KEY: z.union([
    z.string().startsWith("pk_"),
    z.literal(""),
  ]).optional(),
  STRIPE_WEBHOOK_SECRET: z.union([
    z.string().startsWith("whsec_"),
    z.literal(""),
  ]).optional(),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
    .join("\n");
  const message = `إعدادات البيئة غير صالحة:\n${issues}`;
  console.error(`\n✗ ${message}\n`);
  throw new Error(message);
}

export const config = {
  ...parsed.data,
  paymentsEnabled: Boolean(parsed.data.STRIPE_SECRET_KEY && parsed.data.STRIPE_SECRET_KEY.length > 0),
  corsOrigins: parsed.data.CORS_ORIGINS.split(",")
    .map((s) => s.trim())
    .filter(Boolean),
  isProd: parsed.data.NODE_ENV === "production",
};
