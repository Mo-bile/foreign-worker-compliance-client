"use client";

import Link from "next/link";
import { Mail, Bell, Send, Clock, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { NotificationTimingToggles } from "@/components/notifications/notification-timing-toggles";
import { NotificationLogTable } from "@/components/notifications/notification-log-table";
import { useCompanyContext } from "@/lib/contexts/company-context";
import { useCompany } from "@/lib/queries/use-companies";
import { useNotificationLogs, useTriggerNotification } from "@/lib/queries/use-notifications";
import { toast } from "sonner";

export default function NotificationSettingsPage() {
  const { selectedCompanyId } = useCompanyContext();
  const company = useCompany(selectedCompanyId ?? 0);
  const logs = useNotificationLogs(selectedCompanyId);
  const triggerMutation = useTriggerNotification();

  if (selectedCompanyId == null) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">사업장을 선택해주세요</p>
      </div>
    );
  }

  function handleTrigger() {
    if (selectedCompanyId == null) return;
    triggerMutation.mutate(
      { companyId: selectedCompanyId },
      {
        onSuccess: (data) => {
          toast.success(`${data.triggered}건 발송 완료`);
        },
        onError: (error) => {
          toast.error(`발송 실패: ${error.message}`);
        },
      },
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">알림 설정</h1>

      <div className="flex gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-200">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        <div className="space-y-1">
          <p>알림은 주요 기한을 놓치지 않도록 이메일로 알려주는 기능입니다.</p>
          <p>받을 이메일을 확인하고, 알림을 받을 시점을 선택할 수 있습니다.</p>
          <p>지금은 버튼을 눌러 직접 알림을 보낼 수 있으며, 자동 발송은 준비 중입니다.</p>
        </div>
      </div>

      {/* 수신 이메일 */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Mail className="h-4 w-4 text-muted-foreground" />
            수신 이메일
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <p className="text-sm">
            {company.isLoading ? (
              <Skeleton className="inline-block h-4 w-40" />
            ) : (
              (company.data?.contactEmail ?? "등록된 이메일 없음")
            )}
          </p>
          <Link href="/settings/company" className="text-sm text-primary hover:underline">
            이메일 변경 →
          </Link>
        </CardContent>
      </Card>

      {/* 알림 시점 */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-4 w-4 text-muted-foreground" />
            알림 시점
          </CardTitle>
        </CardHeader>
        <CardContent>
          <NotificationTimingToggles companyId={selectedCompanyId} />
        </CardContent>
      </Card>

      {/* 수동 발송 */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Send className="h-4 w-4 text-muted-foreground" />
            직접 보내기
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={handleTrigger} disabled={triggerMutation.isPending}>
            <Bell className="h-4 w-4" />
            {triggerMutation.isPending ? "발송 중..." : "지금 알림 보내기"}
          </Button>
        </CardContent>
      </Card>

      {/* 최근 발송 기록 */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-4 w-4 text-muted-foreground" />
            최근 발송 기록
          </CardTitle>
        </CardHeader>
        <CardContent>
          {logs.isLoading ? (
            <Skeleton className="h-24 w-full" />
          ) : (
            <NotificationLogTable logs={logs.data ?? []} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
