import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: number;
  /** Optional real logo image URL — falls back to the placeholder mark below. */
  src?: string | null;
}

/**
 * Round placeholder mark: two minimalist figures with a white cane, framed
 * by a thin rosette border echoing the site's traditional-motif accents.
 * Swap `src` for the final illustrated logo once the client provides it.
 */
export function Logo({ className, size = 44, src }: LogoProps) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt="Asociația Nevăzătorilor din Moldova"
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
      aria-label="Asociația Nevăzătorilor din Moldova"
      className={cn("rounded-full", className)}
    >
      <circle cx="24" cy="24" r="23" fill="var(--brand-maroon)" stroke="var(--brand-rose)" strokeWidth="1.5" />
      <circle cx="24" cy="24" r="19" fill="none" stroke="var(--brand-rose-light)" strokeWidth="0.75" strokeDasharray="1.5 3" />
      {/* Two abstract figures */}
      <circle cx="18" cy="16" r="3.2" fill="white" />
      <path d="M18 20c-3.2 0-5.6 2.6-5.9 6.4h11.8C23.6 22.6 21.2 20 18 20Z" fill="white" />
      <circle cx="29" cy="18" r="2.8" fill="white" opacity="0.92" />
      <path d="M29 21.4c-2.8 0-4.9 2.2-5.2 5.6h10.4c-.3-3.4-2.4-5.6-5.2-5.6Z" fill="white" opacity="0.92" />
      {/* White canes */}
      <line x1="13.5" y1="27" x2="10.5" y2="37" stroke="white" strokeWidth="1.3" strokeLinecap="round" />
      <line x1="30.5" y1="27.5" x2="33" y2="37" stroke="white" strokeWidth="1.3" strokeLinecap="round" />
      {/* Traditional diamond motif underline */}
      <path d="M17 40 L20 43 L17 46" stroke="var(--brand-rose)" strokeWidth="1" fill="none" opacity="0.9" />
      <path d="M31 40 L28 43 L31 46" stroke="var(--brand-rose)" strokeWidth="1" fill="none" opacity="0.9" />
      <circle cx="24" cy="43" r="1.4" fill="var(--brand-rose)" />
    </svg>
  );
}
