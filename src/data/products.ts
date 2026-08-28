export type Shape = "bottle" | "jar" | "tube" | "box" | "pouch";

export type Category = {
  slug: string;
  name: string;
  blurb: string;
  tone: string;
};

export type Product = {
  slug: string;
  name: string;
  nameEn: string;
  category: string;
  price: number;
  compareAt?: number;
  size: string;
  rating: number;
  reviews: number;
  badge?: "الأكثر مبيعًا" | "جديد" | "عرض خاص" | "كمية محدودة";
  short: string;
  description: string;
  benefits: string[];
  ingredients: string[];
  shape: Shape;
  tone: [string, string];
  stock: number;
};

export const categories: Category[] = [
  { slug: "face", name: "العناية بالوجه", blurb: "سيروم وكريمات وماسكات", tone: "#2f7a6c" },
  { slug: "body", name: "العناية بالجسم", blurb: "مرطبات وزيوت ومقشرات", tone: "#4c9587" },
  { slug: "bath", name: "حمامات الأعشاب", blurb: "طقوس الاسترخاء البحرية", tone: "#164a42" },
  { slug: "hair", name: "العناية بالشعر", blurb: "شامبو وبلسم وزيوت", tone: "#1f6156" },
  { slug: "gifts", name: "أطقم الهدايا", blurb: "علب فاخرة جاهزة للإهداء", tone: "#a98a35" },
  { slug: "accessories", name: "إكسسوارات", blurb: "فرش وليف وأدوات العناية", tone: "#7fb9ac" },
];

