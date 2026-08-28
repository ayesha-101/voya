/**
 * شارات وسائل الدفع المقبولة — رسومية بالكامل بلا صور خارجية.
 * إشارة بصرية فقط؛ توفّر Apple Pay و Google Pay فعليًا يقرّره جهاز العميل
 * وتُظهره Stripe تلقائيًا.
 */
export function WalletMarks() {
  return (
    <span className="flex shrink-0 items-center gap-1.5" aria-hidden>
      <Mark title="Visa">
        <span className="text-[9px] font-black tracking-tight text-[#1a1f71]">VISA</span>
      </Mark>
      <Mark title="Mastercard">
        <span className="relative flex">
          <span className="h-3 w-3 rounded-full bg-[#eb001b]" />
          <span className="-ms-1.5 h-3 w-3 rounded-full bg-[#f79e1b] opacity-90" />
        </span>
      </Mark>
      <Mark title="Apple Pay">
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-black">
          <path d="M16.2 12.6c0-2 1.6-3 1.7-3-.9-1.4-2.4-1.5-2.9-1.6-1.2-.1-2.4.7-3 .7s-1.6-.7-2.6-.7c-1.3 0-2.6.8-3.2 2-1.4 2.4-.4 6 1 8 .7 1 1.5 2.1 2.5 2 1-.1 1.4-.6 2.6-.6s1.5.6 2.6.6c1.1 0 1.8-1 2.4-2 .8-1.1 1.1-2.2 1.1-2.3 0 0-2.2-.8-2.2-3.1M14.3 6.2c.5-.7.9-1.6.8-2.6-.8 0-1.8.5-2.4 1.2-.5.6-.9 1.6-.8 2.5.9.1 1.8-.4 2.4-1.1" />
        </svg>
      </Mark>
      <Mark title="Google Pay">
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5">
          <path fill="#4285F4" d="M21.6 12.2c0-.7-.06-1.35-.18-2H12v3.8h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.75 3-4.32 3-7.3" />
          <path fill="#34A853" d="M12 22c2.7 0 4.97-.9 6.62-2.42l-3.2-2.5c-.9.6-2.05.95-3.42.95-2.62 0-4.84-1.77-5.63-4.15H3.06v2.6A10 10 0 0 0 12 22" />
          <path fill="#FBBC05" d="M6.37 13.88a6 6 0 0 1 0-3.83v-2.6H3.06a10 10 0 0 0 0 9.03z" />
          <path fill="#EA4335" d="M12 5.9c1.47 0 2.8.51 3.84 1.5l2.84-2.84C16.96 2.98 14.7 2 12 2A10 10 0 0 0 3.06 7.45l3.31 2.6C7.16 7.67 9.38 5.9 12 5.9" />
        </svg>
      </Mark>
    </span>
  );
}

function Mark({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <span
      title={title}
      className="grid h-6 w-9 place-items-center rounded border border-blush-200 bg-white"
    >
      {children}
    </span>
  );
}
