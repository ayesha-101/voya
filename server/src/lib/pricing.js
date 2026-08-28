/** قواعد التسعير — مصدر واحد للحقيقة يستخدمه الخادم عند حساب أي طلب. */
export const FREE_SHIPPING_THRESHOLD = 200;
export const SHIPPING_FEE = 20;

export function priceCart(items) {
  const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.qty, 0);
  const shippingFee =
    subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  return {
    subtotal: Math.round(subtotal * 100) / 100,
    shippingFee,
    total: Math.round((subtotal + shippingFee) * 100) / 100,
  };
}
