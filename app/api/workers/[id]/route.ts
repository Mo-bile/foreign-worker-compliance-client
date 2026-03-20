import { NextResponse } from "next/server";
import { apiClient, ApiError } from "@/lib/api-client";
import type { WorkerResponse } from "@/types/api";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const worker = await apiClient.get<WorkerResponse>(`/api/workers/${id}`);
    return NextResponse.json(worker);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    return NextResponse.json({ message: "서버 오류가 발생했습니다" }, { status: 500 });
  }
}
