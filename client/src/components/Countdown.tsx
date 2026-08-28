"use client";

import { useEffect, useState } from "react";

/** عدّاد تنازلي يبدأ من الآن + عدد الساعات المحدد، ويُحسب على العميل فقط. */
export function Countdown({ hours = 36 }: { hours?: number }) {
  const [left, setLeft] = useState<number | null>(null);

  useEffect(() => {
    const deadline = Date.now() + hours * 3600_000;
    const tick = () => setLeft(Math.max(0, deadline - Date.now()));
    const first = setTimeout(tick, 0);
    const id = setInterval(tick, 1000);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, [hours]);

  const parts: { label: string; value: number | null }[] =
    left === null
      ? [
          { label: "ساعة", value: null },
          { label: "دقيقة", value: null },
          { label: "ثانية", value: null },
        ]
      : [
          { label: "ساعة", value: Math.floor(left / 3600_000) },
          { label: "دقيقة", value: Math.floor((left / 60_000) % 60) },
          { label: "ثانية", value: Math.floor((left / 1000) % 60) },
        ];

  // قبل التحميل نعرض هيكلًا بنفس المقاس حتى لا تقفز الصفحة
  return (
    <div className="flex gap-3" aria-label="الوقت المتبقي على العرض">
      {parts.map((p) => (
        <div key={p.label} className="min-w-16 rounded-xl bg-white/10 px-3 py-2.5 text-center">
          <span className="nums block text-2xl font-extrabold text-gold-400">
            {p.value === null ? "--" : String(p.value).padStart(2, "0")}
          </span>
          <span className="block text-[11px] text-sand-100/70">{p.label}</span>
        </div>
      ))}
    </div>
  );
}
