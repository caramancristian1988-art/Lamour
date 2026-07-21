import type { MetadataRoute } from "next";
import { SITE_NAME, SITE_SHORT_NAME } from "@/lib/seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: SITE_SHORT_NAME,
    description:
      "LuminTehnica produce în Moldova produse din hârtie și de uz casnic, realizează mobilă la comandă și oferă spații spre închiriere.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#710808",
    lang: "ro",
    icons: [
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
