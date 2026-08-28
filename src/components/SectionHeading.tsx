import Link from "next/link";

export function SectionHeading({
  title,
  subtitle,
  href,
  linkLabel = "عرض الكل",
}: {
  title: string;
  subtitle?: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="mb-8 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-2xl font-extrabold text-ink sm:text-3xl">{title}</h2>
        {subtitle && <p className="mt-1.5 text-sm text-muted">{subtitle}</p>}
        <span className="mt-3 block h-1 w-14 rounded-full bg-gold-500" />
      </div>
      {href && (
        <Link
          href={href}
          className="shrink-0 rounded-full border border-sand-300 px-4 py-2 text-[13px] font-bold text-sea-700 transition hover:border-sea-400 hover:bg-sand-50"
        >
          {linkLabel} ←
        </Link>
      )}
    </div>
  );
}
