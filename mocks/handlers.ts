import { http, HttpResponse } from "msw";
import type { CompanyResponse } from "@/types/api";
import { mockWorkers, mockOverdueDeadlines, mockUpcomingDeadlines, mockCompanies } from "./data";
import { mockDashboard } from "@/mocks/dashboard-data";

const BACKEND = process.env.BACKEND_URL ?? "http://localhost:8080";

// ─── Shared handler callbacks ───────────────────────────

const getWorkerById: Parameters<typeof http.get>[1] = ({ params }) => {
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
};

const getWorkers: Parameters<typeof http.get>[1] = ({ request }) => {
  const url = new URL(request.url);
  const companyId = url.searchParams.get("companyId");
  if (companyId) {
    return HttpResponse.json(mockWorkers.filter((w) => w.id % 3 === Number(companyId) % 3));
  }
  return HttpResponse.json(mockWorkers);
};

const postWorker: Parameters<typeof http.post>[1] = async ({ request }) => {
  const body = await request.json();
  return HttpResponse.json({
    ...mockWorkers[0],
    id: 3,
    name: (body as Record<string, unknown>).name as string,
  });
};

const getCompanies: Parameters<typeof http.get>[1] = () => HttpResponse.json(mockCompanies);

const getCompanyById: Parameters<typeof http.get>[1] = ({ params }) => {
  const company = mockCompanies.find((c) => c.id === Number(params.id));
  if (!company) {
    return HttpResponse.json(
      {
        status: 404,
        error: "Not Found",
        message: "사업장을 찾을 수 없습니다",
        timestamp: new Date().toISOString(),
      },
      { status: 404 },
    );
  }
  return HttpResponse.json(company);
};

const postCompany: Parameters<typeof http.post>[1] = async ({ request }) => {
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
};

const putCompany: Parameters<typeof http.put>[1] = async ({ params, request }) => {
  const company = mockCompanies.find((c) => c.id === Number(params.id));
  if (!company) {
    return HttpResponse.json(
      {
        status: 404,
        error: "Not Found",
        message: "사업장을 찾을 수 없습니다",
        timestamp: new Date().toISOString(),
      },
      { status: 404 },
    );
  }
  const body = (await request.json()) as Record<string, unknown>;
  return HttpResponse.json({ ...company, ...body, updatedAt: new Date().toISOString() });
};

const getComplianceOverdue: Parameters<typeof http.get>[1] = () =>
  HttpResponse.json(mockOverdueDeadlines);

const getComplianceUpcoming: Parameters<typeof http.get>[1] = () =>
  HttpResponse.json(mockUpcomingDeadlines);

const getComplianceByWorker: Parameters<typeof http.get>[1] = ({ params }) => {
  const deadlines = [...mockOverdueDeadlines, ...mockUpcomingDeadlines].filter(
    (d) => d.workerId === Number(params.id),
  );
  return HttpResponse.json(deadlines);
};

const getDashboard: Parameters<typeof http.get>[1] = () => HttpResponse.json(mockDashboard);

// ─── Handler registration (BACKEND + jsdom paths) ───────

export const handlers = [
  // Workers
  http.get(`${BACKEND}/api/workers/:id`, getWorkerById),
  http.get(`${BACKEND}/api/workers`, getWorkers),
  http.post(`${BACKEND}/api/workers`, postWorker),
  http.get("*/api/workers/:id", getWorkerById),
  http.get("*/api/workers", getWorkers),

  // Companies
  http.get(`${BACKEND}/api/companies/:id`, getCompanyById),
  http.get(`${BACKEND}/api/companies`, getCompanies),
  http.post(`${BACKEND}/api/companies`, postCompany),
  http.put(`${BACKEND}/api/companies/:id`, putCompany),
  http.get("*/api/companies/:id", getCompanyById),
  http.get("*/api/companies", getCompanies),
  http.post("*/api/companies", postCompany),
  http.put("*/api/companies/:id", putCompany),

  // Compliance
  http.get(`${BACKEND}/api/compliance/overdue`, getComplianceOverdue),
  http.get(`${BACKEND}/api/compliance/upcoming`, getComplianceUpcoming),
  http.get(`${BACKEND}/api/compliance/worker/:id`, getComplianceByWorker),
  http.get("*/api/compliance/worker/:id", getComplianceByWorker),
  http.get("*/api/compliance/overdue", getComplianceOverdue),
  http.get("*/api/compliance/upcoming", getComplianceUpcoming),

  // Dashboard
  http.get(`${BACKEND}/api/dashboard`, getDashboard),
  http.get("*/api/dashboard", getDashboard),

  // Test endpoints (api-client tests only — BACKEND paths)
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
