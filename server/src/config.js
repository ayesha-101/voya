import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  DATABASE_URL: z.string().min(1, "DATABASE_URL مطلوب — انسخ .env.example إلى .env"),
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

  // الدفع الإلكتروني — اختياري. بدون مفتاح سري يبقى المتجر يعمل
  // بالدفع عند الاستلام فقط ويُرفض خيار البطاقة صراحةً.
  STRIPE_SECRET_KEY: z.string().startsWith("sk_").optional(),
  STRIPE_PUBLISHABLE_KEY: z.string().startsWith("pk_").optional(),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith("whsec_").optional(),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
    .join("\n");
  const message = `إعدادات البيئة غير صالحة:\n${issues}`;
  console.error(`\n✗ ${message}\n`);
  // في بيئة بلا خادم لا يوجد ما يُنهى، والرمي يُظهر السبب في السجلات
  // بدل انهيار غامض؛ محليًا يوقف الإقلاع بنفس الوضوح.
  throw new Error(message);
}

export const config = {
  ...parsed.data,
  paymentsEnabled: Boolean(parsed.data.STRIPE_SECRET_KEY),
  corsOrigins: parsed.data.CORS_ORIGINS.split(",")
    .map((s) => s.trim())
    .filter(Boolean),
  isProd: parsed.data.NODE_ENV === "production",
};
