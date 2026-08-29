import type { Metadata } from "next";
import { Cormorant_Garamond, Jost, Tajawal } from "next/font/google";
import "./globals.css";
import { site } from "@/data/site";
import { fetchCategories } from "@/lib/server-api";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { AuthProvider } from "@/components/AuthProvider";
import { CartDrawer } from "@/components/CartDrawer";
import { CartProvider } from "@/components/CartProvider";
import { DemoBanner } from "@/components/DemoBanner";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { LangProvider } from "@/components/LangProvider";
import { SearchOverlay } from "@/components/SearchOverlay";
import { UIProvider } from "@/components/UIProvider";
import { WhatsAppButton } from "@/components/WhatsAppButton";

const tajawal = Tajawal({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "700", "800"],
  variable: "--font-tajawal",
  display: "swap",
});

const jost = Jost({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-jost",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
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
    // اللغة والاتجاه يبدآن عربيًا ويُحدّثهما LangProvider عند التبديل
    <html
      lang="ar"
      dir="rtl"
      className={`${tajawal.variable} ${jost.variable} ${cormorant.variable} h-full`}
    >
      <body className="flex min-h-full flex-col">
        <LangProvider>
          <AuthProvider>
            <CartProvider>
              <UIProvider>
              <AnnouncementBar />
              <DemoBanner />
              <Header categories={categories} />
              <main className="flex-1">{children}</main>
              <Footer categories={categories} />
              <WhatsAppButton />
                <CartDrawer />
                <SearchOverlay />
              </UIProvider>
            </CartProvider>
          </AuthProvider>
        </LangProvider>
      </body>
    </html>
  );
}
