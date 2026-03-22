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
import type { CompanyResponse, Region, IndustryCategory } from "@/types/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { paginateItems } from "@/lib/pagination";
import { PaginationControls } from "@/components/ui/pagination-controls";

interface CompanyTableProps {
  readonly companies: readonly CompanyResponse[];
  readonly isLoading: boolean;
}

export function CompanyTable({ companies, isLoading }: CompanyTableProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [regionFilter, setRegionFilter] = useState<Region | "ALL">("ALL");
  const [industryFilter, setIndustryFilter] = useState<
    IndustryCategory | "ALL"
  >("ALL");
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
        <Select
          value={regionFilter}
          onValueChange={(v) => {
            setRegionFilter(v as Region | "ALL");
            setPage(1);
          }}
        >
          <SelectTrigger className="w-40" aria-label="지역 필터">
            <SelectValue placeholder="지역 전체" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">전체</SelectItem>
            {REGIONS.map((r) => (
              <SelectItem key={r} value={r}>
                {REGION_LABELS[r]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={industryFilter}
          onValueChange={(v) => {
            setIndustryFilter(v as IndustryCategory | "ALL");
            setPage(1);
          }}
        >
          <SelectTrigger className="w-40" aria-label="업종 필터">
            <SelectValue placeholder="업종 전체" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">전체</SelectItem>
            {INDUSTRY_CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {INDUSTRY_CATEGORY_LABELS[cat]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {companies.length === 0 ? (
        <div className="flex h-40 flex-col items-center justify-center gap-3 rounded-lg border border-dashed text-sm text-muted-foreground">
          <p>등록된 사업장이 없습니다</p>
          <Link href="/companies/new">
            <Button variant="outline" size="sm">
              첫 사업장을 등록해보세요
            </Button>
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex h-40 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
          조건에 맞는 사업장이 없습니다
        </div>
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
