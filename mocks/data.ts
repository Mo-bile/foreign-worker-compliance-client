import type { WorkerResponse, ComplianceDeadlineResponse } from "@/types/api";

// ─── 목 데이터 생성 헬퍼 ─────────────────────────────────
const SAMPLE_NATIONALITIES = [
  "VIETNAM",
  "CHINA",
  "INDONESIA",
  "PHILIPPINES",
  "THAILAND",
  "CAMBODIA",
  "MYANMAR",
  "NEPAL",
] as const;
const SAMPLE_VISA_TYPES = ["E9", "H2", "E7", "E8", "F2", "F5", "F6", "E7_4"] as const;
const SAMPLE_STATUSES = ["ACTIVE", "INACTIVE", "TERMINATED"] as const;
const SAMPLE_INSURANCE = ["의무", "임의", "면제"] as const;

function generateWorker(id: number): WorkerResponse {
  const natIdx = id % SAMPLE_NATIONALITIES.length;
  const visaIdx = id % SAMPLE_VISA_TYPES.length;
  const statusIdx = id % SAMPLE_STATUSES.length;
  const insIdx = id % SAMPLE_INSURANCE.length;

  return {
    id,
    name: `Worker-${id}`,
    nationality: SAMPLE_NATIONALITIES[natIdx],
    visaType: SAMPLE_VISA_TYPES[visaIdx],
    visaExpiryDate: `2027-${String((id % 12) + 1).padStart(2, "0")}-15`,
    status: SAMPLE_STATUSES[statusIdx],
    insuranceEligibilities: [
      { insuranceType: "국민연금", status: SAMPLE_INSURANCE[insIdx], reason: "테스트 사유" },
      { insuranceType: "건강보험", status: "의무", reason: "전원 의무가입" },
      {
        insuranceType: "고용보험",
        status: SAMPLE_INSURANCE[(insIdx + 1) % 3],
        reason: "테스트 사유",
      },
      { insuranceType: "산재보험", status: "의무", reason: "전원 의무가입" },
    ],
  };
}

// 기존 2건 (enum 키로 교정) + 23건 생성 = 총 25건
export const mockWorkers: readonly WorkerResponse[] = [
  {
    id: 1,
    name: "Nguyen Van A",
    nationality: "VIETNAM",
    visaType: "E9",
    visaExpiryDate: "2026-12-31",
    status: "ACTIVE",
    insuranceEligibilities: [
      { insuranceType: "국민연금", status: "의무", reason: "일반 외국인 (사회보장협정 미체결국)" },
      { insuranceType: "건강보험", status: "의무", reason: "외국인 근로자 전원 의무가입" },
      { insuranceType: "고용보험", status: "임의", reason: "E9 비자: 임의가입 대상" },
      { insuranceType: "산재보험", status: "의무", reason: "외국인 근로자 전원 의무가입" },
    ],
  },
  {
    id: 2,
    name: "Zhang Wei",
    nationality: "CHINA",
    visaType: "H2",
    visaExpiryDate: "2027-06-15",
    status: "ACTIVE",
    insuranceEligibilities: [
      { insuranceType: "국민연금", status: "면제", reason: "사회보장협정 체결국 근로자" },
      { insuranceType: "건강보험", status: "의무", reason: "외국인 근로자 전원 의무가입" },
      { insuranceType: "고용보험", status: "임의", reason: "H2 비자: 임의가입 대상" },
      { insuranceType: "산재보험", status: "의무", reason: "외국인 근로자 전원 의무가입" },
    ],
  },
  ...Array.from({ length: 23 }, (_, i) => generateWorker(i + 3)),
];

// ─── 데드라인 목 데이터 ──────────────────────────────────
const SAMPLE_DEADLINE_TYPES = [
  "VISA_EXPIRY",
  "INSURANCE_ENROLLMENT",
  "CHANGE_REPORT",
  "CONTRACT_RENEWAL",
] as const;
const SAMPLE_DEADLINE_DESCS: Record<string, string> = {
  VISA_EXPIRY: "비자 갱신 필요",
  INSURANCE_ENROLLMENT: "보험 가입 기한",
  CHANGE_REPORT: "고용변동 신고 필요",
  CONTRACT_RENEWAL: "계약 갱신 필요",
};

function generateOverdueDeadline(id: number): ComplianceDeadlineResponse {
  const typeIdx = id % SAMPLE_DEADLINE_TYPES.length;
  const type = SAMPLE_DEADLINE_TYPES[typeIdx];
  return {
    id,
    workerId: (id % 25) + 1,
    deadlineType: type,
    dueDate: `2025-${String((id % 12) + 1).padStart(2, "0")}-${String((id % 28) + 1).padStart(2, "0")}`,
    status: "OVERDUE",
    description: SAMPLE_DEADLINE_DESCS[type],
  };
}

function generateUpcomingDeadline(id: number): ComplianceDeadlineResponse {
  const typeIdx = id % SAMPLE_DEADLINE_TYPES.length;
  const type = SAMPLE_DEADLINE_TYPES[typeIdx];
  const statuses = ["APPROACHING", "URGENT", "PENDING"] as const;
  return {
    id,
    workerId: (id % 25) + 1,
    deadlineType: type,
    dueDate: `2026-${String((id % 12) + 1).padStart(2, "0")}-${String((id % 28) + 1).padStart(2, "0")}`,
    status: statuses[id % 3],
    description: SAMPLE_DEADLINE_DESCS[type],
  };
}

// 기존 2건 유지 + 20건 추가 = 총 22건 overdue (> 20 for pagination)
export const mockOverdueDeadlines: readonly ComplianceDeadlineResponse[] = [
  {
    id: 1,
    workerId: 1,
    deadlineType: "VISA_EXPIRY",
    dueDate: "2025-12-31",
    status: "OVERDUE",
    description: "비자 갱신 필요",
  },
  {
    id: 2,
    workerId: 2,
    deadlineType: "INSURANCE_ENROLLMENT",
    dueDate: "2025-11-30",
    status: "OVERDUE",
    description: "건강보험 가입 기한 초과",
  },
  ...Array.from({ length: 20 }, (_, i) => generateOverdueDeadline(i + 100)),
];

// 기존 3건 유지 + 22건 추가 = 총 25건 upcoming
export const mockUpcomingDeadlines: readonly ComplianceDeadlineResponse[] = [
  {
    id: 3,
    workerId: 1,
    deadlineType: "CONTRACT_RENEWAL",
    dueDate: "2026-04-15",
    status: "APPROACHING",
    description: "계약 갱신 필요",
  },
  {
    id: 4,
    workerId: 2,
    deadlineType: "CHANGE_REPORT",
    dueDate: "2026-03-25",
    status: "URGENT",
    description: "고용변동 신고 필요",
  },
  {
    id: 5,
    workerId: 1,
    deadlineType: "VISA_EXPIRY",
    dueDate: "2026-04-10",
    status: "APPROACHING",
    description: "비자 만료 임박",
  },
  ...Array.from({ length: 22 }, (_, i) => generateUpcomingDeadline(i + 200)),
];
