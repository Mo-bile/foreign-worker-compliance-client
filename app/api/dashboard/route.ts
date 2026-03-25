import { NextResponse, type NextRequest } from "next/server";
import { mockDashboard } from "@/mocks/dashboard-data";
import { handleRouteError } from "@/lib/api-route-utils";

export async function GET(request: NextRequest) {
  try {
    // TODO: Replace with actual backend call when BE is ready
    // const companyId = request.nextUrl.searchParams.get("companyId");
    // const data = await apiClient.get<DashboardResponse>(
    //   `/api/companies/${companyId}/dashboard`,
    // );
    return NextResponse.json(mockDashboard);
  } catch (error) {
    return handleRouteError(error, "GET /api/dashboard");
  }
}
