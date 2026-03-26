import { describe, it, expect } from "vitest";
import { POST } from "@/app/api/simulations/route";

describe("POST /api/simulations", () => {
  it("유효한_요청에_시뮬레이션_결과를_반환한다", async () => {
    const body = JSON.stringify({
      desiredCount: 3,
      preferredNationality: "VIETNAM",
      preferredPeriod: "2026_H2",
    });
    const request = new Request("http://localhost:3000/api/simulations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });

    const response = await POST(request as unknown as Parameters<typeof POST>[0]);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.verdict).toBe("HIGH");
    expect(data.analyses.length).toBeGreaterThan(0);
  });

  it("desiredCount가_누락되면_400을_반환한다", async () => {
    const body = JSON.stringify({ preferredPeriod: "2026_H2" });
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
