import { NextResponse } from "next/server";
import { apiClient } from "@/lib/api-client";
import type { MetadataResponse } from "@/types/metadata";
import { handleRouteError } from "@/lib/api-route-utils";

export async function GET() {
  try {
    const metadata = await apiClient.get<MetadataResponse>("/api/metadata");
    return NextResponse.json(metadata);
  } catch (error) {
    return handleRouteError(error, "GET /api/metadata");
  }
}
