import { NextResponse, type NextRequest } from "next/server";
import { simulationRequestSchema } from "@/types/simulator";
import { mockSimulationResponse } from "@/mocks/simulator-data";
import { handleRouteError, parseRequestBody, validateSchema } from "@/lib/api-route-utils";

export async function POST(request: NextRequest) {
  const bodyResult = await parseRequestBody(request);
  if (bodyResult instanceof NextResponse) return bodyResult;

  const validated = validateSchema(simulationRequestSchema, bodyResult.data);
  if (validated instanceof NextResponse) return validated;

  try {
    // Mock phase: return hardcoded data directly
    // TODO: Replace with apiClient.post<SimulationResponse>("/api/simulations", validated.data)
    return NextResponse.json(mockSimulationResponse);
  } catch (error) {
    return handleRouteError(error, "POST /api/simulations");
  }
}
