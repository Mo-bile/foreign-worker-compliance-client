import { NextResponse } from "next/server";
import { apiClient } from "@/lib/api-client";
import { parseId } from "@/lib/parse-id";
import { handleRouteError } from "@/lib/api-route-utils";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const legalChangeId = parseId(id);
  if (legalChangeId === null) {
    return NextResponse.json({ message: "잘못된 법령 변경 ID입니다" }, { status: 400 });
  }

  try {
    await apiClient.post<unknown>(`/api/legal-changes/${legalChangeId}/acknowledge`, {});
    return new NextResponse(null, { status: 201 });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return new NextResponse(null, { status: 201 });
    }
    return handleRouteError(error, `POST /api/legal-changes/${legalChangeId}/acknowledge`);
  }
}
