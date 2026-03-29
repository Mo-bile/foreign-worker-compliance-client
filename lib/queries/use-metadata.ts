"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchApi } from "./query-utils";
import type { MetadataResponse } from "@/types/metadata";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export function useMetadata() {
  return useQuery<MetadataResponse>({
    queryKey: ["metadata"],
    queryFn: () => fetchApi<MetadataResponse>("/api/metadata", "메타데이터를 불러올 수 없습니다"),
    staleTime: ONE_DAY_MS,
  });
}
