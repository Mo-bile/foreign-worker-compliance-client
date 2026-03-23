import { NextResponse } from "next/server";
import { apiClient } from "@/lib/api-client";
import type { WorkerResponse } from "@/types/api";
import { handleRouteError } from "@/lib/api-route-utils";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const worker = await apiClient.get<WorkerResponse>(`/api/workers/${id}`);
    return NextResponse.json(worker);
  } catch (error) {
    return handleRouteError(error, `GET /api/workers/${id}`);
  }
}
