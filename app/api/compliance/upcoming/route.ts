import { NextResponse, type NextRequest } from "next/server";
import { apiClient } from "@/lib/api-client";
import type { ComplianceDeadlineResponse } from "@/types/api";
import { handleRouteError } from "@/lib/api-route-utils";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const days = searchParams.get("days") ?? "30";
  const companyId = searchParams.get("companyId");
  const params = new URLSearchParams({ days });
  if (companyId) params.set("companyId", companyId);
  try {
    const deadlines = await apiClient.get<ComplianceDeadlineResponse[]>(`/api/compliance/upcoming?${params.toString()}`);
    return NextResponse.json(deadlines);
  } catch (error) {
    return handleRouteError(error, "GET /api/compliance/upcoming");
  }
}
