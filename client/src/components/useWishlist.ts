"use client";

import { useSyncExternalStore } from "react";
import {
  clearWishlist,
  getWishlistServerSnapshot,
  getWishlistSnapshot,
  subscribeWishlist,
  toggleWishlist,
} from "@/lib/wishlistStore";

export function useWishlist() {
  const slugs = useSyncExternalStore(
    subscribeWishlist,
    getWishlistSnapshot,
    getWishlistServerSnapshot,
  );

  return {
    slugs,
    count: slugs.length,
    has: (slug: string) => slugs.includes(slug),
    toggle: toggleWishlist,
    clear: clearWishlist,
  };
}
