"use client";

import { useCompanyContext } from "@/lib/contexts/company-context";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";

export function CompanySelector() {
  const { companies, selectedCompanyId, setSelectedCompanyId, isLoading, isError } =
    useCompanyContext();

  if (isLoading) {
    return <div className="h-9 w-48 animate-pulse rounded-md bg-muted" />;
  }

  if (isError) {
    return <span className="text-sm text-destructive">사업장 목록을 불러올 수 없습니다</span>;
  }

  if (companies.length === 0) {
    return (
      <Link href="/companies/new" className="text-sm text-primary hover:underline">
        사업장을 등록해주세요
      </Link>
    );
  }

  const selectedName = selectedCompanyId != null
    ? companies.find((c) => c.id === selectedCompanyId)?.name
    : undefined;

  return (
    <Select
      value={selectedCompanyId != null ? String(selectedCompanyId) : undefined}
      onValueChange={(value) => setSelectedCompanyId(Number(value))}
    >
      <SelectTrigger className="w-52" aria-label="사업장 선택">
        <SelectValue placeholder="사업장 선택">
          {selectedName ?? (selectedCompanyId != null ? `사업장 #${selectedCompanyId}` : "사업장 선택")}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {companies.map((company) => (
          <SelectItem key={company.id} value={String(company.id)}>
            {company.name} ({company.businessNumber})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
