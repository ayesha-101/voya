/**
 * نقطة الدخول على Vercel: نُصدّر تطبيق Express كدالة بلا خادم
 * بدل تشغيل listen. التشغيل المحلي يبقى عبر src/index.js.
 */
import { createApp } from "../src/app.js";

export default createApp();
