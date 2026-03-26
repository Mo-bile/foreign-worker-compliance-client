import { describe, it, expect } from "vitest";
import { GET } from "@/app/api/reports/route";

function makeGetRequest(url: string) {
  const parsed = new URL(url);
  const request = new Request(url);
  Object.defineProperty(request, "nextUrl", { value: parsed });
  return request as unknown as Parameters<typeof GET>[0];
}

describe("GET /api/reports", () => {
  it("유효한_companyId로_리포트를_반환한다", async () => {
    const response = await GET(makeGetRequest("http://localhost:3000/api/reports?companyId=1"));
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.score).toBe(73);
    expect(data.completed).toHaveLength(5);
  });

  it("companyId가_없으면_400을_반환한다", async () => {
    const response = await GET(makeGetRequest("http://localhost:3000/api/reports"));
    expect(response.status).toBe(400);
  });

  it("companyId가_0이면_400을_반환한다", async () => {
    const response = await GET(makeGetRequest("http://localhost:3000/api/reports?companyId=0"));
    expect(response.status).toBe(400);
  });
});
