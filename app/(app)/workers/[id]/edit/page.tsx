"use client";

import { use } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { WorkerForm } from "@/components/workers/worker-form";
import { useWorker } from "@/lib/queries/use-workers";
import { parseId } from "@/lib/parse-id";

export default function EditWorkerPage({ params }: { readonly params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const workerId = parseId(id);
  const { data: worker, isLoading, error } = useWorker(workerId ?? 0);

  if (workerId === null) {
    return (
      <div className="py-12 text-center">
        <p className="text-destructive">잘못된 근로자 ID입니다</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error || !worker) {
    const status = (error as { status?: number } | null)?.status;
    const message =
      status === 404
        ? "근로자를 찾을 수 없습니다"
        : "근로자 정보를 불러오는 중 오류가 발생했습니다. 페이지를 새로고침해 주세요.";
    return (
      <div className="py-12 text-center">
        <p className="text-destructive">{message}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">근로자 수정</h1>
      <WorkerForm mode="edit" workerId={workerId} worker={worker} />
    </div>
  );
}
