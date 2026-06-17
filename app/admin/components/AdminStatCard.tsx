import Link from "next/link";

export default function AdminStatCard({
  label,
  value,
  icon,
  href,
  badge,
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  href?: string;
  badge?: string;
}) {
  const content = (
    <>
      <div className="w-12 h-12 rounded-xl bg-[#fdf2f3] text-[#c7092b] flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-2xl font-extrabold text-[#1d2353]">{value}</p>
          {badge && (
            <span className="text-[10px] font-bold text-[#c7092b] bg-[#fdf2f3] px-2 py-0.5 rounded-full uppercase shrink-0">
              {badge}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-0.5">{label}</p>
      </div>
    </>
  );

  const className = "bg-white border border-gray-100 rounded-2xl p-5 flex items-center gap-4 shadow-sm";

  if (href) {
    return (
      <Link href={href} className={`${className} hover:shadow-md hover:-translate-y-0.5 transition-all`}>
        {content}
      </Link>
    );
  }

  return <div className={className}>{content}</div>;
}
