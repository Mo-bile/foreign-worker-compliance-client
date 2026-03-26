import { NextResponse, type NextRequest } from "next/server";
import { mockImpacts } from "@/mocks/legal-data";
import { handleRouteError } from "@/lib/api-route-utils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const raw = request.nextUrl.searchParams.get("companyId");
  if (!raw) {
    return NextResponse.json({ message: "companyId required" }, { status: 400 });
  }

  const companyId = Number(raw);
  if (!Number.isFinite(companyId) || companyId <= 0) {
    return NextResponse.json({ message: "유효하지 않은 companyId" }, { status: 400 });
  }

  try {
    const impact = mockImpacts[id];
    if (!impact) {
      return NextResponse.json({ message: "not found" }, { status: 404 });
    }
    // TODO: Replace with apiClient.get<LegalImpact>(`/api/legal-changes/${id}/impacts?companyId=${companyId}`)
    return NextResponse.json(impact);
  } catch (error) {
    return handleRouteError(error, `GET /api/legal-changes/${id}/impacts`);
  }
}
