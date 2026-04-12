import { benchmarkResponseSchema, type BenchmarkResponse } from "@/types/benchmark";

export function transformBenchmarkResponse(raw: unknown): BenchmarkResponse {
  return benchmarkResponseSchema.parse(raw);
}

export function transformBenchmarkList(raw: unknown): BenchmarkResponse[] {
  if (!Array.isArray(raw)) {
    throw new Error("Expected array for benchmark list");
  }
  return raw.map(transformBenchmarkResponse);
}
