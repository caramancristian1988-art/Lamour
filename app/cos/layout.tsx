import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Coșul tău",
  robots: { index: false, follow: true },
};

export default function CosLayout({ children }: { children: React.ReactNode }) {
  return children;
}
