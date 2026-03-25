import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  readonly title: string;
  readonly value: number | undefined;
  readonly icon: LucideIcon;
  readonly isLoading: boolean;
  readonly isError?: boolean;
  readonly className?: string;
  readonly variant?: "default" | "urgent";
  readonly subtitle?: string;
  readonly valueSuffix?: string;
  readonly change?: {
    readonly direction: "up" | "down";
    readonly text: string;
  };
}

export function StatCard({
  title,
  value,
  icon: Icon,
  isLoading,
  isError,
  className,
  variant = "default",
  subtitle,
  valueSuffix,
  change,
}: StatCardProps) {
  const isUrgent = variant === "urgent";

  return (
    <Card
      className={cn(
        "border-t-[3px]",
        isUrgent && "bg-signal-red-bg border-signal-red/30",
        className,
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle
          className={cn(
            "text-sm font-medium",
            isUrgent ? "text-signal-red" : "text-muted-foreground",
          )}
        >
          {title}
        </CardTitle>
        <div
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-lg",
            isUrgent ? "bg-signal-red-bg text-signal-red" : "bg-muted text-muted-foreground",
          )}
        >
          <Icon className="h-[18px] w-[18px]" />
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-16" />
        ) : isError ? (
          <p className="text-2xl font-bold text-destructive">—</p>
        ) : (
          <>
            <p className={cn("font-bold", isUrgent ? "text-5xl text-signal-red" : "text-2xl")}>
              {value ?? 0}
              {valueSuffix && <span className="text-base font-normal">{valueSuffix}</span>}
            </p>
            {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}
            {change && (
              <p
                data-testid="stat-change"
                className={cn(
                  "mt-1 flex items-center gap-1 text-xs",
                  change.direction === "up" ? "text-signal-green" : "text-signal-red",
                )}
              >
                {change.direction === "up" ? "↑" : "↓"} {change.text}
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
