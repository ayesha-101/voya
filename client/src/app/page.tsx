import { CategoryStrip } from "@/components/CategoryStrip";
import { FeatureStrip } from "@/components/FeatureStrip";
import { Hero } from "@/components/Hero";
import { Newsletter } from "@/components/Newsletter";
import { OfferBanner } from "@/components/OfferBanner";
import { ProductCard } from "@/components/ProductCard";
import { SectionHeading } from "@/components/SectionHeading";
import { Testimonials } from "@/components/Testimonials";
import { fetchCategories, fetchProducts } from "@/lib/server-api";

export default async function HomePage() {
  const [categories, sellers, deals, face] = await Promise.all([
    fetchCategories(),
    fetchProducts({ sort: "featured", limit: 8 }),
    fetchProducts({ sort: "discount", limit: 4 }),
    fetchProducts({ category: "face", limit: 4 }),
  ]);

  return (
    <>
      <Hero />
      <FeatureStrip />

      <section className="mx-auto max-w-7xl px-6 py-14">
        <SectionHeading
          title="تسوّق حسب التصنيف"
          subtitle="اختر ما يناسب روتينك اليومي"
          href="/products"
        />
        <CategoryStrip categories={categories} />
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-14">
        <SectionHeading
          title="الأكثر مبيعًا"
          subtitle="ما يختاره عملاؤنا أكثر من غيره"
          href="/products"
        />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {sellers.products.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-14">
        <OfferBanner />
      </section>

      {deals.products.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 pb-14">
          <SectionHeading
            title="عروض خاصة"
            subtitle="أسعار مخفّضة لفترة محدودة"
            href="/products?sort=discount"
          />
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {deals.products.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-6 pb-14">
        <SectionHeading
          title="العناية بالوجه"
          subtitle="روتين متكامل من السيروم إلى الماسك"
          href="/products?category=face"
        />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {face.products.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-14">
        <SectionHeading title="ماذا يقول عملاؤنا" subtitle="تقييمات من مشترين موثّقين" />
        <Testimonials />
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-6">
        <Newsletter />
      </section>
    </>
  );
}
