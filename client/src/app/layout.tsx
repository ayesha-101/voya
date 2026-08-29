import type { Metadata } from "next";
import { Tajawal, El_Messiri, Aref_Ruqaa } from "next/font/google";
import { LangProvider } from "@/components/LangProvider";
import { AuthProvider } from "@/components/AuthProvider";
import { CartProvider } from "@/components/CartProvider";
import { DemoBanner } from "@/components/DemoBanner";
import { UIProvider } from "@/components/UIProvider";
import { CartDrawer } from "@/components/CartDrawer";
import { SearchOverlay } from "@/components/SearchOverlay";
import { ToastHost } from "@/components/Toast";
import { Navbar } from "@/components/Navbar";
import Footer from "@/components/Footer";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { fetchCategories } from "@/lib/server-api";
import { site } from "@/data/site";
import "./globals.css";

// خطوط القالب: Tajawal للنص، El Messiri للعناوين، Aref Ruqaa للزخرفة
const tajawal = Tajawal({ subsets: ["arabic"], weight: ["300", "400", "500", "700", "800"], variable: "--font-tajawal" });
const messiri = El_Messiri({ subsets: ["arabic"], weight: ["400", "500", "600", "700"], variable: "--font-messiri" });
const ruqaa = Aref_Ruqaa({ subsets: ["arabic"], weight: ["400", "700"], variable: "--font-ruqaa" });

export const metadata: Metadata = {
  title: { default: `${site.name} — ${site.tagline}`, template: `%s | ${site.name}` },
  description: site.description,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // التصنيفات تُقرأ من الواجهة البرمجية؛ إن كان الخادم متوقفًا يبقى المتجر يعمل
  const categories = await fetchCategories().catch(() => []);
  return (
    <html lang="ar" dir="rtl" className={`${tajawal.variable} ${messiri.variable} ${ruqaa.variable}`}>
      <body>
        {/* المزوّدان مطلوبان للسلة وتسجيل الدخول — لا أثر بصري لهما */}
        <LangProvider>
          <AuthProvider>
            <CartProvider>
              <UIProvider>
                <DemoBanner />
                <Navbar categories={categories} />
                <main>{children}</main>
                <Footer categories={categories} />
                <WhatsAppButton />
                <CartDrawer />
                <SearchOverlay />
                <ToastHost />
              </UIProvider>
            </CartProvider>
          </AuthProvider>
        </LangProvider>
      </body>
    </html>
  );
}
