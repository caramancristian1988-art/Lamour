import { cn } from "@/lib/utils";

export interface MiniBarChartDatum {
  label: string;
  value: number;
}

const COLOR_CLASS: Record<"primary" | "accent" | "secondary", string> = {
  primary: "bg-primary",
  accent: "bg-accent",
  secondary: "bg-secondary",
};

/**
 * Small, dependency-free horizontal bar chart used on the admin dashboard.
 * Bars are plain CSS-width elements (not scaled SVG rects) so the rounded
 * ends never distort at arbitrary container widths. Every bar has its
 * label and numeric value rendered as real, visible text right next to
 * it — the color bar is a decorative reinforcement, never the only way
 * to read the data.
 */
export default function MiniBarChart({
  title,
  description,
  data,
  color = "accent",
  emptyMessage = "Nu există date suficiente încă.",
}: {
  title: string;
  description?: string;
  data: MiniBarChartDatum[];
  color?: "primary" | "accent" | "secondary";
  emptyMessage?: string;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const barColor = COLOR_CLASS[color];
  const hasData = data.some((d) => d.value > 0);

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <h3 className="text-base font-bold text-foreground">{title}</h3>
      {description && <p className="text-sm text-muted-foreground mt-0.5">{description}</p>}

      {hasData ? (
        <ul className="flex flex-col gap-3 mt-4">
          {data.map((d) => (
            <li key={d.label} className="flex items-center gap-3">
              <span className="w-28 sm:w-36 shrink-0 text-sm text-muted-foreground truncate" title={d.label}>
                {d.label}
              </span>
              <span className="flex-1 h-4 rounded-full bg-muted overflow-hidden" aria-hidden="true">
                <span
                  className={cn("block h-full rounded-full transition-all duration-500", barColor)}
                  style={{ width: `${Math.max((d.value / max) * 100, d.value > 0 ? 3 : 0)}%` }}
                />
              </span>
              <span className="w-10 shrink-0 text-sm font-bold text-foreground text-right">{d.value}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground mt-4">{emptyMessage}</p>
      )}
    </div>
  );
}