export const products: Product[] = [
  {
    slug: "radiance-serum",
    name: "سيروم الإشراق بالأعشاب البحرية",
    nameEn: "Radiance Seaweed Serum",
    category: "face",
    price: 289,
    compareAt: 349,
    size: "30 مل",
    rating: 4.9,
    reviews: 214,
    badge: "الأكثر مبيعًا",
    short: "سيروم مركّز يوحّد لون البشرة ويمنحها إشراقة فورية.",
    description:
      "تركيبة خفيفة سريعة الامتصاص تجمع بين خلاصة الأعشاب البحرية العضوية وفيتامين C المستقر لتوحيد لون البشرة وتقليل ظهور البقع الداكنة. يُستخدم صباحًا ومساءً على بشرة نظيفة قبل المرطب.",
    benefits: ["يوحّد لون البشرة", "يقلل البقع الداكنة", "يمنح إشراقة فورية", "خفيف وغير دهني"],
    ingredients: ["خلاصة الأعشاب البحرية العضوية", "فيتامين C المستقر", "حمض الهيالورونيك", "زيت بذور العنب"],
    shape: "bottle",
    tone: ["#2f7a6c", "#0f3a34"],
    stock: 24,
  },
  {
    slug: "hydrating-day-cream",
    name: "كريم النهار المرطّب",
    nameEn: "Hydrating Day Cream",
    category: "face",
    price: 245,
    size: "50 مل",
    rating: 4.8,
    reviews: 168,
    short: "ترطيب يدوم 24 ساعة مع حماية من الجفاف البيئي.",
    description:
      "كريم نهاري غني بمستخلص عشب البحر الأحمر يشكّل طبقة حماية خفيفة تحافظ على رطوبة البشرة طوال اليوم دون ثقل أو لمعان.",
    benefits: ["ترطيب 24 ساعة", "يحمي من الجفاف", "قوام غير ثقيل", "مناسب تحت المكياج"],
    ingredients: ["عشب البحر الأحمر", "زبدة الشيا", "سكوالان نباتي", "جلسرين نباتي"],
    shape: "jar",
    tone: ["#4c9587", "#164a42"],
    stock: 31,
  },
  {
    slug: "detox-clay-mask",
    name: "ماسك الطين البحري المنقّي",
    nameEn: "Detox Marine Clay Mask",
    category: "face",
    price: 185,
    compareAt: 220,
    size: "75 مل",
    rating: 4.7,
    reviews: 132,
    badge: "عرض خاص",
    short: "ينقّي المسام ويشدّ البشرة في 10 دقائق.",
    description:
      "طين بحري ناعم ممزوج بالأعشاب البحرية المجففة يسحب الشوائب من عمق المسام ويترك البشرة نظيفة ومشدودة. يُستخدم مرتين أسبوعيًا.",
    benefits: ["ينقّي المسام", "يمتص الزيوت الزائدة", "يشدّ البشرة", "يقلل اللمعان"],
    ingredients: ["طين الكاولين البحري", "أعشاب بحرية مجففة", "الفحم النشط", "زيت شجرة الشاي"],
    shape: "jar",
    tone: ["#164a42", "#0a2b26"],
    stock: 18,
  },
  {
    slug: "eye-recovery-gel",
    name: "جل العين المنعش",
    nameEn: "Eye Recovery Gel",
    category: "face",
    price: 199,
    size: "15 مل",
    rating: 4.6,
    reviews: 97,
    badge: "جديد",
    short: "يقلل الانتفاخ والهالات السوداء منذ الاستخدام الأول.",
    description:
      "جل بارد سريع الامتصاص مصمم للمنطقة الحساسة حول العين، يقلل الانتفاخ الصباحي ويفتّح الهالات مع الاستخدام المنتظم.",
    benefits: ["يقلل الانتفاخ", "يفتّح الهالات", "ملمس بارد منعش", "خالٍ من العطور"],
    ingredients: ["خلاصة الطحالب الخضراء", "الكافيين", "خيار عضوي", "بانثينول"],
    shape: "tube",
    tone: ["#7fb9ac", "#2f7a6c"],
    stock: 40,
  },
  {
    slug: "body-butter",
    name: "زبدة الجسم بالأعشاب البحرية",
    nameEn: "Seaweed Body Butter",
    category: "body",
    price: 165,
    size: "200 مل",
    rating: 4.9,
    reviews: 256,
    badge: "الأكثر مبيعًا",
    short: "زبدة غنية تغذّي الجلد الجاف وتتركه ناعمًا كالحرير.",
    description:
      "زبدة كثيفة تذوب على الجلد مباشرة، مصنوعة من زبدة الشيا العضوية ومستخلص الأعشاب البحرية لعلاج الجفاف الشديد خاصة في الكوعين والركبتين.",
    benefits: ["تغذية عميقة", "تنعيم فوري", "رائحة بحرية هادئة", "تدوم طويلًا"],
    ingredients: ["زبدة الشيا العضوية", "زبدة الكاكاو", "خلاصة الأعشاب البحرية", "زيت جوز الهند"],
    shape: "jar",
    tone: ["#cdb387", "#a98a35"],
    stock: 52,
  },
  {
    slug: "body-oil",
    name: "زيت الجسم الفاخر",
    nameEn: "Luxury Body Oil",
    category: "body",
    price: 219,
    compareAt: 265,
    size: "100 مل",
    rating: 4.8,
    reviews: 143,
    short: "زيت جاف سريع الامتصاص يمنح لمعانًا صحيًا.",
    description:
      "مزيج من سبعة زيوت نباتية عضوية بقوام جاف لا يترك أثرًا دهنيًا، يُستخدم بعد الاستحمام مباشرة على الجلد الرطب.",
    benefits: ["امتصاص سريع", "لمعان طبيعي", "يحسّن مرونة الجلد", "مناسب للتدليك"],
    ingredients: ["زيت الأرغان", "زيت الجوجوبا", "زيت بذور المشمش", "خلاصة اللاميناريا"],
    shape: "bottle",
    tone: ["#d9bd6b", "#a98a35"],
    stock: 27,
  },
  {
    slug: "body-scrub",
    name: "مقشّر الملح البحري",
    nameEn: "Sea Salt Body Scrub",
    category: "body",
    price: 149,
    size: "250 غم",
    rating: 4.7,
    reviews: 188,
    short: "يزيل الجلد الميت ويجدد نعومة البشرة.",
    description:
      "حبيبات ملح بحري طبيعي ممزوجة بزيوت مغذّية تزيل خلايا الجلد الميت وتنشّط الدورة الدموية وتترك الجسم ناعمًا ومنعشًا.",
    benefits: ["تقشير لطيف", "ينشّط الدورة الدموية", "يحضّر البشرة للترطيب", "رائحة منعشة"],
    ingredients: ["ملح البحر الأطلسي", "أعشاب بحرية مطحونة", "زيت دوار الشمس", "زيت الليمون"],
    shape: "jar",
    tone: ["#b3d7ce", "#4c9587"],
    stock: 35,
  },
  {
    slug: "hand-cream",
    name: "كريم اليدين المغذّي",
    nameEn: "Nourishing Hand Cream",
    category: "body",
    price: 79,
    size: "75 مل",
    rating: 4.8,
    reviews: 301,
    short: "حماية وترطيب لليدين الجافة طوال اليوم.",
    description:
      "كريم يدين خفيف يمتص بسرعة ولا يترك أثرًا لزجًا، مثالي للاستخدام المتكرر بعد غسل اليدين.",
    benefits: ["امتصاص سريع", "يقوّي الأظافر", "بحجم الحقيبة", "غير لزج"],
    ingredients: ["خلاصة الأعشاب البحرية", "الشمع النباتي", "فيتامين E", "الأليو فيرا"],
    shape: "tube",
    tone: ["#e2d0b3", "#cdb387"],
    stock: 88,
  },
  {
    slug: "bath-soak",
    name: "أملاح الاستحمام بالأعشاب البحرية",
    nameEn: "Seaweed Bath Soak",
    category: "bath",
    price: 129,
    size: "500 غم",
    rating: 4.9,
    reviews: 176,
    badge: "الأكثر مبيعًا",
    short: "طقس استرخاء بحري كامل داخل حوض منزلك.",
    description:
      "أملاح إبسوم ممزوجة بأعشاب بحرية عضوية محصودة يدويًا، تذيب توتر العضلات وتفتح المسام وتترك الجسم في حالة استرخاء عميق.",
    benefits: ["يرخي العضلات", "يخفف التوتر", "ينقّي البشرة", "تجربة سبا منزلية"],
    ingredients: ["أملاح إبسوم", "أعشاب بحرية عضوية", "زيت اللافندر", "أملاح البحر الميت"],
    shape: "pouch",
    tone: ["#1f6156", "#0a2b26"],
    stock: 46,
  },
  {
    slug: "bath-elixir",
    name: "إكسير الحمّام البحري",
    nameEn: "Marine Bath Elixir",
    category: "bath",
    price: 189,
    size: "150 مل",
    rating: 4.7,
    reviews: 84,
    badge: "كمية محدودة",
    short: "زيت حمّام مركّز يحوّل الماء إلى حليب حريري.",
    description:
      "بضع قطرات تكفي لتحويل ماء الحوض إلى قوام حريري معطّر بروائح بحرية دافئة تهدّئ الحواس قبل النوم.",
    benefits: ["يهدّئ الحواس", "يرطّب أثناء الاستحمام", "رائحة تدوم", "اقتصادي في الاستخدام"],
    ingredients: ["زيت اللوز الحلو", "خلاصة الفوقس", "زيت النيرولي", "فيتامين E"],
    shape: "bottle",
    tone: ["#2f7a6c", "#164a42"],
    stock: 12,
  },
  {
    slug: "shower-gel",
    name: "جل الاستحمام المنعش",
    nameEn: "Refreshing Shower Gel",
    category: "bath",
    price: 95,
    size: "300 مل",
    rating: 4.6,
    reviews: 205,
    short: "رغوة كريمية تنظّف بلطف دون جفاف.",
    description:
      "جل استحمام بقاعدة نباتية خالية من السلفات، ينظّف البشرة بعمق مع الحفاظ على حاجزها الطبيعي.",
    benefits: ["خالٍ من السلفات", "رغوة كريمية", "لا يسبب الجفاف", "مناسب للاستخدام اليومي"],
    ingredients: ["قاعدة جوز الهند", "خلاصة الأعشاب البحرية", "الجلسرين", "زيت النعناع"],
    shape: "bottle",
    tone: ["#7fb9ac", "#1f6156"],
    stock: 64,
  },
  {
    slug: "repair-shampoo",
    name: "شامبو الترميم بالأعشاب البحرية",
    nameEn: "Seaweed Repair Shampoo",
    category: "hair",
    price: 139,
    compareAt: 165,
    size: "300 مل",
    rating: 4.8,
    reviews: 197,
    badge: "عرض خاص",
    short: "ينظّف ويرمّم الشعر التالف دون سلفات.",
    description:
      "شامبو غني بالمعادن البحرية يعيد بناء ألياف الشعر التالفة من التصفيف الحراري والصبغات، ويمنح لمعانًا صحيًا من أول استخدام.",
    benefits: ["يرمّم التلف", "يزيد اللمعان", "خالٍ من السلفات", "آمن للشعر المصبوغ"],
    ingredients: ["بروتين الأعشاب البحرية", "الكيراتين النباتي", "بانثينول", "زيت الأرغان"],
    shape: "bottle",
    tone: ["#4c9587", "#0f3a34"],
    stock: 58,
  },
  {
    slug: "repair-conditioner",
    name: "بلسم الترميم العميق",
    nameEn: "Deep Repair Conditioner",
    category: "hair",
    price: 145,
    size: "250 مل",
    rating: 4.7,
    reviews: 151,
    short: "يفكّ التشابك ويغلّف كل خصلة بالترطيب.",
    description:
      "بلسم كثيف يترك الشعر سهل التسريح وناعمًا، مع حماية من التقصف حتى الغسلة التالية.",
    benefits: ["يفكّ التشابك", "يقلل التقصف", "نعومة فورية", "بدون سيليكون"],
    ingredients: ["زبدة المانجو", "خلاصة اللاميناريا", "زيت الأفوكادو", "الأحماض الأمينية"],
    shape: "tube",
    tone: ["#b3d7ce", "#2f7a6c"],
    stock: 43,
  },
  {
    slug: "scalp-oil",
    name: "زيت فروة الرأس المغذّي",
    nameEn: "Nourishing Scalp Oil",
    category: "hair",
    price: 175,
    size: "60 مل",
    rating: 4.9,
    reviews: 122,
    badge: "جديد",
    short: "يغذّي البصيلات ويقلل التساقط مع الاستخدام المنتظم.",
    description:
      "خليط زيوت خفيف بقطارة دقيقة يوضع مباشرة على فروة الرأس ويُدلَّك بلطف، يُترك 30 دقيقة قبل الغسل أو طوال الليل.",
    benefits: ["يغذّي البصيلات", "يقلل التساقط", "يهدّئ الحكة", "سهل الغسل"],
    ingredients: ["زيت الخروع", "زيت إكليل الجبل", "خلاصة الأعشاب البحرية", "زيت بذور اليقطين"],
    shape: "bottle",
    tone: ["#a98a35", "#164a42"],
    stock: 21,
  },
  {
    slug: "ritual-gift-set",
    name: "طقم طقوس السبا البحري",
    nameEn: "Marine Spa Ritual Set",
    category: "gifts",
    price: 549,
    compareAt: 690,
    size: "4 قطع",
    rating: 5.0,
    reviews: 76,
    badge: "عرض خاص",
    short: "أربع قطع مختارة في علبة فاخرة جاهزة للإهداء.",
    description:
      "يضم الطقم أملاح الاستحمام، زبدة الجسم، مقشّر الملح البحري، وليفة طبيعية، معبّأة في علبة هدايا فاخرة مع بطاقة إهداء.",
    benefits: ["توفير 140 د.إ", "علبة هدايا فاخرة", "بطاقة إهداء مجانية", "تجربة سبا متكاملة"],
    ingredients: ["أملاح الاستحمام", "زبدة الجسم", "مقشّر الملح البحري", "ليفة طبيعية"],
    shape: "box",
    tone: ["#c8a94e", "#164a42"],
    stock: 9,
  },
  {
    slug: "glow-duo",
    name: "ثنائي الإشراق",
    nameEn: "Glow Duo",
    category: "gifts",
    price: 469,
    compareAt: 534,
    size: "قطعتان",
    rating: 4.9,
    reviews: 58,
    short: "سيروم الإشراق + كريم النهار بسعر مخفّض.",
    description:
      "الروتين الصباحي الكامل في علبة واحدة: سيروم الإشراق بالأعشاب البحرية مع كريم النهار المرطّب.",
    benefits: ["روتين متكامل", "توفير 65 د.إ", "تغليف أنيق", "الأنسب للمبتدئين"],
    ingredients: ["سيروم الإشراق 30 مل", "كريم النهار 50 مل"],
    shape: "box",
    tone: ["#d9bd6b", "#2f7a6c"],
    stock: 15,
  },
  {
    slug: "dry-brush",
    name: "فرشاة التقشير الجاف",
    nameEn: "Dry Body Brush",
    category: "accessories",
    price: 89,
    size: "قطعة واحدة",
    rating: 4.6,
    reviews: 134,
    short: "خشب طبيعي وشعيرات سيزال لتنشيط الدورة الليمفاوية.",
    description:
      "فرشاة يدوية من خشب الزان الطبيعي وشعيرات السيزال، تُستخدم على الجلد الجاف قبل الاستحمام بحركات دائرية باتجاه القلب.",
    benefits: ["تنشّط الدورة الليمفاوية", "تقشير يومي لطيف", "خامات طبيعية", "تدوم لسنوات"],
    ingredients: ["خشب الزان", "شعيرات السيزال الطبيعية"],
    shape: "box",
    tone: ["#e2d0b3", "#a98a35"],
    stock: 72,
  },
  {
    slug: "konjac-sponge",
    name: "إسفنجة الكونجاك للوجه",
    nameEn: "Konjac Face Sponge",
    category: "accessories",
    price: 45,
    size: "قطعة واحدة",
    rating: 4.5,
    reviews: 219,
    short: "تنظيف يومي لطيف مناسب لأكثر البشرات حساسية.",
    description:
      "إسفنجة نباتية 100% من جذور الكونجاك، تنظّف البشرة بلطف وتزيل الشوائب دون الحاجة إلى منظّف قوي.",
    benefits: ["لطيفة جدًا", "قابلة للتحلل", "مناسبة للبشرة الحساسة", "استخدام يومي"],
    ingredients: ["جذور الكونجاك", "مسحوق الفحم البحري"],
    shape: "pouch",
    tone: ["#d9ebe6", "#7fb9ac"],
    stock: 110,
  },
];

export function getProduct(slug: string) {
  return products.find((p) => p.slug === slug);
}

export function getCategory(slug: string) {
  return categories.find((c) => c.slug === slug);
}

export function byCategory(slug?: string) {
  if (!slug || slug === "all") return products;
  return products.filter((p) => p.category === slug);
}

export function bestSellers() {
  return [...products].sort((a, b) => b.reviews - a.reviews).slice(0, 8);
}

export function onSale() {
  return products.filter((p) => p.compareAt);
}

export function related(product: Product, count = 4) {
  return products
    .filter((p) => p.slug !== product.slug && p.category === product.category)
    .concat(products.filter((p) => p.category !== product.category))
    .slice(0, count);
}
