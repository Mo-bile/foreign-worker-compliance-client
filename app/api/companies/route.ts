import { NextResponse, type NextRequest } from "next/server";
import { apiClient, ApiError } from "@/lib/api-client";
import type { CompanyResponse } from "@/types/api";

export async function GET() {
  try {
    const companies = await apiClient.get<CompanyResponse[]>("/api/companies");
    return NextResponse.json(companies);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    return NextResponse.json({ message: "서버 오류가 발생했습니다" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const company = await apiClient.post<CompanyResponse>("/api/companies", body);
    return NextResponse.json(company, { status: 201 });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    return NextResponse.json({ message: "서버 오류가 발생했습니다" }, { status: 500 });
  }
}
