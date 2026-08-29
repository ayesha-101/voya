import { DEMO_MODE } from "@/lib/api";

/**
 * شريط يوضّح أن النسخة المعروضة بيانات تجريبية بلا خادم،
 * حتى لا يُظن أن الطلبات تُحفظ فعلًا.
 */
export function DemoBanner() {
  if (!DEMO_MODE) return null;

  return (
    <div className="border-b border-gold-500/40 bg-gold-400/20">
      <p className="mx-auto max-w-7xl px-6 py-2 text-center text-[13px] leading-5 text-plum-900">
        <strong className="font-extrabold">وضع العرض</strong> — التصميم والبيانات
        تجريبية بلا خادم. تسجيل الدخول وإتمام الطلب يحتاجان تشغيل الواجهة
        البرمجية وقاعدة البيانات.
      </p>
    </div>
  );
}
