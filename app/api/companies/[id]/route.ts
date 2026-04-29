import { NextResponse, type NextRequest } from "next/server";
import { apiClient } from "@/lib/api-client";
import { parseId } from "@/lib/parse-id";
import { updateCompanyRequestSchema, companyBaseFields } from "@/types/api";
import type { CompanyResponse } from "@/types/api";
import { handleRouteError, parseRequestBody, validateSchema } from "@/lib/api-route-utils";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const companyId = parseId(id);
  if (companyId === null) {
    return NextResponse.json({ message: "잘못된 사업장 ID입니다" }, { status: 400 });
  }

  try {
    const company = await apiClient.get<CompanyResponse>(`/api/companies/${companyId}`);
    return NextResponse.json(company);
  } catch (error) {
    return handleRouteError(error, `GET /api/companies/${companyId}`);
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const companyId = parseId(id);
  if (companyId === null) {
    return NextResponse.json({ message: "잘못된 사업장 ID입니다" }, { status: 400 });
  }

  const bodyResult = await parseRequestBody(request);
  if (bodyResult instanceof NextResponse) return bodyResult;

  const validated = validateSchema(updateCompanyRequestSchema, bodyResult.data);
  if (validated instanceof NextResponse) return validated;

  try {
    const company = await apiClient.put<CompanyResponse>(
      `/api/companies/${companyId}`,
      validated.data,
    );
    return NextResponse.json(company);
  } catch (error) {
    return handleRouteError(error, `PUT /api/companies/${companyId}`);
  }
}

const patchCompanySchema = companyBaseFields.partial();

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const companyId = parseId(id);
  if (companyId === null) {
    return NextResponse.json({ message: "잘못된 사업장 ID입니다" }, { status: 400 });
  }

  const bodyResult = await parseRequestBody(request);
  if (bodyResult instanceof NextResponse) return bodyResult;

  const validated = validateSchema(patchCompanySchema, bodyResult.data);
  if (validated instanceof NextResponse) return validated;

  try {
    const company = await apiClient.patch<CompanyResponse>(
      `/api/companies/${companyId}`,
      validated.data,
    );
    return NextResponse.json(company);
  } catch (error) {
    return handleRouteError(error, `PATCH /api/companies/${companyId}`);
  }
}
