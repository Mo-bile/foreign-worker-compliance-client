import Link from "next/link";
import { cn } from "@/lib/utils";
import type { DashboardAlert, AlertLevel } from "@/types/dashboard";

const levelStyles: Record<
  AlertLevel,
  {
    bg: string;
    dot: string;
    btn: string;
    badge: string;
    border: string;
  }
> = {
  critical: {
    bg: "bg-signal-red-bg",
    dot: "bg-signal-red",
    btn: "bg-signal-red text-white hover:shadow-md",
    badge: "bg-signal-red text-white",
    border: "border-signal-red/30",
  },
  warning: {
    bg: "bg-signal-orange-bg",
    dot: "bg-signal-orange",
    btn: "bg-signal-orange text-white hover:shadow-md",
    badge: "bg-signal-orange text-white",
    border: "border-signal-orange/30",
  },
  info: {
    bg: "bg-signal-blue-bg",
    dot: "bg-signal-blue",
    btn: "bg-signal-blue text-white hover:shadow-md",
    badge: "bg-signal-blue text-white",
    border: "border-signal-blue/30",
  },
};

interface AlertCardProps {
  readonly alert: DashboardAlert;
}

export function AlertCard({ alert }: AlertCardProps) {
  const style = levelStyles[alert.level];

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 rounded-lg border p-4 transition-shadow hover:shadow-md",
        style.bg,
        style.border,
      )}
    >
      <div className="flex flex-1 items-center gap-3">
        <div className={cn("h-2 w-2 shrink-0 rounded-full", style.dot)} />
        <div className="min-w-0">
          <p className="text-[13px] font-semibold">{alert.title}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {alert.description}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {alert.actions.map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className={cn(
              "rounded-md px-3 py-1.5 text-[11px] font-semibold transition-all",
              style.btn,
            )}
          >
            {action.label}
          </Link>
        ))}
      </div>
      <span
        className={cn(
          "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold",
          style.badge,
        )}
      >
        {alert.badgeText}
      </span>
    </div>
  );
}
