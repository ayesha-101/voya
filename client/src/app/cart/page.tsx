import CartView from "@/components/cart/CartView";
import { fetchProducts } from "@/lib/server-api";

export const metadata = { title: "سلة التسوّق" };

export default async function CartPage() {
  // الكتالوج لازم لاقتراحات الشراء وللتراجع عن الحذف
  const { products } = await fetchProducts({ limit: 100 }).catch(() => ({ products: [] }));
  return <CartView catalog={products} />;
}
