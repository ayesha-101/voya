"use client";

export function QuantityStepper({
  value,
  onChange,
  max = 99,
  label = "الكمية",
}: {
  value: number;
  onChange: (next: number) => void;
  max?: number;
  label?: string;
}) {
  return (
    <div
      className="inline-flex items-center rounded-full border border-blush-300 bg-white"
      role="group"
      aria-label={label}
    >
      <button
        type="button"
        onClick={() => onChange(Math.max(1, value - 1))}
        disabled={value <= 1}
        aria-label="إنقاص الكمية"
        className="grid h-10 w-10 place-items-center rounded-full text-lg font-bold text-plum-700 transition hover:bg-blush-100 disabled:opacity-30"
      >
        −
      </button>
      <span className="nums w-10 text-center text-[15px] font-bold">{value}</span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label="زيادة الكمية"
        className="grid h-10 w-10 place-items-center rounded-full text-lg font-bold text-plum-700 transition hover:bg-blush-100 disabled:opacity-30"
      >
        +
      </button>
    </div>
  );
}
