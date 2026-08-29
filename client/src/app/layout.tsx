import type { Metadata } from "next";
import { Tajawal, Jost, Cormorant_Garamond } from "next/font/google";
import { LangProvider } from "@/components/LangProvider";
import { AuthProvider } from "@/components/AuthProvider";
import { CartProvider } from "@/components/CartProvider";
import { DemoBanner } from "@/components/DemoBanner";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { fetchCategories } from "@/lib/server-api";
import { site } from "@/data/site";
import "./globals.css";

const tajawal = Tajawal({ subsets: ["arabic"], weight: ["300", "400", "500", "700", "800"], variable: "--font-tajawal" });
const jost = Jost({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"], variable: "--font-jost" });
const cormorant = Cormorant_Garamond({ subsets: ["latin"], weight: ["400", "600"], style: ["normal", "italic"], variable: "--font-cormorant" });

export const metadata: Metadata = {
  title: { default: `${site.name} — ${site.tagline}`, template: `%s | ${site.name}` },
  description: site.description,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // التصنيفات تُقرأ من الواجهة البرمجية؛ إن كان الخادم متوقفًا يبقى المتجر يعمل
  const categories = await fetchCategories().catch(() => []);
  return (
    <html lang="ar" dir="rtl" className={`${tajawal.variable} ${jost.variable} ${cormorant.variable}`}>
      <body>
        {/* المزوّدان مطلوبان للسلة وتسجيل الدخول — لا أثر بصري لهما */}
        <LangProvider>
          <AuthProvider>
            <CartProvider>
              <DemoBanner />
              <Header categories={categories} />
              {children}
              <Footer categories={categories} />
              <WhatsAppButton />
            </CartProvider>
          </AuthProvider>
        </LangProvider>
      </body>
    </html>
  );
}
