import type { Metadata } from "next";
import { Suspense } from "react";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import TopBar from "./components/TopBar";
import ScrollAwareHeader from "./components/ScrollAwareHeader";
import ScrollToTop from "./components/ScrollToTop";
import Footer from "./components/Footer";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ro" className={GeistSans.variable}>
      <body className="min-h-screen flex flex-col">
        <Suspense fallback={null}>
          <ScrollToTop />
        </Suspense>
        <TopBar />
        <ScrollAwareHeader />
        {children}
        <Footer />
      </body>
    </html>
  );
}
