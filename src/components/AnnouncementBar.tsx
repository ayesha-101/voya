import { announcements } from "@/data/site";

export function AnnouncementBar() {
  const strip = [...announcements, ...announcements];
  return (
    <div className="overflow-hidden bg-sea-800 text-white">
      <div className="flex w-max animate-marquee gap-10 py-2 text-[13px] font-medium whitespace-nowrap">
        {strip.map((text, i) => (
          <span key={i} className="flex items-center gap-10">
            {text}
            <span className="text-gold-400" aria-hidden>
              ✦
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
