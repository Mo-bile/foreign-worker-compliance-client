import { describe, it, expect } from "vitest";
import { GET } from "@/app/api/legal-changes/[id]/impacts/route";

function makeGetRequest(url: string) {
  const parsed = new URL(url);
  const request = new Request(url);
  Object.defineProperty(request, "nextUrl", { value: parsed });
  return request as unknown as Parameters<typeof GET>[0];
}

describe("GET /api/legal-changes/[id]/impacts", () => {
  it("유효한_id로_영향분석을_반환한다", async () => {
    const response = await GET(
      makeGetRequest("http://localhost:3000/api/legal-changes/lc-1/impacts?companyId=1"),
      { params: Promise.resolve({ id: "lc-1" }) },
    );
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.changeId).toBe("lc-1");
    expect(data.impacts.length).toBeGreaterThan(0);
  });

  it("존재하지_않는_id면_404를_반환한다", async () => {
    const response = await GET(
      makeGetRequest("http://localhost:3000/api/legal-changes/nonexistent/impacts?companyId=1"),
      { params: Promise.resolve({ id: "nonexistent" }) },
    );
    expect(response.status).toBe(404);
  });

  it("companyId가_없으면_400을_반환한다", async () => {
    const response = await GET(
      makeGetRequest("http://localhost:3000/api/legal-changes/lc-1/impacts"),
      { params: Promise.resolve({ id: "lc-1" }) },
    );
    expect(response.status).toBe(400);
  });
});
