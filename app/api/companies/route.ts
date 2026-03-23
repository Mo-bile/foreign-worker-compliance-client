import { NextResponse, type NextRequest } from "next/server";
import { apiClient } from "@/lib/api-client";
import { createCompanyRequestSchema } from "@/types/api";
import type { CompanyResponse } from "@/types/api";
import { handleRouteError, parseRequestBody, validateSchema } from "@/lib/api-route-utils";

export async function GET() {
  try {
    const companies = await apiClient.get<CompanyResponse[]>("/api/companies");
    return NextResponse.json(companies);
  } catch (error) {
    return handleRouteError(error, "GET /api/companies");
  }
}

export async function POST(request: NextRequest) {
  const bodyResult = await parseRequestBody(request);
  if (bodyResult instanceof NextResponse) return bodyResult;

  const validated = validateSchema(createCompanyRequestSchema, bodyResult.data);
  if (validated instanceof NextResponse) return validated;

  try {
    const company = await apiClient.post<CompanyResponse>("/api/companies", validated.data);
    return NextResponse.json(company, { status: 201 });
  } catch (error) {
    return handleRouteError(error, "POST /api/companies");
  }
}
