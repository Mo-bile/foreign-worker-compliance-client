import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import { server } from "@/mocks/server";
import { GET, POST } from "@/app/api/companies/route";
import { GET as GET_BY_ID, PUT } from "@/app/api/companies/[id]/route";
import { NextRequest } from "next/server";

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function makeRequest(url: string, init?: { method?: string; body?: string; headers?: Record<string, string> }) {
  return new NextRequest(new URL(url, "http://localhost:3000"), init);
}

describe("GET /api/companies", () => {
  it("사업장_목록을_반환한다", async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
  });
});

describe("POST /api/companies", () => {
  it("유효한_데이터로_사업장을_생성한다", async () => {
    const req = makeRequest("http://localhost:3000/api/companies", {
      method: "POST",
      body: JSON.stringify({
        name: "테스트 회사",
        businessNumber: "111-22-33333",
        region: "SEOUL",
        industryCategory: "MANUFACTURING",
        employeeCount: 50,
        foreignWorkerCount: 10,
        address: "서울시 강남구",
        contactPhone: "02-1234-5678",
      }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(201);
  });

  it("잘못된_JSON이면_400을_반환한다", async () => {
    const req = makeRequest("http://localhost:3000/api/companies", {
      method: "POST",
      body: "not json",
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.message).toBe("잘못된 요청 형식입니다");
  });

  it("필수_필드_누락_시_400을_반환한다", async () => {
    const req = makeRequest("http://localhost:3000/api/companies", {
      method: "POST",
      body: JSON.stringify({ name: "" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("foreignWorkerCount가_employeeCount보다_크면_400을_반환한다", async () => {
    const req = makeRequest("http://localhost:3000/api/companies", {
      method: "POST",
      body: JSON.stringify({
        name: "테스트",
        businessNumber: "111-22-33333",
        region: "SEOUL",
        industryCategory: "MANUFACTURING",
        employeeCount: 10,
        foreignWorkerCount: 20,
        address: "주소",
        contactPhone: "02-1234-5678",
      }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.message).toContain("초과");
  });
});

describe("GET /api/companies/:id", () => {
  it("유효한_id로_사업장을_조회한다", async () => {
    const res = await GET_BY_ID(new Request("http://localhost:3000/api/companies/1"), {
      params: Promise.resolve({ id: "1" }),
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.id).toBe(1);
  });

  it("비숫자_id이면_400을_반환한다", async () => {
    const res = await GET_BY_ID(new Request("http://localhost:3000/api/companies/abc"), {
      params: Promise.resolve({ id: "abc" }),
    });
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.message).toBe("잘못된 사업장 ID입니다");
  });

  it("0_이하의_id이면_400을_반환한다", async () => {
    const res = await GET_BY_ID(new Request("http://localhost:3000/api/companies/0"), {
      params: Promise.resolve({ id: "0" }),
    });
    expect(res.status).toBe(400);
  });

  it("소수점_id이면_400을_반환한다", async () => {
    const res = await GET_BY_ID(new Request("http://localhost:3000/api/companies/1.5"), {
      params: Promise.resolve({ id: "1.5" }),
    });
    expect(res.status).toBe(400);
  });

  it("존재하지_않는_id이면_404를_반환한다", async () => {
    const res = await GET_BY_ID(new Request("http://localhost:3000/api/companies/999"), {
      params: Promise.resolve({ id: "999" }),
    });
    expect(res.status).toBe(404);
  });
});

describe("PUT /api/companies/:id", () => {
  it("유효한_데이터로_사업장을_수정한다", async () => {
    const req = makeRequest("http://localhost:3000/api/companies/1", {
      method: "PUT",
      body: JSON.stringify({
        name: "수정된 회사",
        region: "BUSAN",
        industryCategory: "CONSTRUCTION",
        employeeCount: 60,
        foreignWorkerCount: 15,
        address: "부산시",
        contactPhone: "051-1234-5678",
      }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await PUT(req, { params: Promise.resolve({ id: "1" }) });
    expect(res.status).toBe(200);
  });

  it("잘못된_id이면_400을_반환한다", async () => {
    const req = makeRequest("http://localhost:3000/api/companies/-1", {
      method: "PUT",
      body: JSON.stringify({ name: "테스트" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await PUT(req, { params: Promise.resolve({ id: "-1" }) });
    expect(res.status).toBe(400);
  });

  it("잘못된_JSON이면_400을_반환한다", async () => {
    const req = makeRequest("http://localhost:3000/api/companies/1", {
      method: "PUT",
      body: "not json",
      headers: { "Content-Type": "application/json" },
    });
    const res = await PUT(req, { params: Promise.resolve({ id: "1" }) });
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.message).toBe("잘못된 요청 형식입니다");
  });
});
