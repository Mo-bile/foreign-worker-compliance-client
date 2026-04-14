import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { apiClient } from "@/lib/api-client";
import { simulationRequestSchema } from "@/types/simulator";
import type { SimulationResultResponse } from "@/types/simulator";
import type { MetadataResponse } from "@/types/metadata";
import { handleRouteError, parseRequestBody, validateSchema } from "@/lib/api-route-utils";
import { transformSimulationResult } from "@/lib/transforms/simulation-transform";

const bffRequestSchema = simulationRequestSchema.extend({
  companyId: z.number().int().positive(),
});

async function fetchDeductionCodes(): Promise<ReadonlySet<string>> {
  try {
    const metadata = await apiClient.get<MetadataResponse>("/api/metadata");
    return new Set(metadata.scoringPolicies.filter((p) => p.isDeduction).map((p) => p.code));
  } catch (error) {
    console.error(
      "[fetchDeductionCodes] Failed to load metadata — deduction items will not be distinguished:",
      error,
    );
    return new Set();
  }
}

export async function POST(request: NextRequest) {
  const bodyResult = await parseRequestBody(request);
  if (bodyResult instanceof NextResponse) return bodyResult;

  const validated = validateSchema(bffRequestSchema, bodyResult.data);
  if (validated instanceof NextResponse) return validated;

  let raw: SimulationResultResponse;
  try {
    raw = await apiClient.postAndFollow<SimulationResultResponse>(
      "/api/simulations",
      validated.data,
    );
  } catch (error) {
    return handleRouteError(error, "POST /api/simulations");
  }

  if (
    !raw?.employmentLimitAnalysis ||
    !raw?.scoringAnalysis ||
    !raw?.quotaStatus ||
    !raw?.timelineEstimate ||
    !raw?.aiInsights
  ) {
    console.error(
      "[POST /api/simulations] BE response missing required fields:",
      Object.keys(raw ?? {}),
    );
    return NextResponse.json(
      { message: "시뮬레이션 결과 처리 중 오류가 발생했습니다" },
      { status: 502 },
    );
  }

  try {
    const deductionCodes = await fetchDeductionCodes();
    const transformed = transformSimulationResult(raw, deductionCodes);
    return NextResponse.json(transformed);
  } catch (transformError) {
    console.error(`[POST /api/simulations] Transform failed for id=${raw.id}:`, transformError);
    return NextResponse.json(
      { message: "시뮬레이션 결과 처리 중 오류가 발생했습니다" },
      { status: 500 },
    );
  }
}
