import { NextResponse } from "next/server";
import { apiClient } from "@/lib/api-client";
import { handleRouteError, parseRequestBody, validateSchema } from "@/lib/api-route-utils";
import {
  suggestWorkerKoreanNameRequestSchema,
  type SuggestWorkerKoreanNameResponse,
} from "@/types/api";

export async function POST(request: Request) {
  const bodyResult = await parseRequestBody(request);
  if (bodyResult instanceof NextResponse) return bodyResult;

  const validation = validateSchema(suggestWorkerKoreanNameRequestSchema, bodyResult.data);
  if (validation instanceof NextResponse) return validation;

  try {
    const result = await apiClient.post<SuggestWorkerKoreanNameResponse>(
      "/api/workers/korean-name/suggest",
      validation.data,
    );
    return NextResponse.json(result);
  } catch (error) {
    return handleRouteError(error, "POST /api/workers/korean-name/suggest");
  }
}
