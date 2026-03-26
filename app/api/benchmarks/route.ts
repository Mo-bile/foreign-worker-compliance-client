import { NextResponse, type NextRequest } from "next/server";
import { mockBenchmarkResponse } from "@/mocks/benchmark-data";
import { handleRouteError } from "@/lib/api-route-utils";

export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get("companyId");
  if (!raw) {
    return NextResponse.json({ message: "companyId required" }, { status: 400 });
  }

  const companyId = Number(raw);
  if (!Number.isFinite(companyId) || companyId <= 0) {
    return NextResponse.json({ message: "유효하지 않은 companyId" }, { status: 400 });
  }

  try {
    // Mock phase: return hardcoded data directly
    // TODO: Replace with apiClient.get<BenchmarkResponse>(`/api/benchmarks?companyId=${companyId}`)
    return NextResponse.json(mockBenchmarkResponse);
  } catch (error) {
    return handleRouteError(error, "GET /api/benchmarks");
  }
}
