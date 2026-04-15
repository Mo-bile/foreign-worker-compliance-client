import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "@/mocks/server";
import { POST } from "@/app/api/dashboard/insight/route";
import { NextRequest } from "next/server";

const BACKEND = process.env.BACKEND_URL ?? "http://localhost:8080";

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function makeRequest(url: string) {
  return new NextRequest(new URL(url, "http://localhost:3000"), { method: "POST" });
}

describe("POST /api/dashboard/insight", () => {
  it("companyId가_있으면_201을_반환한다", async () => {
    server.use(
      http.post(`${BACKEND}/api/dashboard/insight`, () =>
        HttpResponse.json({}, { status: 201 }),
      ),
    );

    const request = makeRequest("http://localhost:3000/api/dashboard/insight?companyId=1");
    const response = await POST(request);
    expect(response.status).toBe(201);
    const body = await response.json();
    expect(body.success).toBe(true);
  });

  it("companyId가_없으면_400을_반환한다", async () => {
    const request = makeRequest("http://localhost:3000/api/dashboard/insight");
    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it("companyId가_유효하지_않으면_400을_반환한다", async () => {
    const request = makeRequest("http://localhost:3000/api/dashboard/insight?companyId=abc");
    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it("BE가_500을_반환하면_에러를_전달한다", async () => {
    server.use(
      http.post(`${BACKEND}/api/dashboard/insight`, () =>
        HttpResponse.json({ message: "LLM 호출 실패" }, { status: 500 }),
      ),
    );

    const request = makeRequest("http://localhost:3000/api/dashboard/insight?companyId=1");
    const response = await POST(request);
    expect(response.status).toBe(500);
  });

  it("BE가_404를_반환하면_404를_전달한다", async () => {
    server.use(
      http.post(`${BACKEND}/api/dashboard/insight`, () =>
        HttpResponse.json({ message: "사업장을 찾을 수 없습니다" }, { status: 404 }),
      ),
    );

    const request = makeRequest("http://localhost:3000/api/dashboard/insight?companyId=999");
    const response = await POST(request);
    expect(response.status).toBe(404);
  });
});
