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

// TODO: replace with your own title/description/keywords/OG data before launch.
export const metadata: Metadata = {
  title: "Site Name — Placeholder Title",
  description: "Placeholder description for the store/site.",
  keywords: "placeholder, keywords, here",
  openGraph: {
    title: "Site Name — Placeholder Title",
    description: "Placeholder description for the store/site.",
    locale: "ro_MD",
    type: "website",
    url: "https://example.com",
    siteName: "Site Name",
  },
  twitter: {
    card: "summary_large_image",
    title: "Site Name — Placeholder Title",
    description: "Placeholder description for the store/site.",
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
