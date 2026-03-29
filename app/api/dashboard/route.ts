import { NextResponse, type NextRequest } from "next/server";
import { apiClient } from "@/lib/api-client";
import { parseId } from "@/lib/parse-id";
import type { DashboardRawResponse } from "@/types/dashboard";
import { handleRouteError } from "@/lib/api-route-utils";
import { transformDashboardResponse } from "@/lib/transforms/dashboard-transform";

export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get("companyId");
  if (raw === null) {
    return NextResponse.json({ message: "companyId가 필요합니다" }, { status: 400 });
  }

  const companyId = parseId(raw);
  if (companyId === null) {
    return NextResponse.json({ message: "잘못된 사업장 ID입니다" }, { status: 400 });
  }

  let rawResponse: DashboardRawResponse;
  try {
    rawResponse = await apiClient.get<DashboardRawResponse>(
      `/api/dashboard?companyId=${companyId}`,
    );
  } catch (error) {
    return handleRouteError(error, "GET /api/dashboard");
  }

  try {
    const transformed = transformDashboardResponse(rawResponse);
    return NextResponse.json(transformed);
  } catch (transformError) {
    console.error(
      `[GET /api/dashboard] Transform failed for companyId=${companyId}:`,
      transformError,
    );
    return NextResponse.json(
      { message: "대시보드 데이터 처리 중 오류가 발생했습니다" },
      { status: 502 },
    );
  }
}
