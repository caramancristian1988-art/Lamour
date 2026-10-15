import type { NextConfig } from "next";

// Anteturi de securitate pentru toate rutele. HSTS îl adaugă deja Vercel. Nu setăm Content-Security-Policy aici:
// o politică strictă ar rupe scripturile inline ale Next.js și widget-urile încorporate (hărți etc.) fără o configurare atentă.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Nimeni nu poate afișa site-ul într-un iframe pe alt domeniu (clickjacking pe formularul de comandă / admin).
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
];

const nextConfig: NextConfig = {
  reactCompiler: true,
  poweredByHeader: false,
  // Dimensiunea funcțiilor Vercel: fără aceste excluderi, fiecare rută dinamică (peste 70) trăgea după ea ~89 MB de
  // fișiere Prisma de care nu are nevoie (compilatoare WASM pentru Postgres/MySQL/SQLite/SQL Server/CockroachDB,
  // motorul binar, runtime pentru edge/browser/react-native) — baza noastră e MongoDB, cu motorul "library". Fără ele,
  // o funcție are ~30 MB, deci stocarea funcțiilor per deploy scade cu ~2/3. Păstrăm: runtime/library.*, runtime/client.*,
  // motorul .node din node_modules/.prisma/client și schema.prisma.
  outputFileTracingExcludes: {
    "/*": [
      "node_modules/@prisma/client/runtime/*.wasm*",
      "node_modules/@prisma/client/runtime/query_compiler_bg.*",
      "node_modules/@prisma/client/runtime/query_engine_bg.*",
      "node_modules/@prisma/client/runtime/binary.*",
      "node_modules/@prisma/client/runtime/edge*",
      "node_modules/@prisma/client/runtime/index-browser.*",
      "node_modules/@prisma/client/runtime/react-native.*",
      "node_modules/@prisma/client/runtime/wasm-*",
      "node_modules/@prisma/engines/**",
      "node_modules/prisma/**",
    ],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "placehold.co" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
