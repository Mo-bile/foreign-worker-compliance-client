import { NextResponse, type NextRequest } from "next/server";
import { apiClient } from "@/lib/api-client";
import { handleRouteError, parseRequestBody, validateSchema } from "@/lib/api-route-utils";
import { transformBenchmarkList, transformBenchmarkResponse } from "@/lib/transforms/benchmark-transform";
import { createBenchmarkRequestSchema, type BenchmarkResponse } from "@/types/benchmark";

export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get("companyId");
  if (!raw) {
    return NextResponse.json({ message: "companyId required" }, { status: 400 });
  }

  const companyId = Number(raw);
  if (!Number.isFinite(companyId) || companyId <= 0) {
    return NextResponse.json({ message: "유효하지 않은 companyId" }, { status: 400 });
  }

  let rawData: unknown;
  try {
    rawData = await apiClient.get(`/api/benchmarks?companyId=${companyId}`);
  } catch (error) {
    return handleRouteError(error, "GET /api/benchmarks");
  }

  try {
    const benchmarks = transformBenchmarkList(rawData);
    return NextResponse.json(benchmarks);
  } catch (transformError) {
    console.error("[GET /api/benchmarks] Transform failed:", transformError);
    return NextResponse.json(
      { message: "벤치마크 데이터 처리 중 오류가 발생했습니다" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const bodyResult = await parseRequestBody(request);
  if (bodyResult instanceof NextResponse) return bodyResult;

  const validated = validateSchema(createBenchmarkRequestSchema, bodyResult.data);
  if (validated instanceof NextResponse) return validated;

  let raw: BenchmarkResponse;
  try {
    raw = await apiClient.postAndFollow<BenchmarkResponse>(
      "/api/benchmarks",
      validated.data,
    );
  } catch (error) {
    return handleRouteError(error, "POST /api/benchmarks");
  }

  try {
    const transformed = transformBenchmarkResponse(raw);
    return NextResponse.json(transformed, { status: 201 });
  } catch (transformError) {
    console.error("[POST /api/benchmarks] Transform failed:", transformError);
    return NextResponse.json(
      { message: "벤치마크 결과 처리 중 오류가 발생했습니다" },
      { status: 500 },
    );
  }
}
