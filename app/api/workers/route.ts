import { NextResponse, type NextRequest } from "next/server";
import { apiClient, ApiError } from "@/lib/api-client";
import type { WorkerResponse } from "@/types/api";

export async function GET() {
  try {
    const workers = await apiClient.get<WorkerResponse[]>("/api/workers");
    return NextResponse.json(workers);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
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
