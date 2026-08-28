import { query } from "../db/pool.js";
import { ApiError, asyncHandler } from "../lib/errors.js";
import { AUTH_COOKIE, verifyToken } from "../lib/tokens.js";

function readToken(req) {
  const header = req.get("authorization");
  if (header?.startsWith("Bearer ")) return header.slice(7).trim();
  return req.cookies?.[AUTH_COOKIE] ?? null;
}

/** يملأ req.user إن وُجد توكن صالح، ولا يمنع الطلب إن لم يوجد. */
export const attachUser = asyncHandler(async (req, _res, next) => {
  const token = readToken(req);
  if (!token) return next();

  let payload;
  try {
    payload = verifyToken(token);
  } catch {
    return next(); // توكن منتهٍ أو تالف — نتعامل مع الطلب كزائر
  }

  const { rows } = await query(
    "SELECT id, name, email, phone, role FROM users WHERE id = $1",
    [payload.sub],
  );
  if (rows[0]) req.user = rows[0];
  next();
});

/** يمنع المتابعة بدون تسجيل دخول. */
export function requireAuth(req, _res, next) {
  if (!req.user) return next(ApiError.unauthorized());
  next();
}

/** يمنع المتابعة إن لم يكن المستخدم مديرًا. */
export function requireAdmin(req, _res, next) {
  if (!req.user) return next(ApiError.unauthorized());
  if (req.user.role !== "admin") return next(ApiError.forbidden());
  next();
}
