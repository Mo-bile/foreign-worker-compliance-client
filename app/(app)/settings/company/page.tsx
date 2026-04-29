"use client";

import { useState } from "react";
import Link from "next/link";
import { Pencil, Users, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CompanyDetailCard } from "@/components/companies/company-detail-card";
import { CompanyEditModal } from "@/components/settings/company-edit-modal";
import { useCompanyContext } from "@/lib/contexts/company-context";
import { useCompany } from "@/lib/queries/use-companies";
import { useWorkers } from "@/lib/queries/use-workers";

export default function MyCompanyPage() {
  const { selectedCompanyId } = useCompanyContext();
  const company = useCompany(selectedCompanyId ?? 0);
  const workers = useWorkers(selectedCompanyId);
  const [editOpen, setEditOpen] = useState(false);

  if (selectedCompanyId == null) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">사업장을 선택해주세요</p>
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
    return (
      <div className="py-12 text-center">
        <p className="text-destructive">사업장 정보를 불러올 수 없습니다</p>
      </div>
    );
  }

  const workerCount = workers.data?.length ?? 0;
  const c = company.data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">내 사업장 정보</h1>
        <Button variant="outline" onClick={() => setEditOpen(true)}>
          <Pencil className="h-4 w-4" />
          정보 수정
        </Button>
      </div>

      {/* 1. 사업장 기본 정보 */}
      <CompanyDetailCard company={c} />

      {/* 2. 근로자·인원 정보 */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-4 w-4 text-muted-foreground" />
            근로자·인원 정보
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <dl className="grid gap-4 md:grid-cols-3">
            <div>
              <dt className="text-sm text-muted-foreground">총 직원 수</dt>
              <dd className="font-medium">{c.employeeCount}명</dd>
              <p className="text-xs text-muted-foreground">내·외국인 포함 상시근로자</p>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">내국인 피보험자 수</dt>
              <dd className="font-medium">
                {c.domesticInsuredCount != null ? `${c.domesticInsuredCount}명` : "—"}
              </dd>
              <p className="text-xs text-muted-foreground">고용 한도 산정 기준</p>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">외국인 근로자 수</dt>
              <dd className="font-medium">{c.foreignWorkerCount}명</dd>
              <p className="text-xs text-muted-foreground">등록된 외국인 근로자 수</p>
            </div>
          </dl>
          <div className="flex items-center justify-between border-t pt-3">
            <p className="text-sm">
              소속 근로자 <span className="font-semibold">{workerCount}명</span>
            </p>
            <Link href="/workers" className="text-sm text-primary hover:underline">
              근로자 관리 →
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* 3. 벤치마크 진단용 */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
            벤치마크 진단용
          </CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 md:grid-cols-2">
            <div>
              <dt className="text-sm text-muted-foreground">외국인 근로자 평균 월임금</dt>
              <dd className="font-medium">
                {c.averageForeignWorkerWage != null ? `${c.averageForeignWorkerWage}만원` : "—"}
              </dd>
              <p className="text-xs text-muted-foreground">미입력 시 임금 포지셔닝 진단이 생략됩니다</p>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">최근 1년 퇴사 외국인 수</dt>
              <dd className="font-medium">
                {c.recentYearTerminationCount != null ? `${c.recentYearTerminationCount}명` : "—"}
              </dd>
              <p className="text-xs text-muted-foreground">미입력 시 고용 안정성 진단이 생략됩니다</p>
            </div>
          </dl>
        </CardContent>
      </Card>

      <CompanyEditModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        company={c}
      />
    </div>
  );
}
