import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/api",
        "/login",
        // "/cont" ca prefix ar bloca și "/contact" — regulile din robots.txt se potrivesc pe prefix. "$" = potrivire exactă.
        "/cont$",
        "/cont/",
        "/cos",
        "/favorite",
        "/finalizare-comanda",
      ],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
