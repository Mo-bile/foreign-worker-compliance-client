import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import { http, HttpResponse } from "msw";
import { NextRequest } from "next/server";
import { server } from "@/mocks/server";
import { POST } from "@/app/api/workers/korean-name/suggest/route";

const BACKEND = process.env.BACKEND_URL ?? "http://localhost:8080";

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function makeRequest(body: unknown) {
  return new NextRequest(new URL("http://localhost:3000/api/workers/korean-name/suggest"), {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

describe("POST /api/workers/korean-name/suggest", () => {
  it("유효한_요청을_BE로_전달하고_추천값을_반환한다", async () => {
    let received: unknown;
    server.use(
      http.post(`${BACKEND}/api/workers/korean-name/suggest`, async ({ request }) => {
        received = await request.json();
        return HttpResponse.json({ koreanName: "응우옌 반 안" }, { status: 202 });
      }),
    );

    const response = await POST(
      makeRequest({ name: "NGUYEN VAN AN", nationalityCode: "VIETNAM" }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ koreanName: "응우옌 반 안" });
    expect(received).toEqual({ name: "NGUYEN VAN AN", nationalityCode: "VIETNAM" });
  });

  it("name이_없으면_400을_반환한다", async () => {
    const response = await POST(makeRequest({ name: "", nationalityCode: "VIETNAM" }));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({ message: "이름을 입력해주세요" });
  });

  it("name이_공백뿐이면_BE를_호출하지_않고_400을_반환한다", async () => {
    let requestCount = 0;
    server.use(
      http.post(`${BACKEND}/api/workers/korean-name/suggest`, () => {
        requestCount += 1;
        return HttpResponse.json({ koreanName: "응우옌 반 안" }, { status: 202 });
      }),
    );

    const response = await POST(makeRequest({ name: "   ", nationalityCode: "VIETNAM" }));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({ message: "이름을 입력해주세요" });
    expect(requestCount).toBe(0);
  });

  it("nationalityCode가_없으면_400을_반환한다", async () => {
    const response = await POST(makeRequest({ name: "NGUYEN VAN AN" }));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({ message: "국적을 선택해주세요" });
  });

  it("BE_오류를_전달한다", async () => {
    server.use(
      http.post(`${BACKEND}/api/workers/korean-name/suggest`, () =>
        HttpResponse.json({ message: "AI 추천 실패" }, { status: 500 }),
      ),
    );

    const response = await POST(
      makeRequest({ name: "NGUYEN VAN AN", nationalityCode: "VIETNAM" }),
    );

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toMatchObject({ message: "AI 추천 실패" });
  });
});
