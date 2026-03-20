"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { WorkerResponse, VisaType } from "@/types/api";
import { VISA_TYPES, VISA_TYPE_LABELS, NATIONALITY_LABELS } from "@/types/api";
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

const WORKER_STATUS_LABELS: Record<string, string> = {
  ACTIVE: "활성",
  INACTIVE: "비활성",
  TERMINATED: "퇴사",
};

const WORKER_STATUS_COLORS: Record<string, string> = {
  ACTIVE: "text-green-700 bg-green-50 px-2 py-0.5 rounded-full text-xs font-medium",
  INACTIVE: "text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full text-xs font-medium",
  TERMINATED: "text-red-700 bg-red-50 px-2 py-0.5 rounded-full text-xs font-medium",
};

interface WorkerTableProps {
  readonly workers: readonly WorkerResponse[];
  readonly isLoading: boolean;
}

export function WorkerTable({ workers, isLoading }: WorkerTableProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [visaFilter, setVisaFilter] = useState<VisaType | "ALL">("ALL");

  const filteredWorkers = workers.filter((worker) => {
    const nationalityLabel =
      NATIONALITY_LABELS[worker.nationality as keyof typeof NATIONALITY_LABELS] ??
      worker.nationality;
    const matchesSearch =
      search.trim() === "" ||
      worker.name.toLowerCase().includes(search.toLowerCase()) ||
      nationalityLabel.toLowerCase().includes(search.toLowerCase());
    const matchesVisa =
      visaFilter === "ALL" || worker.visaType === visaFilter;

    return matchesSearch && matchesVisa;
  });

  if (isLoading) {
    return <WorkerTableSkeleton />;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          type="text"
          placeholder="이름 또는 국적으로 검색..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:max-w-xs"
        />
        <Select
          value={visaFilter}
          onValueChange={(value) => setVisaFilter(value as VisaType | "ALL")}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="비자 유형 전체" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">전체</SelectItem>
            {VISA_TYPES.map((visa) => (
              <SelectItem key={visa} value={visa}>
                {visa} — {VISA_TYPE_LABELS[visa]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filteredWorkers.length === 0 ? (
        <div className="flex h-40 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
          조건에 맞는 근로자가 없습니다.
        </div>
      ) : (
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
            {filteredWorkers.map((worker) => {
              const nationalityLabel =
                NATIONALITY_LABELS[
                  worker.nationality as keyof typeof NATIONALITY_LABELS
                ] ?? worker.nationality;
              const visaLabel =
                VISA_TYPE_LABELS[worker.visaType as VisaType] ?? worker.visaType;
              const statusLabel =
                WORKER_STATUS_LABELS[worker.status] ?? worker.status;
              const statusClass =
                WORKER_STATUS_COLORS[worker.status] ??
                "text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full text-xs font-medium";

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
                    <span className="ml-1.5 text-muted-foreground">
                      {visaLabel}
                    </span>
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
      )}
    </div>
  );
}

function WorkerTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Skeleton className="h-8 w-64" />
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
