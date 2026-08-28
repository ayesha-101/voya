import type { Metadata } from "next";
import { WhatsAppIcon } from "@/components/Icons";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "تواصل معنا",
  description: `تواصل مع فريق ${site.name} عبر واتساب أو الهاتف أو البريد الإلكتروني.`,
};

const faqs = [
  {
    q: "كم يستغرق التوصيل؟",
    a: "من 24 إلى 48 ساعة داخل الإمارات، وقد يمتد إلى 3 أيام في المناطق البعيدة.",
  },
  {
    q: "هل الدفع عند الاستلام متاح؟",
    a: "نعم، متاح في جميع الإمارات بدون رسوم إضافية.",
  },
  {
    q: "هل يمكنني استبدال المنتج؟",
    a: "يمكنك الاستبدال خلال 14 يومًا من الاستلام بشرط أن يكون المنتج مغلقًا وبحالته الأصلية.",
  },
  {
    q: "هل المنتجات أصلية؟",
    a: "جميع منتجاتنا أصلية 100% ومستوردة من المصدر الرسمي مباشرة.",
  },
];

export default function ContactPage() {
  const field =
    "w-full rounded-xl border border-sand-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-sea-400";

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="text-3xl font-extrabold text-ink sm:text-4xl">تواصل معنا</h1>
      <span className="mt-3 mb-8 block h-1 w-14 rounded-full bg-gold-500" />

      <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
        <div className="space-y-4">
          <a
            href={`https://wa.me/${site.whatsapp}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-4 rounded-card bg-[#25D366] p-5 text-white transition hover:brightness-105"
          >
            <WhatsAppIcon className="h-9 w-9" />
            <span>
              <span className="block font-extrabold">واتساب — الأسرع</span>
              <span className="block text-sm opacity-90">رد خلال دقائق</span>
            </span>
          </a>

          <div className="space-y-4 rounded-card border border-sand-200 bg-sand-50 p-6 text-sm">
            <div>
              <p className="font-bold text-ink">الهاتف</p>
              <a
                href={`tel:${site.phone.replace(/\s/g, "")}`}
                className="nums text-muted hover:text-sea-700"
              >
                {site.phone}
              </a>
            </div>
            <div>
              <p className="font-bold text-ink">البريد الإلكتروني</p>
              <a href={`mailto:${site.email}`} className="text-muted hover:text-sea-700">
                {site.email}
              </a>
            </div>
            <div>
              <p className="font-bold text-ink">أوقات العمل</p>
              <p className="text-muted">السبت – الخميس، 9 صباحًا – 9 مساءً</p>
            </div>
            <div>
              <p className="font-bold text-ink">الموقع</p>
              <p className="text-muted">{site.country}</p>
            </div>
          </div>
        </div>

        <form className="space-y-4 rounded-card border border-sand-200 p-6">
          <h2 className="text-lg font-extrabold text-ink">أرسل لنا رسالة</h2>
          <label className="block space-y-1.5">
            <span className="text-[13px] font-bold text-ink">الاسم</span>
            <input name="name" required className={field} />
          </label>
          <label className="block space-y-1.5">
            <span className="text-[13px] font-bold text-ink">البريد الإلكتروني</span>
            <input name="email" type="email" required dir="ltr" className={`${field} text-start`} />
          </label>
          <label className="block space-y-1.5">
            <span className="text-[13px] font-bold text-ink">رسالتك</span>
            <textarea name="message" rows={5} required className={field} />
          </label>
          <button
            type="submit"
            className="w-full rounded-full bg-sea-700 px-6 py-3.5 font-bold text-white transition hover:bg-sea-800"
          >
            إرسال
          </button>
        </form>
      </div>

      <section className="mt-14">
        <h2 className="text-2xl font-extrabold text-ink">الأسئلة الشائعة</h2>
        <div className="mt-6 space-y-3">
          {faqs.map((f) => (
            <details key={f.q} className="rounded-card border border-sand-200 bg-white p-5">
              <summary className="cursor-pointer font-bold text-ink">{f.q}</summary>
              <p className="mt-3 text-sm leading-7 text-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
