/** إعدادات المتجر العامة — عدّل هذا الملف لتغيير هوية المتجر بالكامل. */
export const site = {
  name: "ڤويا ستور",
  nameEn: "VOYA STORE",
  tagline: "منتجات مختارة بعناية وبأعلى جودة",
  taglineEn: "Carefully Selected Products with High Quality",
  description:
    "المتجر الرسمي لمنتجات ڤويا الأصلة — عناية عضوية بالبشرة والجسم مستخلصة من الأعشاب البحرية المحصودة يدويًا.",
  currency: "AED",
  locale: "ar-AE",
  country: "الإمارات العربية المتحدة",
  whatsapp: "971553633977",
  phone: "+971 55 363 3977",
  email: "voyagroups@gmail.com",
  freeShippingThreshold: 200,
  shippingFee: 20,
  social: [
    { label: "انستقرام", href: "https://instagram.com", icon: "instagram" },
    { label: "تيك توك", href: "https://tiktok.com", icon: "tiktok" },
    { label: "سناب شات", href: "https://snapchat.com", icon: "snapchat" },
    { label: "واتساب", href: "https://wa.me/971553633977", icon: "whatsapp" },
  ],
} as const;

export const announcements = [
  "شحن مجاني للطلبات فوق 200 د.إ",
  "الدفع عند الاستلام متاح في جميع الإمارات",
  "منتجات ڤويا الأصلية 100% — ضمان الاستبدال خلال 14 يوم",
  "التوصيل خلال 24 – 48 ساعة",
];
