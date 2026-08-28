import { StarIcon } from "./Icons";

export function Rating({
  value,
  reviews,
  size = "sm",
}: {
  value: number;
  reviews?: number;
  size?: "sm" | "md";
}) {
  const px = size === "sm" ? "h-3.5 w-3.5" : "h-4.5 w-4.5";
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5 text-rose-500">
        {[0, 1, 2, 3, 4].map((i) => (
          <StarIcon
            key={i}
            className={`${px} ${i < Math.round(value) ? "opacity-100" : "opacity-25"}`}
          />
        ))}
      </div>
      <span className="nums text-xs text-muted">
        {value.toFixed(1)}
        {reviews !== undefined ? ` (${reviews})` : ""}
      </span>
    </div>
  );
}
