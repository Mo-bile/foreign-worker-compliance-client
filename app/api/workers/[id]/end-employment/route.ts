import { NextResponse } from "next/server";
import { apiClient } from "@/lib/api-client";
import type { EndEmploymentResponse } from "@/types/api";
import { endEmploymentRequestSchema } from "@/types/api";
import { handleRouteError, parseRequestBody, validateSchema } from "@/lib/api-route-utils";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const bodyResult = await parseRequestBody(request);
  if (bodyResult instanceof NextResponse) return bodyResult;

  const validation = validateSchema(endEmploymentRequestSchema, bodyResult.data);
  if (validation instanceof NextResponse) return validation;

  try {
    const response = await apiClient.post<EndEmploymentResponse>(
      `/api/workers/${id}/end-employment`,
      validation.data,
    );
    return NextResponse.json(response, { status: 202 });
  } catch (error) {
    return handleRouteError(error, `POST /api/workers/${id}/end-employment`);
  }
}
