import { NextResponse, type NextRequest } from "next/server";
import { apiClient } from "@/lib/api-client";
import { parseId } from "@/lib/parse-id";
import { handleRouteError } from "@/lib/api-route-utils";
import type { NotificationLog } from "@/types/notification";

export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get("companyId");
  if (raw === null) {
    return NextResponse.json({ message: "companyId가 필요합니다" }, { status: 400 });
  }

  const companyId = parseId(raw);
  if (companyId === null) {
    return NextResponse.json({ message: "잘못된 사업장 ID입니다" }, { status: 400 });
  }

  const limit = request.nextUrl.searchParams.get("limit") ?? "10";

  try {
    const logs = await apiClient.get<readonly NotificationLog[]>(
      `/api/notifications/logs?companyId=${companyId}&limit=${limit}`,
    );
    return NextResponse.json(logs);
  } catch (error) {
    return handleRouteError(error, "GET /api/notifications/logs");
  }
}
