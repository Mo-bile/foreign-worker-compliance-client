import { describe, it, expect } from "vitest";
import { GET } from "@/app/api/benchmarks/route";

function makeGetRequest(url: string) {
  const parsed = new URL(url);
  const request = new Request(url);
  Object.defineProperty(request, "nextUrl", { value: parsed });
  return request as unknown as Parameters<typeof GET>[0];
}

describe("GET /api/benchmarks", () => {
  it("유효한_companyId로_벤치마크를_반환한다", async () => {
    const response = await GET(makeGetRequest("http://localhost:3000/api/benchmarks?companyId=1"));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.score.total).toBe(73);
    expect(data.score.grade).toBe("B+");
  });

  it("companyId가_없으면_400을_반환한다", async () => {
    const response = await GET(makeGetRequest("http://localhost:3000/api/benchmarks"));
    expect(response.status).toBe(400);
  });

  it("companyId가_유효하지_않으면_400을_반환한다", async () => {
    const response = await GET(makeGetRequest("http://localhost:3000/api/benchmarks?companyId=abc"));
    expect(response.status).toBe(400);
  });

  it("companyId가_0이면_400을_반환한다", async () => {
    const response = await GET(makeGetRequest("http://localhost:3000/api/benchmarks?companyId=0"));
    expect(response.status).toBe(400);
  });
});
