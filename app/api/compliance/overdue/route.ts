import { NextResponse } from "next/server";
import { apiClient } from "@/lib/api-client";
import type { ComplianceDeadlineResponse } from "@/types/api";
import { handleRouteError } from "@/lib/api-route-utils";

export async function GET() {
  try {
    const deadlines = await apiClient.get<ComplianceDeadlineResponse[]>("/api/compliance/overdue");
    return NextResponse.json(deadlines);
  } catch (error) {
    return handleRouteError(error, "GET /api/compliance/overdue");
  }
}
