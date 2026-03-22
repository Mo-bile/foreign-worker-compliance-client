"use client";

import Link from "next/link";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CompanyTable } from "@/components/companies/company-table";
import { useCompanies } from "@/lib/queries/use-companies";

export default function CompaniesPage() {
  const { data: companies = [], isLoading, isError } = useCompanies();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">사업장 목록</h1>
        <Link href="/companies/new">
          <Button>
            <PlusIcon />
            사업장 등록
          </Button>
        </Link>
      </div>

      {isError ? (
        <div className="flex h-40 items-center justify-center rounded-lg border border-dashed text-sm text-destructive">
          사업장 목록을 불러오는 중 오류가 발생했습니다. 페이지를 새로고침해 주세요.
        </div>
      ) : (
        <CompanyTable companies={companies} isLoading={isLoading} />
      )}
    </div>
  );
}
