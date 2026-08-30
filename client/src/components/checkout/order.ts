import type { TemplateCartItem as CartItem } from "@/components/cartAdapter";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/voya";

const getShipping = (subtotal: number) =>
  subtotal <= 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : 25;
import { getCouponDiscount } from '@/components/cart/coupon';
import type { PaymentMethod } from '@/components/checkout/PaymentStep';

export type ShippingMethod = 'standard' | 'express';

export const STANDARD_SHIPPING_FEE = 25;
export const EXPRESS_SHIPPING_FEE = 40;

export interface ShippingData {
  fullName: string;
  phone: string;
  email: string;
  city: string;
  district: string;
  address: string;
  notes: string;
  method: ShippingMethod;
}

export const initialShipping: ShippingData = {
  fullName: '',
  phone: '',
  email: '',
  city: '',
  district: '',
  address: '',
  notes: '',
  method: 'standard',
};

export interface OrderSnapshot {
  orderNumber: string;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
}

export interface Totals {
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
}

export function computeTotals(
  subtotal: number,
  coupon: string | null,
  method: ShippingMethod,
  _payment: PaymentMethod,
): Totals {
  const discount = getCouponDiscount(subtotal, coupon);
  const shipping = method === 'express' ? EXPRESS_SHIPPING_FEE : getShipping(subtotal);
  return { subtotal, shipping, discount, total: Math.max(0, subtotal + shipping - discount) };
}
