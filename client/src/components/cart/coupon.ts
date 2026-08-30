import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const COUPON_CODE = 'VOYA10';
export const COUPON_RATE = 0.1;

interface CouponState {
  code: string | null;
  /** returns true when the code is valid and was applied */
  apply: (code: string) => boolean;
  remove: () => void;
}

export const useCouponStore = create<CouponState>()(
  persist(
    (set) => ({
      code: null,
      apply: (code) => {
        const ok = code.trim().toUpperCase() === COUPON_CODE;
        if (ok) set({ code: COUPON_CODE });
        return ok;
      },
      remove: () => set({ code: null }),
    }),
    { name: 'voya-coupon' },
  ),
);

export const getCouponDiscount = (subtotal: number, code: string | null) =>
  code === COUPON_CODE && subtotal > 0 ? Math.round(subtotal * COUPON_RATE) : 0;
