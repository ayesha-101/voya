import type { Metadata } from "next";
import { WishlistHeading } from "@/components/WishlistHeading";
import { WishlistView } from "@/components/WishlistView";

export const metadata: Metadata = { title: "المفضّلة" };

export default function WishlistPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <WishlistHeading />
      <WishlistView />
    </div>
  );
}
