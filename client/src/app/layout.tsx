import type { Metadata } from "next";
import { Tajawal } from "next/font/google";
import "./globals.css";
import { site } from "@/data/site";
import { fetchCategories } from "@/lib/server-api";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { DemoBanner } from "@/components/DemoBanner";
import { AuthProvider } from "@/components/AuthProvider";
import { CartProvider } from "@/components/CartProvider";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { WhatsAppButton } from "@/components/WhatsAppButton";

const tajawal = Tajawal({
  variable: "--font-tajawal",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${site.nameEn} – ${site.taglineEn}`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  openGraph: {
    title: `${site.nameEn} – ${site.taglineEn}`,
    description: site.description,
    locale: "ar_AE",
    type: "website",
  },
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // التصنيفات تُقرأ من الواجهة البرمجية؛ إن كان الخادم متوقفًا يبقى المتجر يعمل
  const categories = await fetchCategories().catch(() => []);

  return (
    <html lang="ar" dir="rtl" className={`${tajawal.variable} h-full`}>
      <body className="flex min-h-full flex-col font-sans">
        <AuthProvider>
          <CartProvider>
            <AnnouncementBar />
            <DemoBanner />
            <Header categories={categories} />
            <main className="flex-1">{children}</main>
            <Footer categories={categories} />
            <WhatsAppButton />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
