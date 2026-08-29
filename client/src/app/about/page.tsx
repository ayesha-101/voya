import type { Metadata } from "next";
import Link from "next/link";
import { LeafIcon, ShieldIcon, TruckIcon } from "@/components/Icons";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "من نحن",
  description: site.description,
};

const values = [
  {
    Icon: LeafIcon,
    title: "مكوّنات نظيفة",
    body: "نختار كل مكوّن بعناية: أعشاب بحرية عضوية معتمدة، بدون بارابين أو سلفات أو ألوان صناعية.",
  },
  {
    Icon: ShieldIcon,
    title: "أصالة مضمونة",
    body: "كل منتج يصل إليك مباشرة من المصدر الرسمي، مع ضمان الاستبدال خلال 14 يومًا.",
  },
  {
    Icon: TruckIcon,
    title: "توصيل سريع",
    body: "نشحن خلال 24 – 48 ساعة إلى جميع إمارات الدولة، مع إمكانية الدفع عند الاستلام.",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-3xl font-extrabold text-ink sm:text-4xl">من نحن</h1>
      <span className="mt-3 mb-8 block h-1 w-14 rounded-full bg-gold-500" />

      <div className="space-y-5 text-base leading-8 text-ink">
        <p>
          {site.name} هو المتجر المتخصص في منتجات ڤويا الأصلية وإكسسواراتها. بدأنا
          بفكرة بسيطة: أن تصل منتجات العناية العضوية عالية الجودة إلى كل بيت في
          الخليج بسعر عادل وخدمة تليق بالعميل.
        </p>
        <p>
          كل منتج في متجرنا يمر بمرحلة اختيار دقيقة — نتأكد من مصدره، ومن تركيبته،
          ومن أن نتائجه ملموسة فعلًا. لهذا شعارنا: «{site.tagline}».
        </p>
      </div>

      <div className="mt-12 grid gap-5 sm:grid-cols-3">
        {values.map(({ Icon, title, body }) => (
          <div key={title} className="rounded-card border border-blush-200 bg-blush-50 p-6">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-plum-700 text-white">
              <Icon className="h-6 w-6" />
            </span>
            <h2 className="mt-4 text-base font-extrabold text-ink">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted">{body}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 rounded-card bg-plum-800 p-8 text-center text-white">
        <h2 className="text-2xl font-extrabold">جاهز لتجربة الفرق؟</h2>
        <p className="mt-2 text-blush-100/85">ابدأ بروتينك الجديد اليوم</p>
        <Link
          href="/products"
          className="mt-6 inline-block rounded-full bg-gold-500 px-8 py-3.5 font-bold text-plum-900 transition hover:bg-gold-400"
        >
          تصفّح المنتجات
        </Link>
      </div>
    </div>
  );
}
