"use client";

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Copy, Mail, Phone } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
    </svg>
  );
}

type Channel = {
  id: string;
  title: string;
  badge?: string;
  value: string;
  copyValue: string;
  note: string;
  action: { label: string; href: string; external?: boolean };
  icon: 'whatsapp' | LucideIcon;
  primary?: boolean;
};

const CHANNELS: Channel[] = [
  {
    id: 'whatsapp',
    title: 'واتساب',
    badge: 'الأسرع ⚡',
    value: '+971 55 3633 977',
    copyValue: '+971553633977',
    note: 'رد خلال دقائق في أوقات الدوام',
    action: { label: 'ابدئي المحادثة', href: 'https://wa.me/971553633977', external: true },
    icon: 'whatsapp',
    primary: true,
  },
  {
    id: 'phone',
    title: 'اتصال هاتفي',
    value: '+971 55 3633 977',
    copyValue: '+971553633977',
    note: 'كل يوم من 9 صباحًا حتى 10 مساءً',
    action: { label: 'اتصلي الآن', href: 'tel:+971553633977' },
    icon: Phone,
  },
  {
    id: 'email',
    title: 'البريد الإلكتروني',
    value: 'voyagroups@gmail.com',
    copyValue: 'voyagroups@gmail.com',
    note: 'نرد خلال 24 ساعة كحد أقصى',
    action: { label: 'راسلينا', href: 'mailto:voyagroups@gmail.com' },
    icon: Mail,
  },
];

export default function ChannelsCard() {
  const [copied, setCopied] = useState<string | null>(null);

  const copy = async (c: Channel) => {
    try {
      await navigator.clipboard.writeText(c.copyValue);
      setCopied(c.id);
      window.setTimeout(() => setCopied((prev) => (prev === c.id ? null : prev)), 2200);
    } catch {
      /* clipboard unavailable — no-op */
    }
  };

  return (
    <section className="bg-blush-50">
      <div className="container-voya py-16 md:py-20">
        <div className="grid gap-6 md:grid-cols-3">
          {CHANNELS.map((c, i) => {
            const Icon = c.icon === 'whatsapp' ? null : c.icon;
            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 36 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.7, delay: i * 0.12, ease: EASE }}
                whileHover={{ y: -6 }}
                className="group flex flex-col items-center rounded-[28px] bg-white p-8 text-center shadow-card transition-shadow duration-300 hover:shadow-card-hover"
              >
                <motion.span
                  className="flex h-16 w-16 items-center justify-center rounded-full bg-blush-200 text-[#1FA855]"
                  animate={{ scale: [1, 1.06, 1] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut', delay: i * 0.4 }}
                >
                  {c.icon === 'whatsapp' ? (
                    <WhatsAppIcon className="h-8 w-8" />
                  ) : (
                    Icon && <Icon className="h-7 w-7 text-rose" strokeWidth={1.5} />
                  )}
                </motion.span>

                <h3 className="mt-5 flex items-center gap-2 text-lg font-semibold text-plum md:text-xl">
                  {c.title}
                  {c.badge && (
                    <span className="rounded-full bg-gold-soft px-2.5 py-0.5 text-[11px] font-bold text-plum">
                      {c.badge}
                    </span>
                  )}
                </h3>

                {/* tap to copy */}
                <button
                  type="button"
                  onClick={() => copy(c)}
                  title="اضغطي للنسخ"
                  className="tnum mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[15px] font-bold text-plum transition-colors hover:bg-blush-100 hover:text-rose-deep"
                  dir="ltr"
                >
                  {c.value}
                  <Copy className="h-3.5 w-3.5 text-ink-soft" strokeWidth={1.5} />
                </button>
                <p className="font-body mt-1 text-[13px] text-ink-soft">{c.note}</p>

                <a
                  href={c.action.href}
                  {...(c.action.external ? { target: '_blank', rel: 'noreferrer' } : {})}
                  className={
                    c.primary
                      ? 'mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#1FA855] py-3 text-[14px] font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#178a44]'
                      : 'mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-blush-200 py-3 text-[14px] font-bold text-rose-deep transition-all duration-300 hover:-translate-y-0.5 hover:border-rose hover:bg-blush-100'
                  }
                >
                  {c.action.label}
                </a>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* copy toast */}
      <AnimatePresence>
        {copied && (
          <motion.div
            key="copy-toast"
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="fixed left-1/2 top-24 z-[90] flex -translate-x-1/2 items-center gap-2 rounded-full bg-plum px-5 py-2.5 text-sm font-semibold text-blush-50 shadow-modal"
            role="status"
          >
            <Check className="h-4 w-4 text-success" strokeWidth={2.5} />
            تم النسخ 🌸
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
