import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetail } from "@/components/ProductDetail";
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
  const data = await fetchProduct(slug).catch(() => null);
  if (!data) notFound();

  return <ProductDetail product={data.product} related={data.related} />;
}
