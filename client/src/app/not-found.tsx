import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-6 py-24 text-center">
      <p className="nums text-6xl font-extrabold text-plum-200">404</p>
      <h1 className="mt-4 text-2xl font-extrabold text-ink">الصفحة غير موجودة</h1>
      <p className="mt-3 text-sm leading-7 text-muted">
        ربما تم نقل الصفحة أو حذفها. جرّب العودة للرئيسية أو تصفّح المنتجات.
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <Link
          href="/"
          className="rounded-full bg-plum-700 px-7 py-3.5 font-bold text-white transition hover:bg-plum-800"
        >
          الرئيسية
        </Link>
        <Link
          href="/products"
          className="rounded-full border border-blush-300 px-7 py-3.5 font-bold text-plum-700 transition hover:bg-blush-50"
        >
          المنتجات
        </Link>
      </div>
    </div>
  );
}
