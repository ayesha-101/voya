import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductPageView from "@/components/product/ProductPageView";
import { fetchProduct, fetchProducts } from "@/lib/server-api";

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
  const [data, all] = await Promise.all([
    fetchProduct(slug).catch(() => null),
    fetchProducts({ limit: 100 })
      .then((r) => r.products)
      .catch(() => []),
  ]);
  if (!data) notFound();

  return <ProductPageView product={data.product} catalog={all} />;
}
