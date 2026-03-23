import { NextResponse, type NextRequest } from "next/server";
import { apiClient } from "@/lib/api-client";
import { parseId } from "@/lib/parse-id";
import type { WorkerResponse } from "@/types/api";
import { handleRouteError, parseRequestBody } from "@/lib/api-route-utils";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const raw = searchParams.get("companyId");
    let path = "/api/workers";
    if (raw !== null) {
      const companyId = parseId(raw);
      if (companyId === null) {
        return NextResponse.json({ message: "잘못된 사업장 ID입니다" }, { status: 400 });
      }
      path = `/api/workers?companyId=${companyId}`;
    }
    const workers = await apiClient.get<WorkerResponse[]>(path);
    return NextResponse.json(workers);
  } catch (error) {
    return handleRouteError(error, "GET /api/workers");
  }
}

export async function POST(request: NextRequest) {
  const bodyResult = await parseRequestBody(request);
  if (bodyResult instanceof NextResponse) return bodyResult;

  try {
    const worker = await apiClient.post<WorkerResponse>("/api/workers", bodyResult.data);
    return NextResponse.json(worker);
  } catch (error) {
    return handleRouteError(error, "POST /api/workers");
  }
}
