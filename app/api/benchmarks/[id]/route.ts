import { NextResponse } from "next/server";
import { apiClient } from "@/lib/api-client";
import { handleRouteError } from "@/lib/api-route-utils";
import { transformBenchmarkResponse } from "@/lib/transforms/benchmark-transform";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const benchmarkId = Number(id);
  if (!Number.isFinite(benchmarkId) || benchmarkId <= 0) {
    return NextResponse.json({ message: "유효하지 않은 id" }, { status: 400 });
  }

  let rawData: unknown;
  try {
    rawData = await apiClient.get(`/api/benchmarks/${benchmarkId}`);
  } catch (error) {
    return handleRouteError(error, `GET /api/benchmarks/${benchmarkId}`);
  }

  try {
    const benchmark = transformBenchmarkResponse(rawData);
    return NextResponse.json(benchmark);
  } catch (transformError) {
    console.error(`[GET /api/benchmarks/${benchmarkId}] Transform failed:`, transformError);
    return NextResponse.json(
      { message: "벤치마크 데이터 처리 중 오류가 발생했습니다" },
      { status: 500 },
    );
  }
}
