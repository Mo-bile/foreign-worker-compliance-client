import { NextResponse, type NextRequest } from "next/server";
import { apiClient } from "@/lib/api-client";
import { handleRouteError, parseRequestBody } from "@/lib/api-route-utils";
import type { CompleteDeadlineSummaryResponse } from "@/types/compliance";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const bodyResult = await parseRequestBody(request);
  if (bodyResult instanceof NextResponse) return bodyResult;

  let summary: CompleteDeadlineSummaryResponse;
  try {
    summary = await apiClient.patch<CompleteDeadlineSummaryResponse>(
      `/api/compliance/${id}/complete`,
      bodyResult.data,
    );
  } catch (error) {
    return handleRouteError(error, `PATCH /api/compliance/${id}/complete`);
  }

  try {
    return NextResponse.json(summary, { status: 202 });
  } catch (error) {
    return handleRouteError(error, `PATCH /api/compliance/${id}/complete (transform)`);
  }
}
