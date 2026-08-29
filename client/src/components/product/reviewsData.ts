import type { Product } from "@/lib/types";

export interface Review {
  id: string;
  name: string;
  rating: number;
  title: string;
  text: string;
  date: string;
  helpful: number;
  verified: boolean;
}

const GENERIC_REVIEWS: Omit<Review, 'id'>[] = [
  {
    name: 'سارة المهيري',
    rating: 5,
    title: 'جودة تفوق التوقع',
    text: 'وصلني الطلب بتغليف وردي يجنن مع ورقة شكر صغيرة 🌸 المنتج نفسه أحلى من الصور والنتيجة ظهرت من أول أسبوع. أكيد بعيد الطلب.',
    date: 'قبل أسبوع',
    helpful: 24,
    verified: true,
  },
  {
    name: 'نورة الشامسي',
    rating: 5,
    title: 'هدية ناجحة جدًا',
    text: 'طلبته هدية لأختي وكانت سعيدة من لحظة فتح الصندوق. التوصيل وصل قبل الموعد وفريق فويا رد عليّ واتساب بسرعة ولطف.',
    date: 'قبل أسبوعين',
    helpful: 12,
    verified: true,
  },
  {
    name: 'ريم الكتبي',
    rating: 4,
    title: 'جميل وعملي',
    text: 'المنتج ممتاز وقريب جدًا من الوصف. نقصت نجمة فقط لأن التوصيل تأخر يومًا عن الموعد، لكن خدمة العملاء كانت متعاونة واعتذرت بلباقة.',
    date: 'قبل شهر',
    helpful: 9,
    verified: true,
  },
  {
    name: 'مريم العتيبة',
    rating: 5,
    title: 'أصبح من أساسيات روتيني',
    text: 'أستخدمه يوميًا منذ شهرين والفرق واضح — صديقاتي صرن يسألنني عن السر! الجودة ثابتة والرائحة ناعمة وتدوم.',
    date: 'قبل شهرين',
    helpful: 17,
    verified: true,
  },
  {
    name: 'العنود الحميري',
    rating: 5,
    title: 'تجربة متكاملة من فويا',
    text: 'من الموقع للتغليف للمنتج، كل شيء مدروس بعناية وحب. ثالث مرة أطلب منهم وما خاب ظني أبدًا. يستاهلون الخمس نجوم.',
    date: 'قبل 3 أشهر',
    helpful: 22,
    verified: true,
  },
  {
    name: 'لطيفة الزعابي',
    rating: 4,
    title: 'راضية عن الشراء',
    text: 'منتج لطيف وجودته ممتازة مقارنة بالسعر. أتمنى يضيفون أحجام أكبر في المستقبل لأنه يخلص بسرعة من كثر الاستخدام!',
    date: 'قبل 4 أشهر',
    helpful: 6,
    verified: true,
  },
];

export function getReviews(product: Product): Review[] {
  return GENERIC_REVIEWS.map((r, i) => ({ ...r, id: `${product.id}-r${i}` }));
}

export interface DistributionRow {
  stars: number;
  pct: number;
}

/** Deterministic rating distribution derived from the product's average rating. */
export function getDistribution(product: Product): DistributionRow[] {
  const r = product.rating;
  // share of 5★ grows with average rating
  const five = Math.min(88, Math.max(35, Math.round((r - 3.4) * 55)));
  const four = Math.round((100 - five) * 0.55);
  const three = Math.round((100 - five - four) * 0.55);
  const two = Math.round((100 - five - four - three) * 0.6);
  const one = 100 - five - four - three - two;
  return [
    { stars: 5, pct: five },
    { stars: 4, pct: four },
    { stars: 3, pct: three },
    { stars: 2, pct: two },
    { stars: 1, pct: one },
  ];
}
