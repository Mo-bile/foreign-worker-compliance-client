"use client";

import { useState } from "react";
import Link from "next/link";
import { Pencil, Users } from "lucide-react";
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">내 사업장 정보</h1>
        <Button variant="outline" onClick={() => setEditOpen(true)}>
          <Pencil className="h-4 w-4" />
          정보 수정
        </Button>
      </div>

      <CompanyDetailCard company={company.data} />

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-4 w-4 text-muted-foreground" />
            근로자 요약
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <p className="text-sm">
            소속 근로자 <span className="font-semibold">{workerCount}명</span>
          </p>
          <Link href="/workers" className="text-sm text-primary hover:underline">
            근로자 관리 →
          </Link>
        </CardContent>
      </Card>

      <CompanyEditModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        company={company.data}
      />
    </div>
  );
}
