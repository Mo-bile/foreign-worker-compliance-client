import { NextResponse, type NextRequest } from "next/server";
import { apiClient } from "@/lib/api-client";
import { handleRouteError } from "@/lib/api-route-utils";
import { parseId } from "@/lib/parse-id";
import { complianceReportSchema, type ComplianceReport } from "@/types/compliance-report";

export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get("companyId");
  if (raw === null) {
    return NextResponse.json({ message: "companyId가 필요합니다" }, { status: 400 });
  }

  const companyId = parseId(raw);
  if (companyId === null) {
    return NextResponse.json({ message: "잘못된 사업장 ID입니다" }, { status: 400 });
  }

  const yearMonth = request.nextUrl.searchParams.get("yearMonth");
  if (yearMonth !== null && !/^\d{4}-(0[1-9]|1[0-2])$/.test(yearMonth)) {
    return NextResponse.json({ message: "잘못된 날짜 형식입니다 (YYYY-MM)" }, { status: 400 });
  }

  const searchParams = new URLSearchParams({ companyId: String(companyId) });
  if (yearMonth) {
    searchParams.set("yearMonth", yearMonth);
  }

  let rawResponse: unknown;
  try {
    rawResponse = await apiClient.get(`/api/compliance-report?${searchParams.toString()}`);
  } catch (error) {
    return handleRouteError(error, "GET /api/compliance-report");
  }

  try {
    const transformed: ComplianceReport = complianceReportSchema.parse(rawResponse);
    return NextResponse.json(transformed);
  } catch (transformError) {
    console.error(
      `[GET /api/compliance-report] Transform failed for companyId=${companyId}${yearMonth ? `, yearMonth=${yearMonth}` : ""}:`,
      transformError,
    );
    return NextResponse.json(
      { message: "준수 현황 리포트 처리 중 오류가 발생했습니다" },
      { status: 502 },
    );
  }
}
