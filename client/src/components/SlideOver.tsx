"use client";

import { useEffect, useRef } from "react";

/**
 * لوحة منزلقة من جانب الصفحة — تُغلق بـ Escape أو بالنقر خارجها،
 * وتُعيد التركيز إلى ما كان قبل فتحها.
 */
export function SlideOver({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const previous = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
      previous?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label={title}>
      <button
        type="button"
        aria-label="إغلاق"
        onClick={onClose}
        className="absolute inset-0 bg-plum-900/45 backdrop-blur-[2px]"
      />
      <div
        ref={panelRef}
        tabIndex={-1}
        className="animate-fade-up absolute inset-y-0 end-0 flex w-full max-w-md flex-col bg-blush-50 shadow-2xl outline-none"
      >
        <header className="flex items-center justify-between border-b border-blush-200 px-5 py-4">
          <h2 className="display text-xl text-plum-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
            className="grid h-9 w-9 place-items-center rounded-full border border-blush-300 text-plum-700 transition hover:border-gold-400"
          >
            ✕
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>

        {footer && (
          <footer className="border-t border-blush-200 bg-white px-5 py-4">{footer}</footer>
        )}
      </div>
    </div>
  );
}
