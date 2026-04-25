import { NextResponse, type NextRequest } from "next/server";
import { apiClient } from "@/lib/api-client";
import { parseId } from "@/lib/parse-id";
import { handleRouteError } from "@/lib/api-route-utils";
import type { LegalChangesResponse } from "@/types/legal";

export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get("companyId");
  if (raw === null) {
    return NextResponse.json({ message: "companyId가 필요합니다" }, { status: 400 });
  }

  const companyId = parseId(raw);
  if (companyId === null) {
    return NextResponse.json({ message: "잘못된 사업장 ID입니다" }, { status: 400 });
  }

  try {
    const legalChanges = await apiClient.get<LegalChangesResponse>(
      `/api/legal-changes?companyId=${companyId}`,
    );
    return NextResponse.json(legalChanges);
  } catch (error) {
    return handleRouteError(error, "GET /api/legal-changes");
  }
}
