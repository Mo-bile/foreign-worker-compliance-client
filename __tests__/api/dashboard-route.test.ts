import { describe, it, expect } from "vitest";
import { GET } from "@/app/api/dashboard/route";
import type { DashboardResponse } from "@/types/dashboard";

describe("GET /api/dashboard", () => {
  it("대시보드_데이터를_반환한다", async () => {
    const request = new Request("http://localhost:3000/api/dashboard?companyId=1");
    const response = await GET(request as unknown as Parameters<typeof GET>[0]);
    expect(response.status).toBe(200);

    const data: DashboardResponse = await response.json();
    expect(data.stats.totalWorkers).toBe(12);
    expect(data.alerts).toHaveLength(3);
    expect(data.complianceScore.total).toBe(73);
  });
});
