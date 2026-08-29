import Hero from "@/components/home/Hero";
import Marquee from "@/components/home/Marquee";
import Categories from "@/components/home/Categories";
import BestSellers from "@/components/home/BestSellers";
import PromoBanner from "@/components/home/PromoBanner";
import NewArrivals from "@/components/home/NewArrivals";
import Stats from "@/components/home/Stats";
import Story from "@/components/home/Story";
import Reviews from "@/components/home/Reviews";
import Newsletter from "@/components/home/Newsletter";
import { fetchCategories, fetchProducts } from "@/lib/server-api";

export default async function HomePage() {
  // الخادم قد يكون متوقفًا — الصفحة تبقى تُعرض بأقسامها الثابتة
  const [categories, all, uae] = await Promise.all([
    fetchCategories().catch(() => []),
    fetchProducts({ limit: 100 })
      .then((r) => r.products)
      .catch(() => []),
    fetchProducts({ category: "uae", limit: 2 })
      .then((r) => r.products)
      .catch(() => []),
  ]);

  const hero = all.find((p) => p.slug === "curlysilk-set");

  return (
    <>
      <Hero />
      <Marquee />
      <Categories categories={categories} />
      <BestSellers products={all} />
      <PromoBanner hero={hero} />
      <NewArrivals products={all} />
      <Stats />
      <Story uaeProducts={uae} />
      <Reviews />
      <Newsletter />
    </>
  );
}
