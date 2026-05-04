import { http, HttpResponse } from "msw";
import type { CompanyResponse } from "@/types/api";
import { mockWorkers, mockOverdueDeadlines, mockUpcomingDeadlines, mockCompanies } from "./data";
import { mockDashboardRaw } from "@/mocks/dashboard-data";
import { transformDashboardResponse } from "@/lib/transforms/dashboard-transform";
import { mockWithinQuotaResponse } from "@/mocks/simulator-data";
import { transformSimulationResult } from "@/lib/transforms/simulation-transform";
import { mockBenchmarkResponse, mockBenchmarkList } from "@/mocks/benchmark-data";
import { mockLegalChangesResponse, mockImpacts } from "./legal-data";
import { mockComplianceReport } from "./report-data";
import { mockMetadata, MOCK_SCORING_POLICIES } from "./metadata-data";
import { mockNotificationLogs, mockTriggerResponse } from "./notification-data";

const BACKEND = process.env.BACKEND_URL ?? "http://localhost:8080";

function addDays(isoDate: string, days: number): string {
  const d = new Date(isoDate);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

// ─── Shared handler callbacks ───────────────────────────

const getWorkerById: Parameters<typeof http.get>[1] = ({ params }) => {
  const worker = mockWorkers.find((w) => w.id === Number(params.id));
  if (!worker) {
    return HttpResponse.json(
      {
        status: 404,
        error: "Not Found",
        message: "근로자를 찾을 수 없습니다",
        alertMessage: "근로자를 찾을 수 없습니다",
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
  const body = (await request.json()) as Record<string, unknown>;
  return HttpResponse.json({
    ...mockWorkers[0],
    id: 3,
    name: body.name as string,
    koreanName: typeof body.koreanName === "string" ? body.koreanName : null,
  });
};

const postWorkerKoreanNameSuggest: Parameters<typeof http.post>[1] = async ({ request }) => {
  const body = (await request.json()) as { name?: string; nationalityCode?: string };
  if (!body.name || !body.nationalityCode) {
    return HttpResponse.json({ message: "이름과 국적을 입력해주세요" }, { status: 400 });
  }
  return HttpResponse.json({ koreanName: "응우옌 반 안" }, { status: 202 });
};

const putWorker: Parameters<typeof http.put>[1] = ({ params }) => {
  const worker = mockWorkers.find((w) => w.id === Number(params.id));
  if (!worker) {
    return HttpResponse.json(
      {
        status: 404,
        error: "Not Found",
        message: "근로자를 찾을 수 없습니다",
        alertMessage: "근로자를 찾을 수 없습니다",
        timestamp: new Date().toISOString(),
      },
      { status: 404 },
    );
  }
  return new HttpResponse(null, { status: 204 });
};

const postEndEmployment: Parameters<typeof http.post>[1] = async ({ params, request }) => {
  const id = Number(params.id);
  const worker = mockWorkers.find((w) => w.id === id);
  if (!worker) {
    return HttpResponse.json(
      {
        status: 404,
        message: `근로자를 찾을 수 없습니다: ${id}`,
        timestamp: new Date().toISOString(),
      },
      { status: 404 },
    );
  }
  if (worker.status === "ENDED") {
    return HttpResponse.json(
      {
        status: 400,
        message: "이미 고용종료가 확정된 워커입니다",
        timestamp: new Date().toISOString(),
      },
      { status: 400 },
    );
  }
  const body = (await request.json()) as { endedAt?: string };
  const endedAt = body.endedAt ?? new Date().toISOString().slice(0, 10);
  return HttpResponse.json(
    {
      workerId: id,
      endedAt,
      status: "ENDED",
      createdDeadlines: [
        {
          id: 9999,
          type: "CHANGE_REPORT",
          dueDate: addDays(endedAt, 15),
          description: "고용센터 신고 의무",
        },
      ],
      autoCompletedDeadlines: [],
      preservedDeadlineCount: 0,
    },
    { status: 202 },
  );
};

const postRestoreEmployment: Parameters<typeof http.post>[1] = ({ params }) => {
  const id = Number(params.id);
  const worker = mockWorkers.find((w) => w.id === id);
  if (!worker) {
    return HttpResponse.json(
      {
        status: 404,
        message: `근로자를 찾을 수 없습니다: ${id}`,
        timestamp: new Date().toISOString(),
      },
      { status: 404 },
    );
  }
  if (worker.status !== "ENDED") {
    return HttpResponse.json(
      {
        status: 400,
        message: "고용종료 상태가 아닙니다",
        timestamp: new Date().toISOString(),
      },
      { status: 400 },
    );
  }
  return HttpResponse.json(
    { workerId: id, status: "ACTIVE", removedChangeReportDeadlineIds: [9999] },
    { status: 202 },
  );
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
        alertMessage: "사업장을 찾을 수 없습니다",
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
        alertMessage: "사업장을 찾을 수 없습니다",
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

const patchComplianceComplete: Parameters<typeof http.patch>[1] = () =>
  new HttpResponse(null, { status: 204 });

const getMetadata: Parameters<typeof http.get>[1] = () => HttpResponse.json(mockMetadata);

const getDashboardBackend: Parameters<typeof http.get>[1] = () =>
  HttpResponse.json(mockDashboardRaw);

const getDashboardBff: Parameters<typeof http.get>[1] = () =>
  HttpResponse.json(transformDashboardResponse(mockDashboardRaw));

const postDashboardInsightBackend: Parameters<typeof http.post>[1] = () =>
  new HttpResponse(null, { status: 201, headers: { Location: "/api/dashboard?companyId=1" } });

const postDashboardInsightBff: Parameters<typeof http.post>[1] = () =>
  HttpResponse.json({ success: true }, { status: 201 });

const postSimulationBackend: Parameters<typeof http.post>[1] = () =>
  new HttpResponse(null, {
    status: 201,
    headers: { Location: `/api/simulations/${mockWithinQuotaResponse.id}` },
  });

const getSimulationBackend: Parameters<typeof http.get>[1] = () =>
  HttpResponse.json(mockWithinQuotaResponse);

const mockDeductionCodes = new Set(
  MOCK_SCORING_POLICIES.filter((p) => p.type === "DEDUCTION").map((p) => p.code),
);

const postSimulationBff: Parameters<typeof http.post>[1] = () =>
  HttpResponse.json(transformSimulationResult(mockWithinQuotaResponse, mockDeductionCodes));

const getBenchmarks: Parameters<typeof http.get>[1] = () => HttpResponse.json(mockBenchmarkList);

const getBenchmarkById: Parameters<typeof http.get>[1] = ({ params }) => {
  const id = Number(params.id);
  const found = mockBenchmarkList.find((b) => b.id === id);
  if (!found) return new HttpResponse(null, { status: 404 });
  return HttpResponse.json(found);
};

const postBenchmark: Parameters<typeof http.post>[1] = async ({ request }) => {
  const body = (await request.json()) as { companyId: number };
  const created = { ...mockBenchmarkResponse, id: Date.now(), companyId: body.companyId };
  return HttpResponse.json(created, {
    status: 201,
    headers: { Location: `/api/benchmarks/${created.id}` },
  });
};
const getLegalChanges: Parameters<typeof http.get>[1] = () =>
  HttpResponse.json(mockLegalChangesResponse);

const getLegalImpact: Parameters<typeof http.get>[1] = ({ params }) => {
  const impact = mockImpacts[Number(params.id)];
  if (!impact) return new HttpResponse(null, { status: 404 });
  return HttpResponse.json(impact);
};

const postAcknowledge: Parameters<typeof http.post>[1] = () =>
  new HttpResponse(null, { status: 201 });

const getReport: Parameters<typeof http.get>[1] = () => HttpResponse.json(mockComplianceReport);

// ─── Notifications ──────────────────────────────────────

const getNotificationLogs: Parameters<typeof http.get>[1] = ({ request }) => {
  const url = new URL(request.url);
  const limit = Number(url.searchParams.get("limit") ?? "10");
  return HttpResponse.json(mockNotificationLogs.slice(0, limit));
};

const postNotificationTrigger: Parameters<typeof http.post>[1] = () => {
  return HttpResponse.json(mockTriggerResponse);
};

// ─── Handler registration (BACKEND + jsdom paths) ───────

export const handlers = [
  // Workers
  http.get(`${BACKEND}/api/workers/:id`, getWorkerById),
  http.get(`${BACKEND}/api/workers`, getWorkers),
  http.post(`${BACKEND}/api/workers`, postWorker),
  http.post(`${BACKEND}/api/workers/korean-name/suggest`, postWorkerKoreanNameSuggest),
  http.put(`${BACKEND}/api/workers/:id`, putWorker),
  http.get("*/api/workers/:id", getWorkerById),
  http.get("*/api/workers", getWorkers),
  http.post("*/api/workers", postWorker),
  http.post("*/api/workers/korean-name/suggest", postWorkerKoreanNameSuggest),
  http.put("*/api/workers/:id", putWorker),
  http.post(`${BACKEND}/api/workers/:id/end-employment`, postEndEmployment),
  http.post(`${BACKEND}/api/workers/:id/restore-employment`, postRestoreEmployment),
  http.post("*/api/workers/:id/end-employment", postEndEmployment),
  http.post("*/api/workers/:id/restore-employment", postRestoreEmployment),

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
  http.patch(`${BACKEND}/api/compliance/:id/complete`, patchComplianceComplete),
  http.patch("*/api/compliance/:id/complete", patchComplianceComplete),

  // Metadata
  http.get(`${BACKEND}/api/metadata`, getMetadata),
  http.get("*/api/metadata", getMetadata),

  // Dashboard
  http.get(`${BACKEND}/api/dashboard`, getDashboardBackend),
  http.get("*/api/dashboard", getDashboardBff),
  http.post(`${BACKEND}/api/dashboard/insight`, postDashboardInsightBackend),
  http.post("*/api/dashboard/insight", postDashboardInsightBff),

  // Simulations
  http.post(`${BACKEND}/api/simulations`, postSimulationBackend),
  http.get(`${BACKEND}/api/simulations/:id`, getSimulationBackend),
  http.post("*/api/simulations", postSimulationBff),

  // Benchmarks
  http.get(`${BACKEND}/api/benchmarks/:id`, getBenchmarkById),
  http.get("*/api/benchmarks/:id", getBenchmarkById),
  http.get(`${BACKEND}/api/benchmarks`, getBenchmarks),
  http.get("*/api/benchmarks", getBenchmarks),
  http.post(`${BACKEND}/api/benchmarks`, postBenchmark),
  http.post("*/api/benchmarks", postBenchmark),
  // Legal Changes (impacts BEFORE legal-changes for correct matching)
  http.get(`${BACKEND}/api/legal-changes/:id/impacts`, getLegalImpact),
  http.get("*/api/legal-changes/:id/impacts", getLegalImpact),
  http.post(`${BACKEND}/api/legal-changes/:id/acknowledge`, postAcknowledge),
  http.post("*/api/legal-changes/:id/acknowledge", postAcknowledge),
  http.get(`${BACKEND}/api/legal-changes`, getLegalChanges),
  http.get("*/api/legal-changes", getLegalChanges),

  // Reports
  http.get(`${BACKEND}/api/reports`, getReport),
  http.get("*/api/reports", getReport),

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
        alertMessage: "not found",
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
        alertMessage: "server error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    ),
  ),

  // Notifications
  http.get(`${BACKEND}/api/notifications/logs`, getNotificationLogs),
  http.post(`${BACKEND}/api/notifications/trigger`, postNotificationTrigger),
  http.get("*/api/notifications/logs", getNotificationLogs),
  http.post("*/api/notifications/trigger", postNotificationTrigger),
];
