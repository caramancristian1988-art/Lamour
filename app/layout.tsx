import type { Metadata } from "next";
import { Suspense } from "react";
import { GeistSans } from "geist/font/sans";
import { Playfair_Display } from "next/font/google";
import "./globals.css";

const playfairDisplay = Playfair_Display({
  subsets: ["latin", "latin-ext"],
  variable: "--font-playfair",
  display: "swap",
});
import { SiteHeader, SiteFooter, SiteFloatingContact, SiteDiscountPopup } from "./components/SiteChrome";
import ScrollToTop from "./components/ScrollToTop";
import { FavoritesProvider } from "./components/FavoritesProvider";
import { AccessibilityProvider } from "./components/AccessibilityProvider";
import { CartProvider } from "./components/CartProvider";
import { AuthProvider } from "./components/AuthProvider";
import { AuthModalProvider } from "./components/AuthModalProvider";
import AuthModal from "./components/AuthModal";
import { FloatingUIProvider } from "./components/FloatingUIState";
import { getSectionFlags, getHeaderCategories, getSocialLinks, getContactInfo } from "@/lib/siteSettings";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/constants";

export const metadata: Metadata = {
  title: `${SITE_NAME} — Produse din hârtie și igienă`,
  description: SITE_TAGLINE,
  keywords: "hartie igienica, servetele, prosoape de hartie, servetele umede, produse de uz casnic, Moldova",
  openGraph: {
    title: `${SITE_NAME} — Produse din hârtie și igienă`,
    description: SITE_TAGLINE,
    locale: "ro_MD",
    type: "website",
    url: "https://example.com",
    siteName: SITE_NAME,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Produse din hârtie și igienă`,
    description: SITE_TAGLINE,
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
    <html lang="ro" className={`${GeistSans.variable} ${playfairDisplay.variable}`}>
      <body className="min-h-screen flex flex-col">
        <AccessibilityProvider>
          <AuthProvider>
            <AuthModalProvider>
              <FavoritesProvider>
                <CartProvider>
                  <Suspense fallback={null}>
                    <ScrollToTop />
                  </Suspense>
                  <SiteHeader {...sectionFlags} {...contactInfo} categories={headerCategories} />
                  {children}
                  <SiteFooter {...socialLinks} {...contactInfo} />
                  <FloatingUIProvider>
                    <SiteFloatingContact {...contactInfo} />
                    <SiteDiscountPopup />
                  </FloatingUIProvider>
                  <AuthModal />
                </CartProvider>
              </FavoritesProvider>
            </AuthModalProvider>
          </AuthProvider>
        </AccessibilityProvider>
      </body>
    </html>
  );
}
