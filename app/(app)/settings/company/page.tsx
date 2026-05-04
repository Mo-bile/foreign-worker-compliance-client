"use client";

import { useState } from "react";
import Link from "next/link";
import { Pencil, Users, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CompanyDetailCard } from "@/components/companies/company-detail-card";
import { CompanyEditModal } from "@/components/settings/company-edit-modal";
import type { EditSection } from "@/components/settings/company-edit-modal";
import { ForeignWorkerStatusSection } from "@/components/settings/foreign-worker-status-section";
import { useCompanyContext } from "@/lib/contexts/company-context";
import { useCompany } from "@/lib/queries/use-companies";

export default function MyCompanyPage() {
  const { selectedCompanyId } = useCompanyContext();
  const company = useCompany(selectedCompanyId ?? 0);
  const [editSection, setEditSection] = useState<EditSection | null>(null);

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

  const c = company.data;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">내 사업장 정보</h1>

      {/* 1. 사업장 기본 정보 */}
      <CompanyDetailCard company={c} onEdit={() => setEditSection("info")} />

      {/* 2. 근로자·인원 정보 */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4 text-muted-foreground" />
              근로자·인원 정보
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setEditSection("workers")}>
              <Pencil className="h-3.5 w-3.5" />
              수정
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* (1) 수동 입력 섹션 */}
          <dl className="grid gap-4 md:grid-cols-2">
            <div>
              <dt className="text-sm text-muted-foreground">내국인 고용보험 피보험자 수</dt>
              <dd className="font-medium">
                {c.domesticInsuredCount != null ? `${c.domesticInsuredCount}명` : "—"}
              </dd>
              <p className="text-xs text-muted-foreground">고용허용 인원 산정 기준 (수동 입력)</p>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">상시근로자 수 (선택)</dt>
              <dd className="font-medium">
                {c.employeeCount != null ? `${c.employeeCount}명` : "—"}
              </dd>
              <p className="text-xs text-muted-foreground">사업장 규모 판단 참고값 (수동 입력, 미입력 가능)</p>
            </div>
          </dl>

          {/* (2) 자동 집계 섹션 */}
          <div className="border-t pt-4">
            <ForeignWorkerStatusSection derivedCounts={c.derivedCounts} />
          </div>

          {/* (3) 등록 기준 인원 */}
          <div className="border-t pt-3">
            <dt className="text-sm text-muted-foreground">등록 기준 인원</dt>
            <dd className="text-lg font-semibold">{c.derivedCounts.registeredWorkforceTotal}명</dd>
            <p className="text-xs text-muted-foreground">
              내국인 피보험자 + 등록 재직 외국인 (자동 표시)
            </p>
          </div>

          {/* (4) 근로자 관리 링크 */}
          <div className="flex items-center justify-end border-t pt-3">
            <Link href="/workers" className="text-sm text-primary hover:underline">
              근로자 관리 →
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* 3. 비교 진단용 */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              비교 진단용
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setEditSection("benchmark")}>
              <Pencil className="h-3.5 w-3.5" />
              수정
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div>
            <dt className="text-sm text-muted-foreground">외국인 근로자 평균 월임금</dt>
            <dd className="font-medium">
              {c.averageForeignWorkerWage != null ? `${c.averageForeignWorkerWage}만원` : "—"}
            </dd>
            <p className="text-xs text-muted-foreground">미입력 시 임금 수준 비교가 생략됩니다</p>
          </div>
          {/* "최근 1년 퇴사 외국인 수": 제거 (자동 집계 카드로 대체, PR-β D21) */}
        </CardContent>
      </Card>

      {editSection !== null && (
        <CompanyEditModal
          open
          onClose={() => setEditSection(null)}
          company={c}
          section={editSection}
        />
      )}
    </div>
  );
}
