import type { Shape } from "@/lib/types";

/**
 * صورة المنتج مولّدة كـ SVG محليًا — لا تعتمد على أي ملف خارجي.
 * استبدلها بصور حقيقية عبر next/image عند توفّر صور المنتجات.
 */
export function ProductArt({
  shape,
  tone,
  label,
  className = "",
}: {
  shape: Shape;
  tone: [string, string];
  label: string;
  className?: string;
}) {
  const id = `${shape}-${tone[0]}-${tone[1]}`.replace(/[^a-z0-9]/gi, "");

  return (
    <svg
      viewBox="0 0 240 300"
      className={className}
      role="img"
      aria-label={label}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id={`g-${id}`} x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0%" stopColor={tone[0]} />
          <stop offset="100%" stopColor={tone[1]} />
        </linearGradient>
        <linearGradient id={`s-${id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.32" />
          <stop offset="45%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* ظل أرضي */}
      <ellipse cx="120" cy="272" rx="62" ry="9" fill="#4c1c33" opacity="0.12" />

      {shape === "bottle" && (
        <g>
          <rect x="104" y="30" width="32" height="30" rx="6" fill={tone[1]} />
          <rect x="98" y="54" width="44" height="14" rx="5" fill={tone[0]} />
          <path
            d="M84 80c0-7 6-12 13-12h46c7 0 13 5 13 12v150c0 12-9 22-21 22H105c-12 0-21-10-21-22z"
            fill={`url(#g-${id})`}
          />
          <path
            d="M84 80c0-7 6-12 13-12h46c7 0 13 5 13 12v150c0 12-9 22-21 22H105c-12 0-21-10-21-22z"
            fill={`url(#s-${id})`}
          />
          <rect x="98" y="140" width="44" height="46" rx="4" fill="#fffaf9" opacity="0.9" />
        </g>
      )}

      {shape === "jar" && (
        <g>
          <rect x="72" y="66" width="96" height="24" rx="10" fill={tone[1]} />
          <path
            d="M74 92h92v100c0 20-16 36-36 36h-20c-20 0-36-16-36-36z"
            fill={`url(#g-${id})`}
          />
          <path
            d="M74 92h92v100c0 20-16 36-36 36h-20c-20 0-36-16-36-36z"
            fill={`url(#s-${id})`}
          />
          <rect x="90" y="140" width="60" height="42" rx="4" fill="#fffaf9" opacity="0.9" />
        </g>
      )}

      {shape === "tube" && (
        <g>
          <rect x="106" y="34" width="28" height="22" rx="5" fill={tone[1]} />
          <path
            d="M92 60h56v168c0 8-6 14-14 14h-28c-8 0-14-6-14-14z"
            fill={`url(#g-${id})`}
          />
          <path
            d="M92 60h56v168c0 8-6 14-14 14h-28c-8 0-14-6-14-14z"
            fill={`url(#s-${id})`}
          />
          <rect x="92" y="232" width="56" height="10" fill={tone[1]} opacity="0.85" />
          <rect x="102" y="120" width="36" height="52" rx="4" fill="#fffaf9" opacity="0.9" />
        </g>
      )}

      {shape === "box" && (
        <g>
          <path d="M60 92l60-30 60 30-60 30z" fill={tone[0]} />
          <path d="M60 92v112l60 30V122z" fill={`url(#g-${id})`} />
          <path d="M180 92v112l-60 30V122z" fill={tone[1]} />
          <path d="M60 92l60-30 60 30-60 30z" fill={`url(#s-${id})`} />
          <rect x="76" y="140" width="34" height="44" rx="3" fill="#fffaf9" opacity="0.88" />
        </g>
      )}

      {shape === "pouch" && (
        <g>
          <path
            d="M76 62h88l10 24v134c0 10-8 18-18 18H84c-10 0-18-8-18-18V86z"
            fill={`url(#g-${id})`}
          />
          <path
            d="M76 62h88l10 24v134c0 10-8 18-18 18H84c-10 0-18-8-18-18V86z"
            fill={`url(#s-${id})`}
          />
          <rect x="66" y="56" width="108" height="14" rx="7" fill={tone[1]} />
          <rect x="92" y="132" width="56" height="46" rx="4" fill="#fffaf9" opacity="0.9" />
        </g>
      )}

      {/* شعار مصغّر على الملصق */}
      <text
        x="120"
        y="167"
        textAnchor="middle"
        fontSize="15"
        fontWeight="700"
        letterSpacing="3"
        fill={tone[1]}
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        VOYA
      </text>
    </svg>
  );
}
