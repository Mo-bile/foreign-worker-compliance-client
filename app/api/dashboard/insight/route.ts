import { NextResponse, type NextRequest } from "next/server";
import { apiClient } from "@/lib/api-client";
import { parseId } from "@/lib/parse-id";
import { handleRouteError } from "@/lib/api-route-utils";

export async function POST(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get("companyId");
  if (raw === null) {
    return NextResponse.json({ message: "companyId가 필요합니다" }, { status: 400 });
  }

  const companyId = parseId(raw);
  if (companyId === null) {
    return NextResponse.json({ message: "잘못된 사업장 ID입니다" }, { status: 400 });
  }

  try {
    await apiClient.postTrigger(`/api/dashboard/insight?companyId=${companyId}`);
  } catch (error) {
    return handleRouteError(error, "POST /api/dashboard/insight");
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
