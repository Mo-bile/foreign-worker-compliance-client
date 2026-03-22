import { NextResponse, type NextRequest } from "next/server";
import { apiClient, ApiError } from "@/lib/api-client";
import { parseId } from "@/lib/parse-id";
import type { WorkerResponse } from "@/types/api";

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
    if (error instanceof ApiError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    console.error("[GET /api/workers] Unexpected error:", error);
    return NextResponse.json({ message: "서버 오류가 발생했습니다" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const worker = await apiClient.post<WorkerResponse>("/api/workers", body);
    return NextResponse.json(worker);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    return NextResponse.json({ message: "서버 오류가 발생했습니다" }, { status: 500 });
  }
}
