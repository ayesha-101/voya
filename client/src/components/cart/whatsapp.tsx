"use client";

import type { TemplateCartItem } from "@/components/cartAdapter";
import { formatPrice } from "@/lib/voya";

export const WHATSAPP_NUMBER = '971553633977';

/** Custom WhatsApp glyph (lucide has no brand icons). */
export function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M12.04 2a9.9 9.9 0 0 0-8.5 14.93L2 22l5.2-1.5A9.9 9.9 0 1 0 12.04 2Zm-3.13 6c-.17 0-.45.06-.68.32-.23.25-.9.87-.9 2.13 0 1.25.92 2.46 1.05 2.63.12.17 1.8 2.88 4.45 3.92 2.2.87 2.65.7 3.13.65.48-.04 1.54-.62 1.76-1.23.22-.6.22-1.13.15-1.24-.06-.1-.23-.17-.49-.3-.25-.12-1.54-.76-1.78-.85-.24-.08-.41-.13-.59.13-.17.26-.67.85-.82 1.02-.15.17-.3.2-.56.07a7.2 7.2 0 0 1-2.1-1.3 7.9 7.9 0 0 1-1.45-1.8c-.15-.26-.02-.4.12-.53.12-.12.26-.3.39-.46.13-.15.17-.26.26-.43.09-.18.05-.33-.02-.46-.07-.13-.58-1.4-.8-1.92-.2-.5-.41-.44-.58-.45l-.62-.02Z" />
    </svg>
  );
}

/** Pre-filled «order via WhatsApp» link carrying the full cart contents. */
export function buildWhatsAppOrderUrl(items: TemplateCartItem[], total: number): string {
  const message = `مرحبًا فويا 🌸 أودّ طلب:\n${items
    .map((i) => `• ${i.product.name} ×${i.qty} — ${formatPrice(i.product.price * i.qty)}`)
    .join('\n')}\nالإجمالي: ${formatPrice(total)}`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

/** Pre-filled support / order-tracking link. */
export function buildWhatsAppChatUrl(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
