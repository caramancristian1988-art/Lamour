import Link from "next/link";

interface Props {
  total: number;
  variant?: "light" | "dark";
}

export default function NotificationBell({ total, variant = "dark" }: Props) {
  const iconColor = variant === "dark" ? "text-white/60" : "text-gray-500";

  return (
    <Link href="/admin/notificari" aria-label="Notificări" className={`relative p-1.5 ${iconColor} hover:text-white transition-all active:scale-90 shrink-0`}>
      <svg
        className={`w-5 h-5 ${total > 0 ? "animate-[bell-ring_4s_ease-in-out_infinite]" : ""}`}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.85 23.85 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
      </svg>
      {total > 0 && (
        <span
          key={total}
          className="absolute -top-0.5 -right-0.5 bg-[#c7092b] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-bump"
        >
          {total > 9 ? "9+" : total}
        </span>
      )}
    </Link>
  );
}
