import { NextResponse, type NextRequest } from "next/server";
import { apiClient } from "@/lib/api-client";
import type { ComplianceDeadlineResponse } from "@/types/api";
import { handleRouteError } from "@/lib/api-route-utils";
import { parseId } from "@/lib/parse-id";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const rawDays = searchParams.get("days") ?? "30";
  const days = Number(rawDays);
  if (!Number.isInteger(days) || days <= 0 || days > 365) {
    return NextResponse.json(
      { message: "days는 1~365 사이의 정수여야 합니다" },
      { status: 400 },
    );
  }

  const rawCompanyId = searchParams.get("companyId");
  const params = new URLSearchParams({ days: String(days) });
  if (rawCompanyId !== null) {
    const companyId = parseId(rawCompanyId);
    if (companyId === null) {
      return NextResponse.json({ message: "잘못된 사업장 ID입니다" }, { status: 400 });
    }
    params.set("companyId", String(companyId));
  }

  try {
    const deadlines = await apiClient.get<ComplianceDeadlineResponse[]>(
      `/api/compliance/upcoming?${params.toString()}`,
    );
    return NextResponse.json(deadlines);
  } catch (error) {
    return handleRouteError(error, "GET /api/compliance/upcoming");
  }
}
