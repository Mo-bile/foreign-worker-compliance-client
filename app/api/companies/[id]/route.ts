import { NextResponse, type NextRequest } from "next/server";
import { apiClient, ApiError } from "@/lib/api-client";
import { updateCompanyRequestSchema } from "@/types/api";
import type { CompanyResponse } from "@/types/api";

function parseId(id: string): number | null {
  const num = Number(id);
  if (Number.isNaN(num) || num <= 0 || !Number.isInteger(num)) return null;
  return num;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const companyId = parseId(id);
  if (companyId === null) {
    return NextResponse.json({ message: "잘못된 사업장 ID입니다" }, { status: 400 });
  }

  try {
    const company = await apiClient.get<CompanyResponse>(`/api/companies/${companyId}`);
    return NextResponse.json(company);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    console.error(`[GET /api/companies/${companyId}] Unexpected error:`, error);
    return NextResponse.json({ message: "서버 오류가 발생했습니다" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const companyId = parseId(id);
  if (companyId === null) {
    return NextResponse.json({ message: "잘못된 사업장 ID입니다" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "잘못된 요청 형식입니다" }, { status: 400 });
  }

  const parsed = updateCompanyRequestSchema.safeParse(body);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "입력값이 올바르지 않습니다";
    return NextResponse.json({ message: firstError }, { status: 400 });
  }

  try {
    const company = await apiClient.put<CompanyResponse>(`/api/companies/${companyId}`, parsed.data);
    return NextResponse.json(company);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    console.error(`[PUT /api/companies/${companyId}] Unexpected error:`, error);
    return NextResponse.json({ message: "서버 오류가 발생했습니다" }, { status: 500 });
  }
}
