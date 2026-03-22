"use client";

import Link from "next/link";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WorkerTable } from "@/components/workers/worker-table";
import { useWorkers } from "@/lib/queries/use-workers";

export default function WorkersPage() {
  const { data: workers = [], isLoading, isError } = useWorkers();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">근로자 목록</h1>
        <Link href="/workers/new">
          <Button>
            <PlusIcon />
            신규 등록
          </Button>
        </Link>
      </div>

      {isError ? (
        <div className="flex h-40 items-center justify-center rounded-lg border border-dashed text-sm text-destructive">
          근로자 목록을 불러오는 중 오류가 발생했습니다. 페이지를 새로고침해 주세요.
        </div>
      ) : (
        <WorkerTable workers={workers} isLoading={isLoading} />
      )}
    </div>
  );
}
