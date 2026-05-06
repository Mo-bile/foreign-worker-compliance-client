"use client";

import { use, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EndEmploymentModal } from "@/components/workers/end-employment-modal";
import { WorkerCompletedHistoryTab } from "@/components/workers/worker-completed-history-tab";
import { WorkerInfoTab } from "@/components/workers/worker-info-tab";
import { useWorker, useRestoreEmployment } from "@/lib/queries/use-workers";
import { useWorkerDeadlines } from "@/lib/queries/use-compliance";

export default function WorkerDetailPage({ params }: { readonly params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const workerId = Number(id);
  const worker = useWorker(workerId);
  const deadlines = useWorkerDeadlines(workerId);
  const [endModalOpen, setEndModalOpen] = useState(false);
  const restoreMutation = useRestoreEmployment(workerId);

  function handleRestore(name: string) {
    restoreMutation.mutate(undefined, {
      onSuccess: (response) => {
        const removed = response.removedChangeReportDeadlineIds.length;
        toast.success(
          `${name} 고용종료를 복원했습니다. 자동 생성됐던 고용변동신고 데드라인이 ${removed}건 삭제되었습니다.\n` +
            "자동 완료 처리됐던 데드라인은 그대로 유지되며, 필요 시 데드라인 화면에서 직접 복원해주세요.",
        );
      },
      onError: (error) => toast.error(error.message),
    });
  }

  if (worker.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (worker.error) {
    return (
      <div className="py-12 text-center">
        <p className="text-destructive">근로자를 찾을 수 없습니다</p>
      </div>
    );
  }

  const w = worker.data;
  if (!w) return null;
  const koreanName = w.koreanName?.trim();

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-2xl font-bold">
            <span>{w.name}</span>
            {koreanName && (
              <span className="text-base font-medium text-muted-foreground">{koreanName}</span>
            )}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {(w.status === "ACTIVE" || w.status === "UPCOMING") && (
            <>
              <Link
                href={`/workers/${workerId}/edit`}
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                수정
              </Link>
              <Button variant="default" size="sm" onClick={() => setEndModalOpen(true)}>
                고용종료 처리
              </Button>
            </>
          )}
          {w.status === "REVIEW_REQUIRED" && (
            <>
              <Link
                href={`/workers/${workerId}/edit`}
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                계약정보 수정
              </Link>
              <Button variant="default" size="sm" onClick={() => setEndModalOpen(true)}>
                고용종료 확정
              </Button>
            </>
          )}
          {w.status === "ENDED" && (
            <>
              <Link
                href={`/workers/${workerId}/edit`}
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                수정
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRestore(w.name)}
                disabled={restoreMutation.isPending}
              >
                {restoreMutation.isPending ? "복원 중..." : "고용종료 복원"}
              </Button>
            </>
          )}
        </div>
      </div>

      {w.status === "REVIEW_REQUIRED" && (
        <div className="rounded-md border border-[var(--signal-orange-bg)] bg-[var(--signal-orange-bg)]/30 p-4 text-sm">
          <p className="font-medium text-[var(--signal-orange)]">
            계약종료일이 지난 근로자입니다.
          </p>
          <p className="mt-1 text-muted-foreground">
            실제 고용종료 여부를 확인해 주세요. 우상단의 [고용종료 확정] 또는 [계약정보 수정] 버튼을 사용하세요.
          </p>
        </div>
      )}

      <Tabs defaultValue="info" className="space-y-6">
        <TabsList>
          <TabsTrigger value="info">정보</TabsTrigger>
          <TabsTrigger value="history">완료 이력</TabsTrigger>
        </TabsList>
        <TabsContent value="info">
          <WorkerInfoTab
            worker={w}
            deadlines={deadlines.data}
            isDeadlinesLoading={deadlines.isLoading}
            isDeadlinesError={deadlines.isError}
          />
        </TabsContent>
        <TabsContent value="history">
          <WorkerCompletedHistoryTab workerId={workerId} />
        </TabsContent>
      </Tabs>

      {endModalOpen && (
        <EndEmploymentModal
          open
          onClose={() => setEndModalOpen(false)}
          workerId={workerId}
          workerName={w.name}
        />
      )}
    </div>
  );
}
