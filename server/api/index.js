/**
 * نقطة الدخول على Vercel — نُصدّر handler بدل التطبيق المباشر
 */
import { createApp } from "../src/app.js";

const app = createApp();

// Vercel يحتاج دالة تستقبل (req, res)
export default function handler(req, res) {
  return app(req, res);
}
