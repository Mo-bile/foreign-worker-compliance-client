import { describe, it, expect } from "vitest";
import { GET } from "@/app/api/benchmarks/route";

describe("GET /api/benchmarks", () => {
  it("유효한_companyId로_벤치마크를_반환한다", async () => {
    const request = new Request("http://localhost:3000/api/benchmarks?companyId=1");
    const response = await GET(request as unknown as Parameters<typeof GET>[0]);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.score.total).toBe(73);
    expect(data.score.grade).toBe("B+");
  });

  it("companyId가_없으면_400을_반환한다", async () => {
    const request = new Request("http://localhost:3000/api/benchmarks");
    const response = await GET(request as unknown as Parameters<typeof GET>[0]);
    expect(response.status).toBe(400);
  });

  it("companyId가_유효하지_않으면_400을_반환한다", async () => {
    const request = new Request("http://localhost:3000/api/benchmarks?companyId=abc");
    const response = await GET(request as unknown as Parameters<typeof GET>[0]);
    expect(response.status).toBe(400);
  });

  it("companyId가_0이면_400을_반환한다", async () => {
    const request = new Request("http://localhost:3000/api/benchmarks?companyId=0");
    const response = await GET(request as unknown as Parameters<typeof GET>[0]);
    expect(response.status).toBe(400);
  });
});
