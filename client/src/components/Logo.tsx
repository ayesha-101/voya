import Link from "next/link";

export function Logo({ inverted = false }: { inverted?: boolean }) {
  return (
    <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label="ڤويا ستور — الصفحة الرئيسية">
      <span
        className={`grid h-10 w-10 place-items-center rounded-xl ${
          inverted ? "bg-white text-plum-800" : "bg-plum-700 text-white"
        }`}
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <path d="M20 4C10 4 4 9 4 16c0 2 .6 3.3.6 3.3S9 11 19 8" />
          <path d="M4.6 19.3C13 19.6 20 15 20 4" />
        </svg>
      </span>
      <span className="leading-tight">
        <span
          className={`block text-lg font-extrabold tracking-[0.18em] ${
            inverted ? "text-white" : "text-plum-800"
          }`}
        >
          VOYA
        </span>
        <span
          className={`block text-[10px] tracking-wide ${
            inverted ? "text-blush-200" : "text-muted"
          }`}
        >
          منتجات مختارة بعناية
        </span>
      </span>
    </Link>
  );
}
