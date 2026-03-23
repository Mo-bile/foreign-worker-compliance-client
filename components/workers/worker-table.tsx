"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  VISA_TYPES,
  VISA_TYPE_LABELS,
  NATIONALITY_LABELS,
  WORKER_STATUSES,
  WORKER_STATUS_LABELS,
  INSURANCE_STATUSES,
} from "@/types/api";
import type { VisaType, WorkerStatus, InsuranceStatus, WorkerResponse } from "@/types/api";

const VISA_FILTER_LABELS: Record<VisaType, string> = Object.fromEntries(
  VISA_TYPES.map((v) => [v, `${v} — ${VISA_TYPE_LABELS[v]}`]),
) as Record<VisaType, string>;

const WORKER_STATUS_COLORS: Record<WorkerStatus, string> = {
  ACTIVE: "text-green-700 bg-green-50 px-2 py-0.5 rounded-full text-xs font-medium",
  INACTIVE: "text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full text-xs font-medium",
  TERMINATED: "text-red-700 bg-red-50 px-2 py-0.5 rounded-full text-xs font-medium",
};
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
import { EmptyState } from "@/components/common/empty-state";
import { FilterSelect } from "@/components/common/filter-select";
import { paginateItems } from "@/lib/pagination";
import { PaginationControls } from "@/components/ui/pagination-controls";

interface WorkerTableProps {
  readonly workers: readonly WorkerResponse[];
  readonly isLoading: boolean;
}

export function WorkerTable({ workers, isLoading }: WorkerTableProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [visaFilter, setVisaFilter] = useState<VisaType | "ALL">("ALL");
  const [statusFilter, setStatusFilter] = useState<WorkerStatus | "ALL">("ALL");
  const [insuranceFilter, setInsuranceFilter] = useState<InsuranceStatus | "ALL">("ALL");
  const [page, setPage] = useState(1);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleVisaChange = (value: string | null) => {
    if (!value) return;
    setVisaFilter(value as VisaType | "ALL");
    setPage(1);
  };

  const handleStatusChange = (value: string | null) => {
    if (!value) return;
    setStatusFilter(value as WorkerStatus | "ALL");
    setPage(1);
  };

  const handleInsuranceChange = (value: string | null) => {
    if (!value) return;
    setInsuranceFilter(value as InsuranceStatus | "ALL");
    setPage(1);
  };

  const filteredWorkers = workers.filter((worker) => {
    const nationalityLabel = NATIONALITY_LABELS[worker.nationality] ?? worker.nationality;
    const matchesSearch =
      search.trim() === "" ||
      worker.name.toLowerCase().includes(search.toLowerCase()) ||
      nationalityLabel.toLowerCase().includes(search.toLowerCase());
    const matchesVisa = visaFilter === "ALL" || worker.visaType === visaFilter;

    if (!matchesSearch || !matchesVisa) return false;
    if (statusFilter !== "ALL" && worker.status !== statusFilter) return false;
    if (insuranceFilter !== "ALL") {
      if (!worker.insuranceEligibilities.some((ie) => ie.status === insuranceFilter)) return false;
    }
    return true;
  });

  const paginated = paginateItems(filteredWorkers, page);

  if (isLoading) {
    return <WorkerTableSkeleton />;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap">
        <Input
          type="text"
          placeholder="이름 또는 국적으로 검색..."
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="sm:max-w-xs"
        />
        <FilterSelect
          value={visaFilter}
          onValueChange={handleVisaChange}
          placeholder="비자 유형 전체"
          options={[...VISA_TYPES]}
          labelMap={VISA_FILTER_LABELS}
        />
        <FilterSelect
          value={statusFilter}
          onValueChange={handleStatusChange}
          placeholder="상태 전체"
          options={[...WORKER_STATUSES]}
          labelMap={WORKER_STATUS_LABELS}
          className="w-40"
        />
        <FilterSelect
          value={insuranceFilter}
          onValueChange={handleInsuranceChange}
          placeholder="보험 상태 전체"
          options={[...INSURANCE_STATUSES]}
          className="w-44"
        />
      </div>

      {workers.length === 0 ? (
        <EmptyState message="등록된 근로자가 없습니다" />
      ) : filteredWorkers.length === 0 ? (
        <EmptyState message="조건에 맞는 근로자가 없습니다" />
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>이름</TableHead>
                <TableHead>국적</TableHead>
                <TableHead>비자 유형</TableHead>
                <TableHead>비자 만료일</TableHead>
                <TableHead>상태</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.items.map((worker) => {
                const nationalityLabel = NATIONALITY_LABELS[worker.nationality];
                const visaLabel = VISA_TYPE_LABELS[worker.visaType];
                const statusLabel = WORKER_STATUS_LABELS[worker.status];
                const statusClass = WORKER_STATUS_COLORS[worker.status];

                return (
                  <TableRow
                    key={worker.id}
                    className="cursor-pointer"
                    onClick={() => router.push(`/workers/${worker.id}`)}
                  >
                    <TableCell className="font-medium">{worker.name}</TableCell>
                    <TableCell>{nationalityLabel}</TableCell>
                    <TableCell>
                      <span className="font-mono text-xs">{worker.visaType}</span>
                      <span className="ml-1.5 text-muted-foreground">{visaLabel}</span>
                    </TableCell>
                    <TableCell>{worker.visaExpiryDate}</TableCell>
                    <TableCell>
                      <span className={statusClass}>{statusLabel}</span>
                    </TableCell>
                  </TableRow>
                );
              })}
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

function WorkerTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-8 w-44" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-10 w-full" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
      <Skeleton className="h-8 w-full" />
    </div>
  );
}
