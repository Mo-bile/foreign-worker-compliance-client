import { describe, it, expect } from "vitest";
import { GET } from "@/app/api/legal-changes/route";

function makeGetRequest(url: string) {
  const parsed = new URL(url);
  const request = new Request(url);
  Object.defineProperty(request, "nextUrl", { value: parsed });
  return request as unknown as Parameters<typeof GET>[0];
}

describe("GET /api/legal-changes", () => {
  it("companyId가_없으면_400을_반환한다", async () => {
    const response = await GET(makeGetRequest("http://localhost:3000/api/legal-changes"));
    expect(response.status).toBe(400);
  });

  it("companyId가_유효하지_않으면_400을_반환한다", async () => {
    const response = await GET(
      makeGetRequest("http://localhost:3000/api/legal-changes?companyId=abc"),
    );
    expect(response.status).toBe(400);
  });
});
