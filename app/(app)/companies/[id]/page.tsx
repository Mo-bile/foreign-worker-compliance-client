"use client";

import { use } from "react";
import Link from "next/link";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CompanyDetailCard } from "@/components/companies/company-detail-card";
import { WorkerTable } from "@/components/workers/worker-table";
import { useCompany } from "@/lib/queries/use-companies";
import { useWorkers } from "@/lib/queries/use-workers";
import { parseId } from "@/lib/parse-id";

export default function CompanyDetailPage({
  params,
}: {
  readonly params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const companyId = parseId(id);
  const company = useCompany(companyId ?? 0);
  const workers = useWorkers(companyId ?? undefined);

  if (companyId === null) {
    return (
      <div className="py-12 text-center">
        <p className="text-destructive">잘못된 사업장 ID입니다</p>
      </div>
    );
  }

  if (company.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (company.error || !company.data) {
    const status = (company.error as { status?: number } | null)?.status;
    const message =
      status === 404
        ? "사업장을 찾을 수 없습니다"
        : "사업장 정보를 불러오는 중 오류가 발생했습니다. 페이지를 새로고침해 주세요.";
    return (
      <div className="py-12 text-center">
        <p className="text-destructive">{message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{company.data.name}</h1>
        <div className="flex gap-2">
          <Link href={`/companies/${companyId}/edit`}>
            <Button variant="outline">
              <Pencil className="h-4 w-4" />
              수정
            </Button>
          </Link>
          <Link href="/workers/new">
            <Button>근로자 등록</Button>
          </Link>
        </div>
      </div>

      <CompanyDetailCard company={company.data} />

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">소속 근로자</h2>
        {workers.isError ? (
          <div className="flex h-40 items-center justify-center rounded-lg border border-dashed text-sm text-destructive">
            근로자 목록을 불러오는 중 오류가 발생했습니다.
          </div>
        ) : (
          <WorkerTable workers={workers.data ?? []} isLoading={workers.isLoading} />
        )}
      </div>
    </div>
  );
}
