import { SITE_NAME, SITE_SHORT_NAME, SITE_TAGLINE } from "./constants";

function stripTrailingSlash(url: string): string {
  return url.replace(/\/+$/, "");
}

// Resolution order: explicit public site URL → legacy SITE_URL (already used
// by robots/sitemap/newsletter before this file existed) → Vercel's own
// deployment URL (real, not invented) → localhost for local dev.
function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL;
  if (explicit) return stripTrailingSlash(explicit);
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export const SITE_URL = resolveSiteUrl();

/** Builds an absolute, slash-normalized URL for the given site-relative path. */
export function absoluteUrl(path = "/"): string {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${cleanPath}`.replace(/([^:]\/)\/+/g, "$1");
}

export const DEFAULT_LOCALE = "ro_MD";
export const DEFAULT_LANG = "ro";

export const DEFAULT_OG_IMAGE = {
  url: absoluteUrl("/opengraph-image"),
  width: 1200,
  height: 630,
  alt: SITE_NAME,
};

export const DEFAULT_DESCRIPTION =
  "LuminTehnica produce în Moldova produse din hârtie și de uz casnic, realizează mobilă la comandă în fabrica proprie și oferă apartamente, birouri, spații comerciale și depozite spre închiriere.";

export const GOOGLE_SITE_VERIFICATION = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined;
export const BING_SITE_VERIFICATION = process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION || undefined;

export { SITE_NAME, SITE_SHORT_NAME, SITE_TAGLINE };
