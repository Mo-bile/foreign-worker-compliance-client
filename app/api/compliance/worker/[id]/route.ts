import { NextResponse } from "next/server";
import { apiClient } from "@/lib/api-client";
import type { ComplianceDeadlineResponse } from "@/types/api";
import { handleRouteError } from "@/lib/api-route-utils";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const deadlines = await apiClient.get<ComplianceDeadlineResponse[]>(
      `/api/compliance/worker/${id}`,
    );
    return NextResponse.json(deadlines);
  } catch (error) {
    return handleRouteError(error, `GET /api/compliance/worker/${id}`);
  }
}
