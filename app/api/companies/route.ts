import { NextResponse, type NextRequest } from "next/server";
import { apiClient, ApiError } from "@/lib/api-client";
import { createCompanyRequestSchema } from "@/types/api";
import type { CompanyResponse } from "@/types/api";

export async function GET() {
  try {
    const companies = await apiClient.get<CompanyResponse[]>("/api/companies");
    return NextResponse.json(companies);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    console.error("[GET /api/companies] Unexpected error:", error);
    return NextResponse.json({ message: "서버 오류가 발생했습니다" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "잘못된 요청 형식입니다" }, { status: 400 });
  }

  const parsed = createCompanyRequestSchema.safeParse(body);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "입력값이 올바르지 않습니다";
    return NextResponse.json({ message: firstError }, { status: 400 });
  }

  try {
    const company = await apiClient.post<CompanyResponse>("/api/companies", parsed.data);
    return NextResponse.json(company, { status: 201 });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    console.error("[POST /api/companies] Unexpected error:", error);
    return NextResponse.json({ message: "서버 오류가 발생했습니다" }, { status: 500 });
  }
}
