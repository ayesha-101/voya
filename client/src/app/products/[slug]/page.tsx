import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductArt } from "@/components/ProductArt";
import { ProductCard } from "@/components/ProductCard";
import { ProductPurchasePanel } from "@/components/ProductPurchasePanel";
import { Rating } from "@/components/Rating";
import { SectionHeading } from "@/components/SectionHeading";
import { CashIcon, LeafIcon, ShieldIcon, TruckIcon } from "@/components/Icons";
import { site } from "@/data/site";
import { fetchProduct, fetchProducts } from "@/lib/server-api";
import { discountPercent, formatPrice } from "@/lib/format";

export async function generateStaticParams() {
  try {
    const { products } = await fetchProducts({ limit: 100 });
    return products.map((p) => ({ slug: p.slug }));
  } catch {
    // الواجهة البرمجية غير متاحة وقت البناء — تُولَّد الصفحات عند الطلب
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const { product } = await fetchProduct(slug);
    return { title: product.name, description: product.short };
  } catch {
    return { title: "المنتج غير موجود" };
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const data = await fetchProduct(slug).catch(() => null);
  if (!data) notFound();

  const { product, related } = data;
  const off = discountPercent(product.price, product.compareAt);

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <nav aria-label="مسار التنقل" className="mb-6 text-[13px] text-muted">
        <Link href="/" className="hover:text-sea-700">الرئيسية</Link>
        <span className="mx-2">/</span>
        <Link href={`/products?category=${product.category}`} className="hover:text-sea-700">
          {product.categoryName}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-ink">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <div className="relative overflow-hidden rounded-card border border-sand-200 bg-sand-50 p-8">
          {off > 0 && (
            <span className="absolute end-5 top-5 rounded-full bg-gold-500 px-3 py-1.5 text-sm font-extrabold text-sea-900">
              خصم <span className="nums">{off}%</span>
            </span>
          )}
          <ProductArt
            shape={product.shape}
            tone={product.tone}
            label={product.name}
            className="mx-auto h-[26rem] w-full"
          />
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            {product.badge && (
              <span className="inline-block rounded-full bg-sea-800 px-3 py-1 text-xs font-bold text-white">
                {product.badge}
              </span>
            )}
            <h1 className="text-3xl leading-tight font-extrabold text-ink sm:text-4xl">
              {product.name}
            </h1>
            <p className="text-sm tracking-wide text-muted">{product.nameEn}</p>
            <Rating value={product.rating} reviews={product.reviews} size="md" />
          </div>

          <p className="text-base leading-8 text-ink">{product.description}</p>

          <div className="flex flex-wrap items-baseline gap-3 border-y border-sand-200 py-5">
            <span className="nums text-4xl font-extrabold text-sea-700">
              {formatPrice(product.price)}
            </span>
            {product.compareAt && (
              <span className="nums text-lg text-muted line-through">
                {formatPrice(product.compareAt)}
              </span>
            )}
            <span className="ms-auto text-sm text-muted">{product.size}</span>
          </div>

          <ProductPurchasePanel product={product} />

          <ul className="grid gap-3 sm:grid-cols-2">
            {product.benefits.map((b) => (
              <li key={b} className="flex items-center gap-2.5 text-sm text-ink">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-sea-100 text-sea-700">
                  ✓
                </span>
                {b}
              </li>
            ))}
          </ul>

          <div className="grid gap-3 rounded-card bg-sand-50 p-5 sm:grid-cols-2">
            {[
              { Icon: TruckIcon, t: "شحن مجاني", d: `فوق ${site.freeShippingThreshold} د.إ` },
              { Icon: CashIcon, t: "الدفع عند الاستلام", d: "متاح لجميع الإمارات" },
              { Icon: ShieldIcon, t: "أصلي 100%", d: "ضمان الاستبدال 14 يوم" },
              { Icon: LeafIcon, t: "عضوي معتمد", d: "بدون بارابين أو سلفات" },
            ].map(({ Icon, t, d }) => (
              <div key={t} className="flex items-center gap-3">
                <Icon className="h-5 w-5 shrink-0 text-sea-700" />
                <div className="text-[13px]">
                  <p className="font-bold text-ink">{t}</p>
                  <p className="text-muted">{d}</p>
                </div>
              </div>
            ))}
          </div>

          {product.ingredients.length > 0 && (
            <details className="rounded-card border border-sand-200 p-5" open>
              <summary className="cursor-pointer text-sm font-bold text-ink">
                المكوّنات الأساسية
              </summary>
              <ul className="mt-4 flex flex-wrap gap-2">
                {product.ingredients.map((i) => (
                  <li key={i} className="rounded-full bg-sand-100 px-3.5 py-1.5 text-[13px] text-ink">
                    {i}
                  </li>
                ))}
              </ul>
            </details>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20">
          <SectionHeading title="قد يعجبك أيضًا" href="/products" />
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
