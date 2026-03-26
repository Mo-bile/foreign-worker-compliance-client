import { NextResponse, type NextRequest } from "next/server";
import { mockComplianceReport } from "@/mocks/report-data";
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
    // TODO: Replace with apiClient.get<ComplianceReportResponse>(`/api/reports?companyId=${companyId}`)
    return NextResponse.json(mockComplianceReport);
  } catch (error) {
    return handleRouteError(error, "GET /api/reports");
  }
}
