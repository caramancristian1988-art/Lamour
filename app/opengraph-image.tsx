import { ImageResponse } from "next/og";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/seo";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#710808",
          padding: "80px",
        }}
      >
        <div
          style={{
            fontSize: 84,
            fontWeight: 700,
            fontStyle: "italic",
            color: "#ffffff",
            textAlign: "center",
            lineHeight: 1.15,
          }}
        >
          {SITE_NAME}
        </div>
        <div
          style={{
            marginTop: 32,
            fontSize: 32,
            color: "#E9D0CE",
            textAlign: "center",
            maxWidth: 900,
          }}
        >
          {SITE_TAGLINE}
        </div>
      </div>
    ),
    { ...size }
  );
}
