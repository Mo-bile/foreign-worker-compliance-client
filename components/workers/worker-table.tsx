"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  NATIONALITIES,
  VISA_TYPES,
  VISA_TYPE_LABELS,
  NATIONALITY_LABELS,
  WORKER_STATUSES,
  WORKER_STATUS_LABELS,
  INSURANCE_STATUSES,
  INSURANCE_STATUS_LABELS,
} from "@/types/api";
import type {
  InsuranceEligibilityDto,
  InsuranceStatus,
  Nationality,
  VisaType,
  WorkerResponse,
  WorkerStatus,
} from "@/types/api";
import { H2Badge } from "./h2-badge";

const VISA_FILTER_LABELS: Record<VisaType, string> = Object.fromEntries(
  VISA_TYPES.map((v) => [v, `${v} — ${VISA_TYPE_LABELS[v]}`]),
) as Record<VisaType, string>;

const STATUS_PRIORITY: Record<string, number> = { ACTIVE: 0, INACTIVE: 1 };

const WORKER_STATUS_COLORS: Record<WorkerStatus, string> = {
  ACTIVE:
    "bg-[var(--signal-green-bg)] text-[var(--signal-green)] px-2 py-0.5 rounded-full text-xs font-medium",
  INACTIVE:
    "bg-[var(--signal-red-bg)] text-[var(--signal-red)] px-2 py-0.5 rounded-full text-xs font-medium",
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

const SEARCH_TYPES = [
  "NAME",
  "KOREAN_NAME",
  "PHONE",
  "REGISTRATION_NUMBER",
  "PASSPORT_NUMBER",
] as const;
type SearchType = (typeof SEARCH_TYPES)[number];
type SearchTypeFilter = SearchType | "ALL";

const SEARCH_TYPE_LABELS: Record<SearchType, string> = {
  NAME: "이름",
  KOREAN_NAME: "한글 이름",
  PHONE: "전화번호",
  REGISTRATION_NUMBER: "외국인등록번호",
  PASSPORT_NUMBER: "여권번호",
};

const normalizeTextSearch = (value: string) => value.trim().toLowerCase();

const normalizeIdentifierSearch = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

const matchesIdentifierSearch = (field: string | null, search: string) =>
  field == null ? false : normalizeIdentifierSearch(field).includes(search);

const matchesWorkerSearch = (
  worker: WorkerResponse,
  search: string,
  searchType: SearchTypeFilter,
) => {
  const textSearch = normalizeTextSearch(search);
  if (textSearch === "") return true;

  const identifierSearch = normalizeIdentifierSearch(search);
  const matchesName = worker.name.toLowerCase().includes(textSearch);
  const matchesKoreanName = normalizeTextSearch(worker.koreanName ?? "").includes(textSearch);
  const matchesPhone =
    identifierSearch !== "" && matchesIdentifierSearch(worker.contactPhone, identifierSearch);
  const matchesRegistrationNumber =
    identifierSearch !== "" &&
    matchesIdentifierSearch(worker.registrationNumber, identifierSearch);
  const matchesPassportNumber =
    identifierSearch !== "" && matchesIdentifierSearch(worker.passportNumber, identifierSearch);

  switch (searchType) {
    case "NAME":
      return matchesName;
    case "KOREAN_NAME":
      return matchesKoreanName;
    case "PHONE":
      return matchesPhone;
    case "REGISTRATION_NUMBER":
      return matchesRegistrationNumber;
    case "PASSPORT_NUMBER":
      return matchesPassportNumber;
    case "ALL":
      return (
        matchesName ||
        matchesKoreanName ||
        matchesPhone ||
        matchesRegistrationNumber ||
        matchesPassportNumber
      );
  }
};

export function WorkerTable({ workers, isLoading }: WorkerTableProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [searchTypeFilter, setSearchTypeFilter] = useState<SearchTypeFilter>("ALL");
  const [nationalityFilter, setNationalityFilter] = useState<Nationality | "ALL">("ALL");
  const [visaFilter, setVisaFilter] = useState<VisaType | "ALL">("ALL");
  const [statusFilter, setStatusFilter] = useState<WorkerStatus | "ALL">("ALL");
  const [insuranceFilter, setInsuranceFilter] = useState<InsuranceStatus | "ALL">("ALL");
  const [sortKey, setSortKey] = useState<string>("status");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const toggleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  };

  const sortIndicator = (key: string) => (sortKey === key ? (sortDir === "asc" ? " ↑" : " ↓") : "");
  const [page, setPage] = useState(1);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleSearchTypeChange = (value: string | null) => {
    if (!value) return;
    setSearchTypeFilter(value as SearchTypeFilter);
    setPage(1);
  };

  const handleNationalityChange = (value: string | null) => {
    if (!value) return;
    setNationalityFilter(value as Nationality | "ALL");
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
    const matchesSearch = matchesWorkerSearch(worker, search, searchTypeFilter);
    if (nationalityFilter !== "ALL" && worker.nationality !== nationalityFilter) return false;
    const matchesVisa = visaFilter === "ALL" || worker.visaType === visaFilter;

    if (!matchesSearch || !matchesVisa) return false;
    if (statusFilter !== "ALL" && worker.status !== statusFilter) return false;
    if (insuranceFilter !== "ALL") {
      if (!worker.insuranceEligibilities.some((ie) => ie.status === insuranceFilter)) return false;
    }
    return true;
  });

  const sortedWorkers = [...filteredWorkers].sort((a, b) => {
    let cmp = 0;
    switch (sortKey) {
      case "name":
        cmp = a.name.localeCompare(b.name, "ko");
        break;
      case "nationality":
        cmp = (NATIONALITY_LABELS[a.nationality] ?? a.nationality).localeCompare(
          NATIONALITY_LABELS[b.nationality] ?? b.nationality,
          "ko",
        );
        break;
      case "visaType":
        cmp = a.visaType.localeCompare(b.visaType);
        break;
      case "visaExpiry":
        cmp = a.visaExpiryDate.localeCompare(b.visaExpiryDate);
        break;
      case "status":
        cmp = (STATUS_PRIORITY[a.status] ?? 9) - (STATUS_PRIORITY[b.status] ?? 9);
        break;
      default:
        cmp = 0;
    }
    return sortDir === "asc" ? cmp : -cmp;
  });

  const paginated = paginateItems(sortedWorkers, page);

  if (isLoading) {
    return <WorkerTableSkeleton />;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap">
        <FilterSelect
          value={searchTypeFilter}
          onValueChange={handleSearchTypeChange}
          placeholder="전체 검색"
          options={[...SEARCH_TYPES]}
          labelMap={SEARCH_TYPE_LABELS}
          className="w-36"
        />
        <Input
          type="text"
          placeholder="검색어 입력..."
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="sm:max-w-xs"
        />
        <FilterSelect
          value={nationalityFilter}
          onValueChange={handleNationalityChange}
          placeholder="국적 전체"
          options={[...NATIONALITIES]}
          labelMap={NATIONALITY_LABELS}
          className="w-44"
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
          labelMap={INSURANCE_STATUS_LABELS}
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
                <TableHead
                  className="cursor-pointer select-none"
                  onClick={() => toggleSort("name")}
                >
                  이름{sortIndicator("name")}
                </TableHead>
                <TableHead>전화번호</TableHead>
                <TableHead
                  className="cursor-pointer select-none"
                  onClick={() => toggleSort("nationality")}
                >
                  국적{sortIndicator("nationality")}
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none"
                  onClick={() => toggleSort("visaType")}
                >
                  비자 유형{sortIndicator("visaType")}
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none"
                  onClick={() => toggleSort("visaExpiry")}
                >
                  비자 만료일{sortIndicator("visaExpiry")}
                </TableHead>
                <TableHead
                  className="cursor-pointer select-none"
                  onClick={() => toggleSort("status")}
                >
                  상태{sortIndicator("status")}
                </TableHead>
                <TableHead>보험</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.items.map((worker) => {
                const nationalityLabel =
                  NATIONALITY_LABELS[worker.nationality] ?? worker.nationality;
                const statusClass = WORKER_STATUS_COLORS[worker.status];
                const koreanName = worker.koreanName?.trim() ?? "";

                return (
                  <TableRow
                    key={worker.id}
                    className="cursor-pointer"
                    onClick={() => router.push(`/workers/${worker.id}`)}
                  >
                    <TableCell className="font-medium">
                      <div className="space-y-0.5">
                        <div>{worker.name}</div>
                        {koreanName ? (
                          <div className="text-xs font-normal text-muted-foreground">
                            {koreanName}
                          </div>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell>{worker.contactPhone ?? "—"}</TableCell>
                    <TableCell>{nationalityLabel}</TableCell>
                    <TableCell>
                      <span className="font-mono text-xs">{worker.visaType}</span>
                      <span className="ml-1.5 text-muted-foreground">
                        {VISA_TYPE_LABELS[worker.visaType]}
                      </span>
                      <H2Badge visaType={worker.visaType} />
                    </TableCell>
                    <TableCell>{worker.visaExpiryDate}</TableCell>
                    <TableCell>
                      <span className={statusClass}>{WORKER_STATUS_LABELS[worker.status]}</span>
                    </TableCell>
                    <TableCell>
                      <InsuranceSummaryCell eligibilities={worker.insuranceEligibilities} />
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

function InsuranceSummaryCell({
  eligibilities,
}: {
  readonly eligibilities: readonly InsuranceEligibilityDto[];
}) {
  const mandatoryLikeStatuses = new Set(["MANDATORY", "FULL_MANDATORY", "AUTO_BENEFITS_OPT_IN"]);
  const mandatory = eligibilities.filter((eligibility) =>
    mandatoryLikeStatuses.has(eligibility.status),
  ).length;
  const exempt = eligibilities.filter((eligibility) => eligibility.status === "EXEMPT").length;
  const optional = eligibilities.filter(
    (eligibility) =>
      !mandatoryLikeStatuses.has(eligibility.status) && eligibility.status !== "EXEMPT",
  ).length;

  const parts = [
    ...(mandatory > 0 ? [`의무 ${mandatory}`] : []),
    ...(optional > 0 ? [`신청 ${optional}`] : []),
    ...(exempt > 0 ? [`제외 ${exempt}`] : []),
  ];

  if (parts.length === 0) {
    return <span className="text-xs text-muted-foreground">—</span>;
  }

  return <span className="text-xs text-muted-foreground">{parts.join(" / ")}</span>;
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
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
      <Skeleton className="h-8 w-full" />
    </div>
  );
}
