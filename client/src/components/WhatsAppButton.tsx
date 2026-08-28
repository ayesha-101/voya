import { site } from "@/data/site";
import { WhatsAppIcon } from "./Icons";

export function WhatsAppButton() {
  return (
    <a
      href={`https://wa.me/${site.whatsapp}?text=${encodeURIComponent("مرحبًا، لدي استفسار عن منتجات ڤويا")}`}
      target="_blank"
      rel="noreferrer"
      aria-label="تواصل معنا عبر واتساب"
      className="fixed bottom-5 start-5 z-40 flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 font-bold text-white shadow-lg shadow-black/20 transition hover:scale-105"
    >
      <WhatsAppIcon className="h-6 w-6" />
      <span className="hidden text-sm sm:inline">اسألنا على واتساب</span>
    </a>
  );
}
