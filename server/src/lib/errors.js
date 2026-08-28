/** خطأ يحمل رمز حالة HTTP — يُلتقط في معالج الأخطاء المركزي. */
export class ApiError extends Error {
  constructor(status, message, details) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    if (details) this.details = details;
  }

  static badRequest(msg = "طلب غير صالح", details) { return new ApiError(400, msg, details); }
  static unauthorized(msg = "يجب تسجيل الدخول") { return new ApiError(401, msg); }
  static forbidden(msg = "لا تملك صلاحية لهذا الإجراء") { return new ApiError(403, msg); }
  static notFound(msg = "غير موجود") { return new ApiError(404, msg); }
  static conflict(msg = "تعارض في البيانات") { return new ApiError(409, msg); }
}

/** يغلّف معالجًا غير متزامن حتى تصل أخطاؤه إلى معالج الأخطاء. */
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
