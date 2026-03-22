"use client";

import { use } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { CompanyForm } from "@/components/companies/company-form";
import { useCompany } from "@/lib/queries/use-companies";

export default function EditCompanyPage({ params }: { readonly params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const companyId = Number(id);
  const { data: company, isLoading, error } = useCompany(companyId);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="py-12 text-center">
        <p className="text-destructive">사업장을 찾을 수 없습니다</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">사업장 수정</h1>
      <CompanyForm
        mode="edit"
        companyId={companyId}
        businessNumber={company.businessNumber}
        defaultValues={{
          name: company.name,
          region: company.region,
          subRegion: company.subRegion ?? undefined,
          industryCategory: company.industryCategory,
          industrySubCategory: company.industrySubCategory ?? undefined,
          employeeCount: company.employeeCount,
          foreignWorkerCount: company.foreignWorkerCount,
          address: company.address,
          contactPhone: company.contactPhone,
        }}
      />
    </div>
  );
}
