import { ApiError } from "../lib/errors.js";

/**
 * يتحقّق من body / query / params بمخططات zod ويستبدلها بالقيم المُنقّاة،
 * فلا يصل إلى المعالجات إلا مدخلات مُتحقَّق منها.
 */
export const validate = (schemas) => (req, _res, next) => {
  for (const part of ["body", "query", "params"]) {
    const schema = schemas[part];
    if (!schema) continue;

    const result = schema.safeParse(req[part]);
    if (!result.success) {
      const details = result.error.issues.map((i) => ({
        field: i.path.join(".") || part,
        message: i.message,
      }));
      return next(ApiError.badRequest("بيانات غير صالحة", details));
    }
    // req.query في Express 5 للقراءة فقط — نُخزّن النتيجة في حقل منفصل
    if (part === "query") req.validatedQuery = result.data;
    else req[part] = result.data;
  }
  next();
};
