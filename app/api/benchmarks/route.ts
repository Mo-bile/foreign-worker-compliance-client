import { NextResponse, type NextRequest } from "next/server";
import { mockBenchmarkResponse } from "@/mocks/benchmark-data";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const raw = url.searchParams.get("companyId");
  if (!raw) {
    return NextResponse.json({ message: "companyId required" }, { status: 400 });
  }

  const companyId = Number(raw);
  if (!Number.isFinite(companyId) || companyId <= 0) {
    return NextResponse.json({ message: "유효하지 않은 companyId" }, { status: 400 });
  }

  // Mock phase: return hardcoded data directly
  return NextResponse.json(mockBenchmarkResponse);
}
