type Shape = "bottle" | "jar" | "tube" | "pouch" | "box";

const GEOMETRY: Record<Shape, { width: string; capHeight: string; bodyHeight: string; radius: string }> = {
  bottle: { width: "48%", capHeight: "24px", bodyHeight: "62%", radius: "26px 26px 18px 18px" },
  jar: { width: "64%", capHeight: "18px", bodyHeight: "42%", radius: "22px" },
  tube: { width: "38%", capHeight: "22px", bodyHeight: "64%", radius: "30px 30px 14px 14px" },
  pouch: { width: "56%", capHeight: "12px", bodyHeight: "46%", radius: "999px 999px 40px 40px" },
  box: { width: "70%", capHeight: "14px", bodyHeight: "44%", radius: "16px" },
};

/** رسم العبوة بالتدرّجات — بديل صور المنتجات، بلا أي أصول خارجية. */
export function ProductArt({
  shape = "bottle",
  tone,
  label,
  className = "",
}: {
  shape?: Shape;
  tone: readonly [string, string] | string[];
  label?: string;
  className?: string;
}) {
  const g = GEOMETRY[shape];
  const [from, to] = tone;

  return (
    <div className={`relative flex items-end justify-center overflow-hidden ${className}`} aria-label={label}>
      <div className="pointer-events-none absolute start-[19%] top-[16%] aspect-square w-[62%] rounded-full bg-white/45" aria-hidden />
      {/* h-full يورّث الارتفاع حتى تُحلّ النسب المئوية أدناه */}
      <div className="relative flex h-full flex-col justify-end pb-[12%]" style={{ width: g.width }}>
        <div
          className="mx-auto w-[38%]"
          style={{ height: g.capHeight, borderRadius: "8px 8px 0 0", background: "linear-gradient(180deg, #efd49b, #c9a227)" }}
        />
        <div
          className="flex flex-col items-center justify-center gap-1.5"
          style={{
            height: g.bodyHeight,
            minHeight: 96,
            borderRadius: g.radius,
            background: `linear-gradient(150deg, ${from}, ${to})`,
            boxShadow: "inset -12px 0 22px rgba(76,35,51,.16), 0 14px 26px rgba(108,42,72,.18)",
          }}
        >
          <span className="display text-[15px] tracking-[0.2em] text-white">VOYA</span>
          <span className="h-px w-10 bg-white/55" />
        </div>
      </div>
    </div>
  );
}
