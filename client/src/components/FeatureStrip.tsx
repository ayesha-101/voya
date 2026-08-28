import { CashIcon, LeafIcon, ShieldIcon, TruckIcon } from "./Icons";
import { site } from "@/data/site";

const features = [
  {
    Icon: TruckIcon,
    title: "شحن مجاني",
    body: `للطلبات فوق ${site.freeShippingThreshold} د.إ`,
  },
  { Icon: CashIcon, title: "الدفع عند الاستلام", body: "متاح في جميع الإمارات" },
  { Icon: ShieldIcon, title: "منتجات أصلية 100%", body: "ضمان الاستبدال 14 يوم" },
  { Icon: LeafIcon, title: "مكوّنات عضوية", body: "خالية من البارابين والسلفات" },
];

export function FeatureStrip() {
  return (
    <section className="border-y border-blush-200 bg-blush-50">
      <div className="mx-auto grid max-w-7xl gap-4 px-6 py-8 sm:grid-cols-2 lg:grid-cols-4">
        {features.map(({ Icon, title, body }) => (
          <div key={title} className="flex items-center gap-3.5">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white text-plum-700 shadow-sm">
              <Icon className="h-6 w-6" />
            </span>
            <div>
              <p className="text-sm font-bold text-ink">{title}</p>
              <p className="text-xs text-muted">{body}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
