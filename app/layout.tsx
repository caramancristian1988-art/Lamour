import type { Metadata } from "next";
import { Suspense } from "react";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { SiteHeader, SiteFooter, SiteFloatingContact, SiteDiscountPopup } from "./components/SiteChrome";
import ScrollToTop from "./components/ScrollToTop";
import { FavoritesProvider } from "./components/FavoritesProvider";
import { CartProvider } from "./components/CartProvider";
import { AuthProvider } from "./components/AuthProvider";
import { AuthModalProvider } from "./components/AuthModalProvider";
import AuthModal from "./components/AuthModal";
import { FloatingUIProvider } from "./components/FloatingUIState";
import { getSectionFlags, getHeaderCategories, getSocialLinks, getContactInfo } from "@/lib/siteSettings";

export const metadata: Metadata = {
  title: "Climat Rapid — Condiționere & Climatizare Moldova",
  description:
    "Magazin online de condiționere și sisteme de climatizare. Livrare și instalare în Moldova. Daikin, Mitsubishi, Gree, Midea la cele mai bune prețuri.",
  keywords:
    "conditioner, climatizare, aer conditionat, Moldova, Chisinau, Daikin, Mitsubishi, instalare",
  openGraph: {
    title: "Climat Rapid — Condiționere & Climatizare Moldova",
    description:
      "Soluții complete de climatizare pentru locuința sau afacerea ta.",
    locale: "ro_MD",
    type: "website",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [sectionFlags, headerCategories, socialLinks, contactInfo] = await Promise.all([
    getSectionFlags(),
    getHeaderCategories(),
    getSocialLinks(),
    getContactInfo(),
  ]);

  return (
    <html lang="ro" className={GeistSans.variable}>
      <body className="min-h-screen flex flex-col">
        <AuthProvider>
          <AuthModalProvider>
            <FavoritesProvider>
              <CartProvider>
                <Suspense fallback={null}>
                  <ScrollToTop />
                </Suspense>
                <SiteHeader {...sectionFlags} {...contactInfo} categories={headerCategories} />
                {children}
                <SiteFooter {...socialLinks} />
                <FloatingUIProvider>
                  <SiteFloatingContact {...contactInfo} />
                  <SiteDiscountPopup />
                </FloatingUIProvider>
                <AuthModal />
              </CartProvider>
            </FavoritesProvider>
          </AuthModalProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
