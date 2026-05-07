import { http, HttpResponse } from "msw";
import type { CompanyResponse, ComplianceDeadlineResponse, WorkerResponse } from "@/types/api";
import {
  mockWorkers,
  mockOverdueDeadlines,
  mockUpcomingDeadlines,
  mockCompletedDeadlines,
  mockCompanies,
} from "./data";
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
const REGISTERED_WORKER_ID = 9_999;
const mockRegisteredWorker: WorkerResponse = {
  ...mockWorkers[0],
  id: REGISTERED_WORKER_ID,
  name: "Nguyen Van Test",
  koreanName: null,
  nationality: "VIETNAM",
  visaType: "E9",
  visaExpiryDate: "2027-12-31",
  dateOfBirth: "1990-01-01",
  contractStartDate: "2025-02-01",
  contractEndDate: null,
  contactPhone: null,
  contactEmail: null,
  jobPosition: null,
  passportNumber: null,
  entryDate: "2025-01-15",
  registrationNumber: null,
  companyId: 1,
};
const mockInsuranceNextCycleDeadline: ComplianceDeadlineResponse = {
  id: 10_006,
  workerId: 1,
  workerName: "Nguyen Van A",
  deadlineType: "EXIT_GUARANTEE_INSURANCE",
  dueDate: "2027-05-06",
  status: "PENDING",
  description: "출국만기보험 (다음 cycle)",
};
const mockHistoryCompletedDeadline: ComplianceDeadlineResponse = {
  id: 10_007,
  workerId: 1,
  workerName: "Nguyen Van A",
  deadlineType: "WAGE_GUARANTEE_INSURANCE",
  dueDate: "2026-02-20",
  status: "COMPLETED",
  description: "임금체불보증보험",
  completedAt: "2026-05-06",
  renewedUntil: "2027-05-06",
  referenceNumber: "HISTORY-E2E",
  evidenceUrl: null,
  note: null,
};

function addDays(isoDate: string, days: number): string {
  const d = new Date(isoDate);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function normalizeOptionalDate(value: unknown): string | null {
  return typeof value === "string" && value.trim() !== "" ? value : null;
}

// ─── Shared handler callbacks ───────────────────────────

const getWorkerById: Parameters<typeof http.get>[1] = ({ params }) => {
  const worker =
    mockWorkers.find((w) => w.id === Number(params.id)) ??
    (Number(params.id) === REGISTERED_WORKER_ID ? mockRegisteredWorker : undefined);
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
    return HttpResponse.json(mockWorkers);
  }
  return HttpResponse.json(mockWorkers);
};

const postWorker: Parameters<typeof http.post>[1] = async ({ request }) => {
  const body = (await request.json()) as Record<string, unknown>;
  const newWorker: WorkerResponse = {
    ...mockWorkers[0],
    id: REGISTERED_WORKER_ID,
    name: body.name as string,
    koreanName: typeof body.koreanName === "string" ? body.koreanName : null,
    nationality: body.nationality as WorkerResponse["nationality"],
    visaType: body.visaType as WorkerResponse["visaType"],
    visaExpiryDate: body.visaExpiryDate as string,
    dateOfBirth: body.dateOfBirth as string,
    contractStartDate: body.contractStartDate as string,
    contractEndDate: typeof body.contractEndDate === "string" ? body.contractEndDate : null,
    contactPhone: typeof body.contactPhone === "string" ? body.contactPhone : null,
    contactEmail: typeof body.contactEmail === "string" ? body.contactEmail : null,
    jobPosition: typeof body.jobPosition === "string" ? body.jobPosition : null,
    passportNumber: typeof body.passportNumber === "string" ? body.passportNumber : null,
    entryDate: typeof body.entryDate === "string" ? body.entryDate : null,
    registrationNumber: typeof body.registrationNumber === "string" ? body.registrationNumber : null,
    companyId: Number(body.companyId),
  };
  return HttpResponse.json(newWorker);
};

const postWorkerKoreanNameSuggest: Parameters<typeof http.post>[1] = async ({ request }) => {
  const body = (await request.json()) as { name?: string; nationalityCode?: string };
  if (!body.name || !body.nationalityCode) {
    return HttpResponse.json({ message: "이름과 국적을 입력해주세요" }, { status: 400 });
  }
  return HttpResponse.json({ koreanName: "응우옌 반 안" }, { status: 202 });
};

const putWorker: Parameters<typeof http.put>[1] = async ({ params, request }) => {
  const id = Number(params.id);
  const worker =
    mockWorkers.find((w) => w.id === id) ??
    (id === REGISTERED_WORKER_ID ? mockRegisteredWorker : undefined);
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

  // PR-δ: ENDED + employmentInfo 변경 시 400 차단 (BE D38 정책 시뮬)
  if (worker.status === "ENDED") {
    const body = (await request.json()) as Record<string, unknown>;
    const employmentInfoChanged =
      body.contractStartDate !== worker.contractStartDate ||
      normalizeOptionalDate(body.contractEndDate) !==
        normalizeOptionalDate(worker.contractEndDate);
    if (employmentInfoChanged) {
      return HttpResponse.json(
        {
          status: 400,
          message:
            "이 워커는 고용종료 상태입니다. 계약 정보를 변경하려면 먼저 고용종료를 복원해주세요 " +
            "(POST /api/workers/{id}/restore-employment).",
          timestamp: new Date().toISOString(),
        },
        { status: 400 },
      );
    }
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
  HttpResponse.json([
    mockUpcomingDeadlines[0],
    mockInsuranceNextCycleDeadline,
    ...mockUpcomingDeadlines.slice(1),
  ]);

const getComplianceByWorker: Parameters<typeof http.get>[1] = ({ params }) => {
  const deadlines = [
    ...mockOverdueDeadlines,
    ...mockUpcomingDeadlines,
    mockInsuranceNextCycleDeadline,
    ...mockCompletedDeadlines,
    mockHistoryCompletedDeadline,
  ].filter((d) => d.workerId === Number(params.id));
  return HttpResponse.json(deadlines);
};

const patchComplianceComplete: Parameters<typeof http.patch>[1] = async ({
  params,
  request,
}) => {
  const id = Number(params.id);
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

  const target =
    mockUpcomingDeadlines.find((d) => d.id === id) ??
    mockOverdueDeadlines.find((d) => d.id === id);

  const createdDeadlines: Array<{
    id: number;
    type: ComplianceDeadlineResponse["deadlineType"];
    dueDate: string;
    description: string;
  }> = [];

  if (target) {
    const type = target.deadlineType;
    let dueDate: string | null = null;
    if ((type === "VISA_EXPIRY" || type === "CONTRACT_RENEWAL") && body.nextDueDate) {
      dueDate = body.nextDueDate as string;
    } else if (
      (type === "EXIT_GUARANTEE_INSURANCE" || type === "WAGE_GUARANTEE_INSURANCE") &&
      body.renewedUntil
    ) {
      dueDate = body.renewedUntil as string;
    }

    if (dueDate) {
      createdDeadlines.push({
        id: id + 10_000,
        type,
        dueDate,
        description: target.description,
      });
    }
  }

  return HttpResponse.json(
    { completedDeadlineId: id, createdDeadlines },
    { status: 202 },
  );
};

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
