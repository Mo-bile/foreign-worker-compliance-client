import { describe, it, expect, beforeAll, afterEach, afterAll } from "vitest";
import { server } from "@/mocks/server";
import { POST } from "@/app/api/simulations/route";
import { NextRequest } from "next/server";

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function makePostRequest(body: unknown) {
  return new NextRequest(new URL("http://localhost/api/simulations"), {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

const validBody = {
  companyId: 1,
  desiredWorkers: 3,
  desiredTiming: "2026_Q2",
  domesticInsuredCount: 33,
  appliedScoringCodes: ["DEPOPULATION_AREA"],
  deductionScore: 0,
};

describe("POST /api/simulations", () => {
  it("유효한_바디로_200과_변환된_응답을_반환한다", async () => {
    const req = makePostRequest(validBody);
    const res = await POST(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data).toHaveProperty("verdict");
    expect(data).toHaveProperty("scoring");
    expect(data).toHaveProperty("quota");
    expect(data).toHaveProperty("timeline");
  });

  it("companyId가_없으면_400을_반환한다", async () => {
    const { companyId: _omit, ...bodyWithoutCompanyId } = validBody;
    const req = makePostRequest(bodyWithoutCompanyId);
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("desiredWorkers가_없으면_400을_반환한다", async () => {
    const { desiredWorkers: _omit, ...bodyWithoutDesiredWorkers } = validBody;
    const req = makePostRequest(bodyWithoutDesiredWorkers);
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("domesticInsuredCount가_없으면_400을_반환한다", async () => {
    const { domesticInsuredCount: _omit, ...bodyWithoutDomesticInsuredCount } = validBody;
    const req = makePostRequest(bodyWithoutDomesticInsuredCount);
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("잘못된_JSON이면_400을_반환한다", async () => {
    const req = new NextRequest(new URL("http://localhost/api/simulations"), {
      method: "POST",
      body: "not json",
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});
