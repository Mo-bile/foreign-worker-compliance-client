import { NextResponse } from "next/server";
import { apiClient } from "@/lib/api-client";
import type { WorkerResponse } from "@/types/api";
import { updateWorkerRequestSchema } from "@/types/api";
import { handleRouteError, parseRequestBody, validateSchema } from "@/lib/api-route-utils";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const worker = await apiClient.get<WorkerResponse>(`/api/workers/${id}`);
    return NextResponse.json(worker);
  } catch (error) {
    return handleRouteError(error, `GET /api/workers/${id}`);
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const bodyResult = await parseRequestBody(request);
  if (bodyResult instanceof NextResponse) return bodyResult;

  const validation = validateSchema(updateWorkerRequestSchema, bodyResult.data);
  if (validation instanceof NextResponse) return validation;

  const { nationality, ...rest } = validation.data;
  const backendPayload = { ...rest, nationalityCode: nationality };

  try {
    await apiClient.putVoid(`/api/workers/${id}`, backendPayload);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleRouteError(error, `PUT /api/workers/${id}`);
  }
}
