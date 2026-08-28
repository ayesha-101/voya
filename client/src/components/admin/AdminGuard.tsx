"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "../AuthProvider";
import { ChartIcon, PackageIcon } from "../Icons";

const tabs = [
  { href: "/admin", label: "نظرة عامة", Icon: ChartIcon },
  { href: "/admin/products", label: "المنتجات", Icon: PackageIcon },
  { href: "/admin/orders", label: "الطلبات", Icon: PackageIcon },
];

/** يحمي صفحات اللوحة على العميل — الخادم يفرض الصلاحية فعليًا على كل نداء. */
export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, ready } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (ready && !user) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [ready, user, router, pathname]);

  if (!ready) return <div className="h-96 animate-pulse rounded-card bg-sand-100" />;

  if (!user) return null;

  if (user.role !== "admin") {
    return (
      <div className="rounded-card border border-sand-200 bg-sand-50 py-20 text-center">
        <p className="text-lg font-bold text-ink">هذه الصفحة للمديرين فقط</p>
        <p className="mt-2 text-sm text-muted">حسابك الحالي: {user.email}</p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-full bg-sea-700 px-8 py-3.5 font-bold text-white transition hover:bg-sea-800"
        >
          العودة للمتجر
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <nav className="flex gap-2 border-b border-sand-200 pb-3">
        {tabs.map(({ href, label, Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition ${
                active ? "bg-sea-700 text-white" : "text-ink hover:bg-sand-100"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>
      {children}
    </div>
  );
}
