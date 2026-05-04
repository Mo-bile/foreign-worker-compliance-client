import { NextResponse } from "next/server";
import { apiClient } from "@/lib/api-client";
import type { RestoreEmploymentResponse } from "@/types/api";
import { handleRouteError } from "@/lib/api-route-utils";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const response = await apiClient.post<RestoreEmploymentResponse>(
      `/api/workers/${id}/restore-employment`,
      {},
    );
    return NextResponse.json(response, { status: 202 });
  } catch (error) {
    return handleRouteError(error, `POST /api/workers/${id}/restore-employment`);
  }
}
