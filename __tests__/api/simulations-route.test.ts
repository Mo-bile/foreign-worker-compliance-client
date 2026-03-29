import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import { server } from "@/mocks/server";
import { POST } from "@/app/api/simulations/route";

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("POST /api/simulations", () => {
  it("유효한_요청에_시뮬레이션_결과를_반환한다", async () => {
    const body = JSON.stringify({
      desiredWorkers: 3,
      preferredNationality: "VIETNAM",
      desiredTiming: "2026_H2",
      companyId: 1,
    });
    const request = new Request("http://localhost:3000/api/simulations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });

    const response = await POST(request as unknown as Parameters<typeof POST>[0]);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.verdict).toBeDefined();
    expect(data.analyses.length).toBeGreaterThan(0);
    expect(data.stats.allocation).toBeDefined();
    expect(data.stats.competition).toBeDefined();
    expect(data.stats.duration).toBeDefined();
  });

  it("companyId가_누락되면_400을_반환한다", async () => {
    const body = JSON.stringify({
      desiredWorkers: 3,
      desiredTiming: "2026_H2",
    });
    const request = new Request("http://localhost:3000/api/simulations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });

    const response = await POST(request as unknown as Parameters<typeof POST>[0]);
    expect(response.status).toBe(400);
  });

  it("desiredWorkers가_누락되면_400을_반환한다", async () => {
    const body = JSON.stringify({
      desiredTiming: "2026_H2",
      companyId: 1,
    });
    const request = new Request("http://localhost:3000/api/simulations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });

    const response = await POST(request as unknown as Parameters<typeof POST>[0]);
    expect(response.status).toBe(400);
  });

  it("잘못된_JSON_형식이면_400을_반환한다", async () => {
    const request = new Request("http://localhost:3000/api/simulations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not json",
    });

    const response = await POST(request as unknown as Parameters<typeof POST>[0]);
    expect(response.status).toBe(400);
  });
});
