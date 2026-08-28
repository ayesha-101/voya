import type { Metadata } from "next";
import { PolicyPage } from "@/components/PolicyPage";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "الشحن والتوصيل",
  description: `سياسة الشحن والتوصيل في ${site.name}.`,
};

export default function ShippingPage() {
  return (
    <PolicyPage
      title="الشحن والتوصيل"
      intro={`نشحن إلى جميع مناطق ${site.country}، ونحرص على وصول طلبك بأسرع وقت وبأفضل حالة.`}
      sections={[
        {
          heading: "مدة التوصيل",
          body: [
            "يتم تجهيز الطلبات خلال يوم عمل واحد من تأكيدها.",
            "التوصيل داخل المدن الرئيسية خلال 24 إلى 48 ساعة، وقد يمتد إلى 3 أيام عمل في المناطق البعيدة.",
          ],
        },
        {
          heading: "رسوم الشحن",
          body: [
            `الشحن مجاني لكل طلب تتجاوز قيمته ${site.freeShippingThreshold} د.إ.`,
            `الطلبات الأقل من ذلك تُضاف إليها رسوم شحن ثابتة قدرها ${site.shippingFee} د.إ.`,
          ],
        },
        {
          heading: "تتبّع الطلب",
          body: [
            "بعد شحن الطلب نرسل لك رسالة تحتوي على رقم التتبّع عبر الرسائل النصية أو واتساب.",
            `لأي استفسار عن حالة الطلب تواصل معنا على ${site.phone} أو عبر واتساب.`,
          ],
        },
        {
          heading: "الدفع عند الاستلام",
          body: [
            "متاح في جميع الإمارات بدون رسوم إضافية.",
            "يُرجى تجهيز المبلغ نقدًا عند وصول المندوب لتسريع عملية التسليم.",
          ],
        },
      ]}
    />
  );
}
