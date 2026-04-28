import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TEMPLATE_TYPE_LABELS } from "@/types/notification";
import type { NotificationLog } from "@/types/notification";

interface NotificationLogTableProps {
  readonly logs: readonly NotificationLog[];
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function NotificationLogTable({ logs }: NotificationLogTableProps) {
  if (logs.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">발송 기록이 없습니다</p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>발송 시각</TableHead>
          <TableHead>시점</TableHead>
          <TableHead className="text-right">건수</TableHead>
          <TableHead>수신자</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {logs.map((log) => (
          <TableRow key={log.id}>
            <TableCell className="font-mono text-sm">{formatDate(log.sentAt)}</TableCell>
            <TableCell>{TEMPLATE_TYPE_LABELS[log.templateType]}</TableCell>
            <TableCell className="text-right">{log.deadlineCount}</TableCell>
            <TableCell className="text-sm text-muted-foreground">{log.recipientEmail}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
