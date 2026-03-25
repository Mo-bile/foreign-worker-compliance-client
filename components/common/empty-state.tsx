interface EmptyStateProps {
  readonly message: string;
  readonly action?: React.ReactNode;
  readonly variant?: "default" | "error";
}

export function EmptyState({ message, action, variant = "default" }: EmptyStateProps) {
  return (
    <div className="flex h-40 flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-sm text-muted-foreground">
      <p className={variant === "error" ? "text-destructive" : undefined}>{message}</p>
      {action}
    </div>
  );
}
