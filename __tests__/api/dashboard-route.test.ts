import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "@/mocks/server";
import { GET } from "@/app/api/dashboard/route";
import { NextRequest } from "next/server";
import type { DashboardResponse } from "@/types/dashboard";

const BACKEND = process.env.BACKEND_URL ?? "http://localhost:8080";

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function makeRequest(url: string) {
  return new NextRequest(new URL(url, "http://localhost:3000"));
}

describe("GET /api/dashboard", () => {
  it("companyId가_있으면_변환된_대시보드_데이터를_반환한다", async () => {
    const request = makeRequest("http://localhost:3000/api/dashboard?companyId=1");
    const response = await GET(request);
    expect(response.status).toBe(200);

    const data: DashboardResponse = await response.json();
    expect(data.stats.totalWorkers).toBe(12);
    expect(data.stats.insuranceRateChange).toBeNull();
    expect(data.alertGroups.length).toBeGreaterThan(0);
    expect(data.alertGroups[0].urgency).toBeDefined();
    expect(data.alertGroups[0].label).toBeDefined();
    expect(data.complianceScore.total).toBe(73);
    expect(data.insuranceSummary[0].label).toBeDefined();
    expect(data.timeline[0].urgency).toBeDefined();
  });

  it("companyId가_없으면_400을_반환한다", async () => {
    const request = makeRequest("http://localhost:3000/api/dashboard");
    const response = await GET(request);
    expect(response.status).toBe(400);
  });

  it("companyId가_유효하지_않으면_400을_반환한다", async () => {
    const request = makeRequest("http://localhost:3000/api/dashboard?companyId=abc");
    const response = await GET(request);
    expect(response.status).toBe(400);
  });

  it("BE가_500을_반환하면_500을_전달한다", async () => {
    server.use(
      http.get(`${BACKEND}/api/dashboard`, () =>
        HttpResponse.json({ message: "서버 오류" }, { status: 500 }),
      ),
    );
    const request = makeRequest("http://localhost:3000/api/dashboard?companyId=1");
    const response = await GET(request);
    expect(response.status).toBe(500);
  });

  it("BE_응답이_변환_불가하면_502를_반환한다", async () => {
    server.use(
      http.get(`${BACKEND}/api/dashboard`, () =>
        HttpResponse.json({ stats: null, alerts: null }),
      ),
    );
    const request = makeRequest("http://localhost:3000/api/dashboard?companyId=1");
    const response = await GET(request);
    expect(response.status).toBe(502);
  });
});
