import Link from "next/link";
import { Badge } from "@/app/components/ui/badge";
import { cn } from "@/lib/utils";

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
      <div className="w-12 h-12 rounded-xl bg-accent/10 text-accent flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-2xl font-extrabold text-primary">{value}</p>
          {badge && (
            <Badge variant="accent" className="shrink-0">
              {badge}
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-0.5">{label}</p>
      </div>
    </>
  );

  const baseClassName = "rounded-2xl border border-border bg-card text-card-foreground shadow-sm p-5 flex items-center gap-4";

  if (href) {
    return (
      <Link href={href} className={cn(baseClassName, "hover:shadow-md hover:-translate-y-0.5 transition-all")}>
        {content}
      </Link>
    );
  }

  return <div className={baseClassName}>{content}</div>;
}
