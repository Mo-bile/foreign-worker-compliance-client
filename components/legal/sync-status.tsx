interface SyncStatusProps {
  readonly lastSyncedAt: string;
}

export function SyncStatus({ lastSyncedAt }: SyncStatusProps) {
  const formatted = new Date(lastSyncedAt).toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <p className="text-right text-xs text-muted-foreground">
      법제처 API 마지막 동기화: {formatted}
    </p>
  );
}
