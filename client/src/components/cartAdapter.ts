import type { CartItem, Product } from "@/lib/types";
import { productColors, productImages } from "@/lib/voya";

/**
 * مكوّنات السلة في القالب تتوقّع `item.product` بكامل حقول المنتج،
 * بينما بند سلتنا مسطّح ويأتي من الخادم. هذا الجسر يبني منه الشكل
 * الذي تحتاجه تلك المكوّنات — الحقول المستعملة فعلًا لا أكثر.
 */
export type TemplateCartProduct = {
  id: string;
  name: string;
  price: number;
  category: string;
  images: string[];
  colors: { name: string; hex: string }[];
  stock: number;
  size: string;
};

export function toTemplateProduct(item: CartItem): TemplateCartProduct {
  const asProduct = {
    slug: item.slug,
    category: item.category,
    tone: item.tone,
  } as Product;

  return {
    id: item.slug,
    name: item.name,
    price: item.unitPrice,
    category: item.categoryName,
    images: productImages(asProduct),
    colors: productColors(asProduct),
    stock: item.stock,
    size: item.size,
  };
}

/** شكل بند السلة كما تتوقّعه مكوّنات القالب. */
export type TemplateCartItem = {
  product: TemplateCartProduct;
  qty: number;
  color?: string;
};

export function toTemplateItem(item: CartItem): TemplateCartItem {
  return { product: toTemplateProduct(item), qty: item.qty };
}
