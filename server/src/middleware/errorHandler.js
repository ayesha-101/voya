import { config } from "../config.js";
import { ApiError } from "../lib/errors.js";

export function notFoundHandler(req, _res, next) {
  next(ApiError.notFound(`المسار غير موجود: ${req.method} ${req.originalUrl}`));
}

// Express يميّز معالج الأخطاء بوجود أربع وسائط، فالوسيطة الأخيرة مطلوبة
// حتى لو لم تُستخدم.
export function errorHandler(err, _req, res, _next) {
  // انتهاكات قيود PostgreSQL تُترجم إلى رسائل مفهومة بدل 500
  if (err.code === "23505") {
    return res.status(409).json({ error: "هذه القيمة مستخدمة بالفعل" });
  }
  if (err.code === "23503") {
    return res.status(400).json({ error: "مرجع غير موجود في قاعدة البيانات" });
  }
  if (err.code === "23514") {
    return res.status(400).json({ error: "القيمة المُرسلة تخالف قيود قاعدة البيانات" });
  }
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "صيغة JSON غير صالحة" });
  }

  const status = err instanceof ApiError ? err.status : 500;

  if (status >= 500) {
    console.error("[500]", err);
  }

  res.status(status).json({
    error: status >= 500 && config.isProd ? "حدث خطأ في الخادم" : err.message,
    ...(err.details ? { details: err.details } : {}),
  });
}
