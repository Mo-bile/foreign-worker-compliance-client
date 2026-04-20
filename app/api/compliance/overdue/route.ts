import { NextResponse, type NextRequest } from "next/server";
import { apiClient } from "@/lib/api-client";
import type { ComplianceDeadlineResponse } from "@/types/api";
import { handleRouteError } from "@/lib/api-route-utils";

export async function GET(request: NextRequest) {
  const companyId = request.nextUrl.searchParams.get("companyId");
  const params = companyId ? `?companyId=${companyId}` : "";
  try {
    const deadlines = await apiClient.get<ComplianceDeadlineResponse[]>(`/api/compliance/overdue${params}`);
    return NextResponse.json(deadlines);
  } catch (error) {
    return handleRouteError(error, "GET /api/compliance/overdue");
  }
}
