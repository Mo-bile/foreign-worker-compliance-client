import { http, HttpResponse } from "msw";
import type { CompanyResponse } from "@/types/api";
import { mockWorkers, mockOverdueDeadlines, mockUpcomingDeadlines, mockCompanies } from "./data";

const BACKEND = process.env.BACKEND_URL ?? "http://localhost:8080";

export const handlers = [
  // ─── Worker handlers (BACKEND) ────────────────────────
  http.get(`${BACKEND}/api/workers/:id`, ({ params }) => {
    const worker = mockWorkers.find((w) => w.id === Number(params.id));
    if (!worker) {
      return HttpResponse.json(
        {
          status: 404,
          error: "Not Found",
          message: "근로자를 찾을 수 없습니다",
          timestamp: new Date().toISOString(),
        },
        { status: 404 },
      );
    }
    return HttpResponse.json(worker);
  }),

  http.get(`${BACKEND}/api/workers`, ({ request }) => {
    const url = new URL(request.url);
    const companyId = url.searchParams.get("companyId");
    if (companyId) {
      return HttpResponse.json(mockWorkers.filter((w) => w.id % 3 === Number(companyId) % 3));
    }
    return HttpResponse.json(mockWorkers);
  }),

  // ─── Worker handlers (relative paths for jsdom) ────────
  http.get("*/api/workers/:id", ({ params }) => {
    const worker = mockWorkers.find((w) => w.id === Number(params.id));
    if (!worker) {
      return HttpResponse.json(
        {
          status: 404,
          error: "Not Found",
          message: "근로자를 찾을 수 없습니다",
          timestamp: new Date().toISOString(),
        },
        { status: 404 },
      );
    }
    return HttpResponse.json(worker);
  }),

  http.get("*/api/workers", ({ request }) => {
    const url = new URL(request.url);
    const companyId = url.searchParams.get("companyId");
    if (companyId) {
      return HttpResponse.json(mockWorkers.filter((w) => w.id % 3 === Number(companyId) % 3));
    }
    return HttpResponse.json(mockWorkers);
  }),

  http.post(`${BACKEND}/api/workers`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      ...mockWorkers[0],
      id: 3,
      name: (body as Record<string, unknown>).name as string,
    });
  }),

  // ─── Company handlers (BACKEND) ──────────────────────
  http.get(`${BACKEND}/api/companies`, () => HttpResponse.json(mockCompanies)),
  http.get(`${BACKEND}/api/companies/:id`, ({ params }) => {
    const company = mockCompanies.find((c) => c.id === Number(params.id));
    if (!company) {
      return HttpResponse.json(
        { status: 404, error: "Not Found", message: "사업장을 찾을 수 없습니다", timestamp: new Date().toISOString() },
        { status: 404 },
      );
    }
    return HttpResponse.json(company);
  }),
  http.post(`${BACKEND}/api/companies`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const newCompany: CompanyResponse = {
      ...mockCompanies[0],
      id: 99,
      name: body.name as string,
      businessNumber: body.businessNumber as string,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return HttpResponse.json(newCompany, { status: 201 });
  }),
  http.put(`${BACKEND}/api/companies/:id`, async ({ params, request }) => {
    const company = mockCompanies.find((c) => c.id === Number(params.id));
    if (!company) {
      return HttpResponse.json(
        { status: 404, error: "Not Found", message: "사업장을 찾을 수 없습니다", timestamp: new Date().toISOString() },
        { status: 404 },
      );
    }
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({ ...company, ...body, updatedAt: new Date().toISOString() });
  }),

  // ─── Company handlers (relative paths for jsdom) ──────
  http.get("*/api/companies/:id", ({ params }) => {
    const company = mockCompanies.find((c) => c.id === Number(params.id));
    if (!company) {
      return HttpResponse.json(
        { status: 404, error: "Not Found", message: "사업장을 찾을 수 없습니다", timestamp: new Date().toISOString() },
        { status: 404 },
      );
    }
    return HttpResponse.json(company);
  }),
  http.get("*/api/companies", () => HttpResponse.json(mockCompanies)),
  http.post("*/api/companies", async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const newCompany: CompanyResponse = {
      ...mockCompanies[0],
      id: 99,
      name: body.name as string,
      businessNumber: body.businessNumber as string,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return HttpResponse.json(newCompany, { status: 201 });
  }),
  http.put("*/api/companies/:id", async ({ params, request }) => {
    const company = mockCompanies.find((c) => c.id === Number(params.id));
    if (!company) {
      return HttpResponse.json(
        { status: 404, error: "Not Found", message: "사업장을 찾을 수 없습니다", timestamp: new Date().toISOString() },
        { status: 404 },
      );
    }
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({ ...company, ...body, updatedAt: new Date().toISOString() });
  }),

  // ─── Compliance handlers ───────────────────────────────
  http.get(`${BACKEND}/api/compliance/overdue`, () => HttpResponse.json(mockOverdueDeadlines)),
  http.get(`${BACKEND}/api/compliance/upcoming`, () => HttpResponse.json(mockUpcomingDeadlines)),
  // Next.js Route Handler relative paths (used by React Query hooks in jsdom tests)
  http.get("*/api/compliance/worker/:id", ({ params }) => {
    const deadlines = [...mockOverdueDeadlines, ...mockUpcomingDeadlines].filter(
      (d) => d.workerId === Number(params.id),
    );
    return HttpResponse.json(deadlines);
  }),
  http.get("*/api/compliance/overdue", () => HttpResponse.json(mockOverdueDeadlines)),
  http.get("*/api/compliance/upcoming", () => HttpResponse.json(mockUpcomingDeadlines)),

  http.get(`${BACKEND}/api/compliance/worker/:id`, ({ params }) => {
    const deadlines = [...mockOverdueDeadlines, ...mockUpcomingDeadlines].filter(
      (d) => d.workerId === Number(params.id),
    );
    return HttpResponse.json(deadlines);
  }),

  // ─── Test endpoints (for api-client tests) ────────────
  http.get(`${BACKEND}/test`, () => HttpResponse.json({ message: "ok" })),
  http.post(`${BACKEND}/test`, () => HttpResponse.json({ id: 1 })),
  http.put(`${BACKEND}/test/put`, () => HttpResponse.json({ id: 1 })),
  http.get(`${BACKEND}/test/404`, () =>
    HttpResponse.json(
      {
        status: 404,
        error: "Not Found",
        message: "not found",
        timestamp: new Date().toISOString(),
      },
      { status: 404 },
    ),
  ),
  http.get(`${BACKEND}/test/500`, () =>
    HttpResponse.json(
      {
        status: 500,
        error: "Internal Server Error",
        message: "server error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    ),
  ),
];
