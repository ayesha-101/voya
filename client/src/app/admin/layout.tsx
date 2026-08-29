import type { Metadata } from "next";
import { AdminGuard } from "@/components/admin/AdminGuard";

export const metadata: Metadata = { title: "لوحة التحكّم" };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <h1 className="text-3xl font-extrabold text-ink">لوحة التحكّم</h1>
      <span className="mt-3 mb-8 block h-1 w-14 rounded-full bg-gold-500" />
      <AdminGuard>{children}</AdminGuard>
    </div>
  );
}
