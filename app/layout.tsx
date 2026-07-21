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
import {
  SITE_NAME,
  SITE_URL,
  DEFAULT_LOCALE,
  DEFAULT_OG_IMAGE,
  DEFAULT_DESCRIPTION,
  GOOGLE_SITE_VERIFICATION,
  BING_SITE_VERIFICATION,
  absoluteUrl,
} from "@/lib/seo";

const DEFAULT_TITLE = "LuminTehnica | Produse fabricate în Moldova";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: DEFAULT_TITLE,
    template: "%s | LuminTehnica",
  },
  description: DEFAULT_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: "hartie igienica, servetele, prosoape de hartie, servetele umede, produse de uz casnic, mobila la comanda, spatii de inchiriat, Moldova",
  alternates: {
    canonical: absoluteUrl("/"),
  },
  openGraph: {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    locale: DEFAULT_LOCALE,
    type: "website",
    url: absoluteUrl("/"),
    siteName: SITE_NAME,
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE.url],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/icon.png",
  },
  manifest: "/manifest.webmanifest",
  ...(GOOGLE_SITE_VERIFICATION || BING_SITE_VERIFICATION
    ? {
        verification: {
          ...(GOOGLE_SITE_VERIFICATION ? { google: GOOGLE_SITE_VERIFICATION } : {}),
          ...(BING_SITE_VERIFICATION ? { other: { "msvalidate.01": BING_SITE_VERIFICATION } } : {}),
        },
      }
    : {}),
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
