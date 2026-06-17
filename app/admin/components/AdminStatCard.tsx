export default function AdminStatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
      <div className="w-12 h-12 rounded-xl bg-[#fdf2f3] text-[#c7092b] flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-2xl font-extrabold text-[#1d2353]">{value}</p>
        <p className="text-xs text-gray-500 mt-0.5">{label}</p>
      </div>
    </div>
  );
}
