import { NextResponse, type NextRequest } from "next/server";
import { apiClient } from "@/lib/api-client";
import { handleRouteError } from "@/lib/api-route-utils";

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    await apiClient.patch(`/api/compliance/${id}/complete`);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleRouteError(error, `PATCH /api/compliance/${id}/complete`);
  }
}
