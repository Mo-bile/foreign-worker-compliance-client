import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from "vitest";
import { NextRequest } from "next/server";
import { http, HttpResponse } from "msw";
import { server } from "@/mocks/server";
import { PATCH } from "@/app/api/compliance/[id]/complete/route";

const BACKEND = process.env.BACKEND_URL ?? "http://localhost:8080";

beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
  vi.clearAllMocks();
});
afterAll(() => server.close());

function makeRequest(body: unknown) {
  return new NextRequest(new URL("http://localhost/api/compliance/42/complete"), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("PATCH /api/compliance/[id]/complete", () => {
  it("BE_202_summary를_그대로_통과시킨다", async () => {
    server.use(
      http.patch(`${BACKEND}/api/compliance/:id/complete`, () =>
        HttpResponse.json(
          {
            completedDeadlineId: 42,
            createdDeadlines: [
              {
                id: 99,
                type: "EXIT_GUARANTEE_INSURANCE",
                dueDate: "2027-05-06",
                description: "출국만기보험",
              },
            ],
          },
          { status: 202 },
        ),
      ),
    );

    const res = await PATCH(makeRequest({ completedAt: "2026-05-06" }), {
      params: Promise.resolve({ id: "42" }),
    });

    expect(res.status).toBe(202);
    const json = await res.json();
    expect(json).toMatchObject({
      completedDeadlineId: 42,
      createdDeadlines: [{ id: 99, type: "EXIT_GUARANTEE_INSURANCE" }],
    });
  });

  it("BE_502_시_502를_그대로_반환한다", async () => {
    server.use(
      http.patch(`${BACKEND}/api/compliance/:id/complete`, () =>
        HttpResponse.json({ message: "BE error" }, { status: 502 }),
      ),
    );

    const res = await PATCH(makeRequest({ completedAt: "2026-05-06" }), {
      params: Promise.resolve({ id: "42" }),
    });

    expect(res.status).toBe(502);
  });
});
