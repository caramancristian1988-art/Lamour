import { cn } from "@/lib/utils";
import { SITE_NAME } from "@/lib/constants";

interface LogoProps {
  className?: string;
  size?: number;
  /** Optional real logo image URL — falls back to the placeholder mark below. */
  src?: string | null;
}

/**
 * Round placeholder mark: an ornamental rosette badge with a floral flourish
 * and an "L" monogram, echoing the brand's traditional-motif accents.
 * Swap `src` for the final illustrated logo once the client provides it.
 */
export function Logo({ className, size = 44, src }: LogoProps) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={SITE_NAME}
        width={size}
        height={size}
        className={cn("rounded-full object-cover", className)}
      />
    );
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      role="img"
      aria-label={SITE_NAME}
      className={cn("rounded-full", className)}
    >
      <circle cx="24" cy="24" r="23" fill="var(--brand-maroon)" stroke="var(--brand-rose)" strokeWidth="1.5" />
      <circle cx="24" cy="24" r="19" fill="#fdf8f7" stroke="var(--brand-rose-light)" strokeWidth="0.75" strokeDasharray="1.5 3" />

      {/* Floral flourish */}
      <g fill="none" stroke="var(--brand-maroon)" strokeWidth="1" opacity="0.85">
        <path d="M24 30c-2.5-2-2.5-5 0-6.5" strokeLinecap="round" />
        <path d="M24 30c2.5-2 2.5-5 0-6.5" strokeLinecap="round" />
      </g>
      <circle cx="17.5" cy="30.5" r="1.6" fill="var(--brand-red)" />
      <circle cx="30.5" cy="30.5" r="1.6" fill="var(--brand-rose)" />
      <circle cx="24" cy="32.5" r="1.8" fill="var(--brand-maroon)" />

      <text
        x="24"
        y="22"
        textAnchor="middle"
        fontFamily="var(--font-serif), Georgia, serif"
        fontSize="16"
        fontStyle="italic"
        fontWeight="700"
        fill="var(--brand-maroon)"
      >
        L
      </text>
    </svg>
  );
}
