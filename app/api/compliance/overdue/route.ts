import { NextResponse, type NextRequest } from "next/server";
import { apiClient } from "@/lib/api-client";
import type { ComplianceDeadlineResponse } from "@/types/api";
import { handleRouteError } from "@/lib/api-route-utils";
import { parseId } from "@/lib/parse-id";

export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get("companyId");
  let path = "/api/compliance/overdue";
  if (raw !== null) {
    const companyId = parseId(raw);
    if (companyId === null) {
      return NextResponse.json({ message: "잘못된 사업장 ID입니다" }, { status: 400 });
    }
    path = `/api/compliance/overdue?companyId=${companyId}`;
  }
  try {
    const deadlines = await apiClient.get<ComplianceDeadlineResponse[]>(path);
    return NextResponse.json(deadlines);
  } catch (error) {
    return handleRouteError(error, "GET /api/compliance/overdue");
  }
}
