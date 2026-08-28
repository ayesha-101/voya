import { Rating } from "./Rating";

const reviews = [
  {
    name: "نورة العتيبي",
    city: "دبي",
    rating: 5,
    text: "سيروم الإشراق غيّر بشرتي خلال أسبوعين. الملمس خفيف والرائحة هادئة جدًا، والتوصيل وصلني في نفس اليوم التالي.",
  },
  {
    name: "محمد الحمادي",
    city: "أبوظبي",
    rating: 5,
    text: "طلبت طقم السبا هدية لزوجتي وكان التغليف فخم فوق التوقع. خدمة العملاء ردّت عليّ على واتساب خلال دقائق.",
  },
  {
    name: "لمياء ك.",
    city: "الشارقة",
    rating: 4,
    text: "أملاح الاستحمام رائعة للاسترخاء بعد يوم طويل. أتمنى فقط توفير حجم أكبر منها.",
  },
];

export function Testimonials() {
  return (
    <div className="grid gap-5 md:grid-cols-3">
      {reviews.map((r) => (
        <figure
          key={r.name}
          className="flex flex-col gap-4 rounded-card border border-sand-200 bg-sand-50 p-6"
        >
          <Rating value={r.rating} />
          <blockquote className="flex-1 text-[15px] leading-7 text-ink">
            «{r.text}»
          </blockquote>
          <figcaption className="flex items-center gap-3 border-t border-sand-200 pt-4">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-sea-700 text-sm font-bold text-white">
              {r.name.charAt(0)}
            </span>
            <span>
              <span className="block text-sm font-bold text-ink">{r.name}</span>
              <span className="block text-xs text-muted">{r.city} — مشترٍ موثّق</span>
            </span>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
