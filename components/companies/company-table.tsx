"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  REGIONS,
  REGION_LABELS,
  INDUSTRY_CATEGORIES,
  INDUSTRY_CATEGORY_LABELS,
} from "@/types/api";
import type { CompanyResponse, Region, IndustryCategory, FilterOption } from "@/types/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { paginateItems } from "@/lib/pagination";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { EmptyState } from "@/components/common/empty-state";
import { FilterSelect } from "@/components/common/filter-select";

interface CompanyTableProps {
  readonly companies: readonly CompanyResponse[];
  readonly isLoading: boolean;
}

export function CompanyTable({ companies, isLoading }: CompanyTableProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [regionFilter, setRegionFilter] = useState<FilterOption<Region>>("ALL");
  const [industryFilter, setIndustryFilter] = useState<FilterOption<IndustryCategory>>("ALL");
  const [page, setPage] = useState(1);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const filtered = companies.filter((c) => {
    if (search.trim() !== "") {
      const s = search.toLowerCase();
      if (
        !c.name.toLowerCase().includes(s) &&
        !c.businessNumber.includes(s)
      ) {
        return false;
      }
    }
    if (regionFilter !== "ALL" && c.region !== regionFilter) return false;
    if (industryFilter !== "ALL" && c.industryCategory !== industryFilter)
      return false;
    return true;
  });

  const paginated = paginateItems(filtered, page);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap">
        <Input
          type="text"
          placeholder="회사명 또는 사업자번호로 검색..."
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="sm:max-w-xs"
        />
        <FilterSelect
          value={regionFilter}
          onValueChange={(v) => { setRegionFilter(v as FilterOption<Region>); setPage(1); }}
          placeholder="지역 전체"
          options={[...REGIONS]}
          labelMap={REGION_LABELS}
          className="w-40"
        />
        <FilterSelect
          value={industryFilter}
          onValueChange={(v) => { setIndustryFilter(v as FilterOption<IndustryCategory>); setPage(1); }}
          placeholder="업종 전체"
          options={[...INDUSTRY_CATEGORIES]}
          labelMap={INDUSTRY_CATEGORY_LABELS}
          className="w-40"
        />
      </div>

      {companies.length === 0 ? (
        <EmptyState
          message="등록된 사업장이 없습니다"
          action={
            <Link href="/companies/new">
              <Button variant="outline" size="sm">첫 사업장을 등록해보세요</Button>
            </Link>
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState message="조건에 맞는 사업장이 없습니다" />
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>회사명</TableHead>
                <TableHead>사업자번호</TableHead>
                <TableHead>지역</TableHead>
                <TableHead>업종</TableHead>
                <TableHead>총 직원</TableHead>
                <TableHead>외국인 근로자</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.items.map((c) => (
                <TableRow
                  key={c.id}
                  className="cursor-pointer"
                  onClick={() => router.push(`/companies/${c.id}`)}
                >
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="font-mono text-xs">
                    {c.businessNumber}
                  </TableCell>
                  <TableCell>{c.regionName}</TableCell>
                  <TableCell>{c.industryCategoryName}</TableCell>
                  <TableCell>{c.employeeCount}명</TableCell>
                  <TableCell>{c.foreignWorkerCount}명</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <PaginationControls
            currentPage={paginated.currentPage}
            totalPages={paginated.totalPages}
            totalItems={paginated.totalItems}
            pageSize={paginated.pageSize}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}
