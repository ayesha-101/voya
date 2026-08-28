import type { Metadata } from "next";
import { AccountView } from "@/components/AccountView";

export const metadata: Metadata = { title: "حسابي" };

export default function AccountPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="text-3xl font-extrabold text-ink">حسابي</h1>
      <span className="mt-3 mb-8 block h-1 w-14 rounded-full bg-rose-500" />
      <AccountView />
    </div>
  );
}
