import { NextResponse, type NextRequest } from "next/server";
import { mockLegalChangesResponse } from "@/mocks/legal-data";
import { handleRouteError } from "@/lib/api-route-utils";

export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get("companyId");
  if (!raw) {
    return NextResponse.json({ message: "companyId required" }, { status: 400 });
  }

  const companyId = Number(raw);
  if (!Number.isFinite(companyId) || companyId <= 0) {
    return NextResponse.json({ message: "유효하지 않은 companyId" }, { status: 400 });
  }

  try {
    // TODO: Replace with apiClient.get<LegalChangesResponse>(`/api/legal-changes?companyId=${companyId}`)
    return NextResponse.json(mockLegalChangesResponse);
  } catch (error) {
    return handleRouteError(error, "GET /api/legal-changes");
  }
}
