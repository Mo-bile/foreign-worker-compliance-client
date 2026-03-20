import { NextResponse, type NextRequest } from "next/server";
import { apiClient, ApiError } from "@/lib/api-client";
import type { ComplianceDeadlineResponse } from "@/types/api";

export async function GET(request: NextRequest) {
  const days = request.nextUrl.searchParams.get("days") ?? "30";
  try {
    const deadlines = await apiClient.get<ComplianceDeadlineResponse[]>(
      `/api/compliance/upcoming?days=${days}`,
    );
    return NextResponse.json(deadlines);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    return NextResponse.json({ message: "서버 오류가 발생했습니다" }, { status: 500 });
  }
}
