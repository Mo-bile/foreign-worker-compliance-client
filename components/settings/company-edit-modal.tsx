"use client";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CompanyForm } from "@/components/companies/company-form";
import type { CompanyResponse } from "@/types/api";

interface CompanyEditModalProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly company: CompanyResponse;
}

export function CompanyEditModal({ open, onClose, company }: CompanyEditModalProps) {
  return (
    <AlertDialog open={open}>
      <AlertDialogContent className="max-w-4xl! max-h-[90vh] overflow-y-auto p-6">
        <AlertDialogHeader>
          <AlertDialogTitle>사업장 정보 수정</AlertDialogTitle>
        </AlertDialogHeader>
        <CompanyForm
          mode="edit"
          companyId={company.id}
          businessNumber={company.businessNumber}
          defaultValues={{
            name: company.name,
            region: company.region,
            subRegion: company.subRegion ?? "",
            industryCategory: company.industryCategory,
            industrySubCategory: company.industrySubCategory ?? "",
            employeeCount: company.employeeCount,
            domesticInsuredCount: company.domesticInsuredCount ?? undefined,
            foreignWorkerCount: company.foreignWorkerCount,
            address: company.address,
            contactPhone: company.contactPhone,
            averageForeignWorkerWage: company.averageForeignWorkerWage ?? undefined,
            recentYearTerminationCount: company.recentYearTerminationCount ?? undefined,
          }}
          onSuccess={onClose}
          onCancel={onClose}
          variant="plain"
        />
      </AlertDialogContent>
    </AlertDialog>
  );
}
