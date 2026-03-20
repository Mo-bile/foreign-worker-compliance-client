"use client";

import Link from "next/link";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WorkerTable } from "@/components/workers/worker-table";
import { useWorkers } from "@/lib/queries/use-workers";

export default function WorkersPage() {
  const { data: workers = [], isLoading } = useWorkers();

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

      <WorkerTable workers={workers} isLoading={isLoading} />
    </div>
  );
}
