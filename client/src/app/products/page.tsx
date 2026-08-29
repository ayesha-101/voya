import { Suspense } from "react";
import ShopView from "@/components/shop/ShopView";
import { fetchProducts } from "@/lib/server-api";

export const metadata = { title: "المتجر" };

export default async function ProductsPage() {
  // الفلترة والترتيب يتمّان في المتصفح كما في القالب، فنجلب الكتالوج كاملًا
  const { products } = await fetchProducts({ limit: 100 }).catch(() => ({ products: [] }));

  return (
    <Suspense fallback={<div className="container-voya py-24" />}>
      <ShopView catalog={products} />
    </Suspense>
  );
}
