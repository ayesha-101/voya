import { Router } from "express";
import bcrypt from "bcryptjs";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { config } from "../config.js";
import { query } from "../db/pool.js";
import { ApiError, asyncHandler } from "../lib/errors.js";
import { AUTH_COOKIE, cookieOptions, signToken } from "../lib/tokens.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

export const authRouter = Router();

// حماية من تخمين كلمات المرور: 10 محاولات لكل IP كل 15 دقيقة
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: config.NODE_ENV === "test" ? 1000 : 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: { error: "محاولات كثيرة جدًا. حاول مرة أخرى بعد 15 دقيقة." },
});

const password = z
  .string()
  .min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل")
  .max(128)
  .regex(/[a-z]/, "يجب أن تحتوي على حرف صغير")
  .regex(/[A-Z]/, "يجب أن تحتوي على حرف كبير")
  .regex(/[0-9]/, "يجب أن تحتوي على رقم");

const registerSchema = z.object({
  name: z.string().trim().min(2, "الاسم قصير جدًا").max(80),
  email: z.email("بريد إلكتروني غير صالح").max(160).toLowerCase(),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[\d\s-]{7,20}$/, "رقم جوال غير صالح")
    .optional(),
  password,
});

const loginSchema = z.object({
  email: z.email("بريد إلكتروني غير صالح").toLowerCase(),
  password: z.string().min(1, "كلمة المرور مطلوبة"),
});

const publicUser = (u) => ({
  id: u.id,
  name: u.name,
  email: u.email,
  phone: u.phone,
  role: u.role,
});

authRouter.post(
  "/register",
  authLimiter,
  validate({ body: registerSchema }),
  asyncHandler(async (req, res) => {
    const { name, email, phone, password: raw } = req.body;

    const exists = await query("SELECT 1 FROM users WHERE email = $1", [email]);
    if (exists.rowCount > 0) {
      throw ApiError.conflict("هذا البريد الإلكتروني مسجّل بالفعل");
    }

    const hash = await bcrypt.hash(raw, config.BCRYPT_ROUNDS);
    const { rows } = await query(
      `INSERT INTO users (name, email, phone, password_hash)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, phone, role`,
      [name, email, phone ?? null, hash],
    );

    const user = rows[0];
    const token = signToken(user);
    res.cookie(AUTH_COOKIE, token, cookieOptions);
    res.status(201).json({ user: publicUser(user), token });
  }),
);

authRouter.post(
  "/login",
  authLimiter,
  validate({ body: loginSchema }),
  asyncHandler(async (req, res) => {
    const { email, password: raw } = req.body;

    const { rows } = await query(
      "SELECT id, name, email, phone, role, password_hash FROM users WHERE email = $1",
      [email],
    );
    const user = rows[0];

    // نُجري المقارنة دائمًا بتجزئة وهمية عند عدم وجود المستخدم حتى لا
    // يكشف فارق التوقيت أي البُرد مسجّلة فعلًا.
    const hash = user?.password_hash ?? "$2b$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinva";
    const ok = await bcrypt.compare(raw, hash);

    if (!user || !ok) {
      throw ApiError.unauthorized("البريد الإلكتروني أو كلمة المرور غير صحيحة");
    }

    const token = signToken(user);
    res.cookie(AUTH_COOKIE, token, cookieOptions);
    res.json({ user: publicUser(user), token });
  }),
);

authRouter.post("/logout", (_req, res) => {
  res.clearCookie(AUTH_COOKIE, { ...cookieOptions, maxAge: undefined });
  res.json({ ok: true });
});

authRouter.get("/me", requireAuth, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

authRouter.patch(
  "/me",
  requireAuth,
  validate({
    body: z.object({
      name: z.string().trim().min(2).max(80).optional(),
      phone: z.string().trim().regex(/^\+?[\d\s-]{7,20}$/).optional(),
    }),
  }),
  asyncHandler(async (req, res) => {
    const { name, phone } = req.body;
    const { rows } = await query(
      `UPDATE users
          SET name  = COALESCE($2, name),
              phone = COALESCE($3, phone)
        WHERE id = $1
      RETURNING id, name, email, phone, role`,
      [req.user.id, name ?? null, phone ?? null],
    );
    res.json({ user: publicUser(rows[0]) });
  }),
);
