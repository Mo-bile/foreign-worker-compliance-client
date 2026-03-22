import { NextResponse, type NextRequest } from "next/server";
import { apiClient, ApiError } from "@/lib/api-client";
import type { CompanyResponse } from "@/types/api";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const company = await apiClient.get<CompanyResponse>(`/api/companies/${id}`);
    return NextResponse.json(company);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    return NextResponse.json({ message: "서버 오류가 발생했습니다" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const company = await apiClient.put<CompanyResponse>(`/api/companies/${id}`, body);
    return NextResponse.json(company);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    return NextResponse.json({ message: "서버 오류가 발생했습니다" }, { status: 500 });
  }
}
