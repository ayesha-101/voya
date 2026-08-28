type Props = React.SVGProps<SVGSVGElement>;

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  viewBox: "0 0 24 24",
};

export const CartIcon = (p: Props) => (
  <svg {...base} {...p}>
    <path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.7a2 2 0 0 0 2-1.5L21 8H6" />
    <circle cx="10" cy="20" r="1.4" />
    <circle cx="18" cy="20" r="1.4" />
  </svg>
);

export const SearchIcon = (p: Props) => (
  <svg {...base} {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);

export const MenuIcon = (p: Props) => (
  <svg {...base} {...p}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
);

export const CloseIcon = (p: Props) => (
  <svg {...base} {...p}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

export const StarIcon = (p: Props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
    <path d="M12 2.6l2.9 5.9 6.5.95-4.7 4.58 1.11 6.47L12 17.45 6.19 20.5l1.11-6.47L2.6 9.45l6.5-.95z" />
  </svg>
);

export const TruckIcon = (p: Props) => (
  <svg {...base} {...p}>
    <path d="M3 7h11v9H3zM14 10h3.5l2.5 3v3h-6z" />
    <circle cx="7" cy="18" r="1.6" />
    <circle cx="17" cy="18" r="1.6" />
  </svg>
);

export const LeafIcon = (p: Props) => (
  <svg {...base} {...p}>
    <path d="M20 4C10 4 4 9 4 16c0 2 .6 3.3.6 3.3S9 11 19 8" />
    <path d="M4.6 19.3C13 19.6 20 15 20 4" />
  </svg>
);

export const ShieldIcon = (p: Props) => (
  <svg {...base} {...p}>
    <path d="M12 3l7 3v5c0 5-3 8.2-7 10-4-1.8-7-5-7-10V6z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

export const CashIcon = (p: Props) => (
  <svg {...base} {...p}>
    <rect x="2.5" y="6" width="19" height="12" rx="2" />
    <circle cx="12" cy="12" r="2.6" />
    <path d="M6 12h.01M18 12h.01" />
  </svg>
);

export const WhatsAppIcon = (p: Props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
    <path d="M12.04 2C6.6 2 2.2 6.4 2.2 11.84c0 1.94.53 3.75 1.45 5.31L2 22l4.98-1.6a9.8 9.8 0 0 0 5.06 1.4h.01c5.43 0 9.84-4.4 9.84-9.84S17.47 2 12.04 2m5.73 13.9c-.24.68-1.42 1.3-1.95 1.34-.5.05-.98.23-3.3-.7-2.78-1.1-4.53-3.96-4.67-4.14s-1.11-1.48-1.11-2.83.71-2 .96-2.28c.25-.27.55-.34.73-.34l.52.01c.17 0 .4-.06.62.48.24.57.8 1.98.87 2.12s.12.31.02.5c-.1.18-.15.3-.29.46s-.3.36-.43.48c-.14.14-.29.3-.13.58s.71 1.18 1.53 1.91c1.05.94 1.94 1.23 2.22 1.37s.44.12.6-.07.69-.81.88-1.09.37-.23.62-.14 1.6.76 1.87.9.46.2.53.32c.07.11.07.66-.17 1.34" />
  </svg>
);

export const InstagramIcon = (p: Props) => (
  <svg {...base} {...p}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
    <circle cx="12" cy="12" r="3.8" />
    <path d="M16.9 7.1h.01" />
  </svg>
);

export const TiktokIcon = (p: Props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
    <path d="M16.5 3h-2.9v12.2a2.5 2.5 0 1 1-2.1-2.47V9.7a5.6 5.6 0 1 0 5.1 5.57V9.2a6.6 6.6 0 0 0 3.7 1.14V7.4A3.9 3.9 0 0 1 16.5 3" />
  </svg>
);

export const SnapchatIcon = (p: Props) => (
  <svg {...base} {...p}>
    <path d="M12 3.2c2.7 0 4.2 1.9 4.2 4.4 0 .9-.1 1.7-.1 2.3.5.3 1.1.1 1.5 0 .5-.1.9.2.9.6 0 .6-.9.9-1.6 1.2-.4.2-.6.4-.4.9.5 1.3 2 2.6 3.3 2.9.4.1.5.4.4.7-.2.6-1.5.9-2.4 1-.3 0-.4.3-.5.7-.1.4-.2.7-.7.7-.6 0-1.2-.3-2.2-.3-1.3 0-1.8 1.3-3.5 1.3s-2.2-1.3-3.5-1.3c-1 0-1.6.3-2.2.3-.5 0-.6-.3-.7-.7-.1-.4-.2-.7-.5-.7-.9-.1-2.2-.4-2.4-1-.1-.3 0-.6.4-.7 1.3-.3 2.8-1.6 3.3-2.9.2-.5 0-.7-.4-.9-.7-.3-1.6-.6-1.6-1.2 0-.4.4-.7.9-.6.4.1 1 .3 1.5 0 0-.6-.1-1.4-.1-2.3 0-2.5 1.5-4.4 4.2-4.4Z" />
  </svg>
);


export const FaceIcon = (p: Props) => (
  <svg {...base} {...p}>
    <path d="M12 3c4.4 0 7.5 3 7.5 7.4 0 4.6-3.2 10.6-7.5 10.6S4.5 15 4.5 10.4C4.5 6 7.6 3 12 3" />
    <path d="M9 11h.01M15 11h.01M9.5 15.4c1.6 1.1 3.4 1.1 5 0" />
  </svg>
);

export const BodyIcon = (p: Props) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="5" r="2.4" />
    <path d="M12 9c-3 0-4.6 1.6-4.6 4v3.2h2L10 21h4l.6-4.8h2V13c0-2.4-1.6-4-4.6-4" />
  </svg>
);

export const BathIcon = (p: Props) => (
  <svg {...base} {...p}>
    <path d="M3 12h18v3a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5z" />
    <path d="M6 12V6.5A2.5 2.5 0 0 1 8.5 4c1.2 0 2.1.8 2.4 1.9" />
    <path d="M6 21l-1 1.5M18 21l1 1.5" />
  </svg>
);

export const HairIcon = (p: Props) => (
  <svg {...base} {...p}>
    <path d="M12 3c4 0 6.5 3 6.5 7v10M12 3C8 3 5.5 6 5.5 10v10" />
    <path d="M8.5 20c0-4 1-7 3.5-9M15.5 20c0-4-1-7-3.5-9" />
  </svg>
);

export const GiftIcon = (p: Props) => (
  <svg {...base} {...p}>
    <rect x="3.5" y="9" width="17" height="11.5" rx="2" />
    <path d="M2.5 9h19M12 9v11.5" />
    <path d="M12 9S10.6 4.5 8.4 4.5A2 2 0 0 0 8.4 9zM12 9s1.4-4.5 3.6-4.5A2 2 0 0 1 15.6 9z" />
  </svg>
);

export const BrushIcon = (p: Props) => (
  <svg {...base} {...p}>
    <path d="M5.5 14.5 14 6a2.8 2.8 0 0 1 4 4l-8.5 8.5z" />
    <path d="M5.5 14.5 4 20l5.5-1.5" />
    <path d="M15 5.5 18.5 9" />
  </svg>
);

export const categoryIcons = {
  face: FaceIcon,
  body: BodyIcon,
  bath: BathIcon,
  hair: HairIcon,
  gifts: GiftIcon,
  accessories: BrushIcon,
} as const;

export const icons = {
  instagram: InstagramIcon,
  tiktok: TiktokIcon,
  snapchat: SnapchatIcon,
  whatsapp: WhatsAppIcon,
} as const;
