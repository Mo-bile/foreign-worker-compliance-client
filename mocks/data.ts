import type { WorkerResponse, ComplianceDeadlineResponse, CompanyResponse } from "@/types/api";

// ─── 사업장 목 데이터 ──────────────────────────────────
export const mockCompanies: readonly CompanyResponse[] = [
  {
    id: 1,
    name: "한국전자 주식회사",
    businessNumber: "123-45-67890",
    region: "SEOUL",
    subRegion: "강남구",
    industryCategory: "MANUFACTURING",
    industrySubCategory: "전자부품",
    employeeCount: 80,                 // 변경: 150 → 80 (PM §6.3 mockup 일치)
    domesticInsuredCount: 55,          // 변경: 120 → 55 (PM §6.3 mockup 일치)
    address: "서울시 강남구 테헤란로 123",
    contactPhone: "02-1234-5678",
    contactEmail: "owner1@demo.test",
    averageForeignWorkerWage: 2900000,
    derivedCounts: {
      activeForeignWorkerCount: 9,
      upcomingForeignWorkerCount: 2,
      endedForeignWorkerCount: 5,
      reviewRequiredForeignWorkerCount: 3,
      recentYearEndedForeignWorkerCount: 1,
      registeredWorkforceTotal: 64,
      activeE9WorkerCount: 7,
      activeH2WorkerCount: 1,
      activeE7WorkerCount: 1,
      activeOtherForeignWorkerCount: 0,
      recentYearEndReasonDistribution: { VOLUNTARY_RESIGNATION: 1 },
      recentYearEmployerFaultEndCount: 0,
      workerLifecycleUpdatedAtMax: "2026-05-01T10:00:00",
    },
    createdAt: "2025-01-15T09:00:00",
    updatedAt: "2025-06-20T14:30:00",
  },
  {
    id: 2,
    name: "부산건설 주식회사",
    businessNumber: "234-56-78901",
    region: "BUSAN",
    subRegion: "해운대구",
    industryCategory: "CONSTRUCTION",
    industrySubCategory: null,
    employeeCount: 80,
    domesticInsuredCount: 60,           // 변경: null → 60 (registeredTotal 계산 일관성)
    address: "부산시 해운대구 센텀로 45",
    contactPhone: "051-9876-5432",
    contactEmail: "owner2@demo.test",
    averageForeignWorkerWage: 2750000,
    derivedCounts: {
      activeForeignWorkerCount: 18,
      upcomingForeignWorkerCount: 1,
      endedForeignWorkerCount: 3,
      reviewRequiredForeignWorkerCount: 0,
      recentYearEndedForeignWorkerCount: 2,
      registeredWorkforceTotal: 78,
      activeE9WorkerCount: 12,
      activeH2WorkerCount: 4,
      activeE7WorkerCount: 1,
      activeOtherForeignWorkerCount: 1,
      recentYearEndReasonDistribution: { CONTRACT_EXPIRY: 1, VOLUNTARY_RESIGNATION: 1 },
      recentYearEmployerFaultEndCount: 0,
      workerLifecycleUpdatedAtMax: "2026-04-28T15:00:00",
    },
    createdAt: "2025-03-01T10:00:00",
    updatedAt: "2025-07-15T11:00:00",
  },
  {
    id: 3,
    name: "경기농업 영농조합",
    businessNumber: "345-67-89012",
    region: "GYEONGGI",
    subRegion: "이천시",
    industryCategory: "AGRICULTURE",
    industrySubCategory: "시설원예",
    employeeCount: 30,
    domesticInsuredCount: 15,
    address: "경기도 이천시 농업로 78",
    contactPhone: "031-5555-1234",
    contactEmail: null,
    averageForeignWorkerWage: 2500000,
    derivedCounts: {
      activeForeignWorkerCount: 12,
      upcomingForeignWorkerCount: 0,
      endedForeignWorkerCount: 2,
      reviewRequiredForeignWorkerCount: 1,
      recentYearEndedForeignWorkerCount: 0,
      registeredWorkforceTotal: 27,
      activeE9WorkerCount: 8,
      activeH2WorkerCount: 2,
      activeE7WorkerCount: 0,
      activeOtherForeignWorkerCount: 2,
      recentYearEndReasonDistribution: {},
      recentYearEmployerFaultEndCount: 0,
      workerLifecycleUpdatedAtMax: "2026-04-15T09:00:00",
    },
    createdAt: "2025-05-10T08:00:00",
    updatedAt: "2025-08-01T09:30:00",
  },
];

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
const SAMPLE_STATUSES = ["UPCOMING", "ACTIVE", "ENDED", "REVIEW_REQUIRED"] as const;
const SAMPLE_INSURANCE_CODES = [
  "MANDATORY",
  "FULL_MANDATORY",
  "AUTO_BENEFITS_OPT_IN",
  "OPTIONAL_ON_APPLICATION",
  "EXEMPT",
] as const;
const INSURANCE_DISCLAIMER =
  "본 판정은 관리 보조 목적이며 법적 자문이 아닙니다. 정확한 가입 요건은 관할 공단에 확인하세요.";

function generateWorker(id: number): WorkerResponse {
  const natIdx = id % SAMPLE_NATIONALITIES.length;
  const visaIdx = id % SAMPLE_VISA_TYPES.length;
  const statusIdx = id % SAMPLE_STATUSES.length;
  const insIdx = id % SAMPLE_INSURANCE_CODES.length;
  const empInsIdx = (insIdx + 1) % SAMPLE_INSURANCE_CODES.length;
  const nationality = SAMPLE_NATIONALITIES[natIdx];
  const visaType = SAMPLE_VISA_TYPES[visaIdx];
  const status = SAMPLE_STATUSES[statusIdx];
  const pensionStatus = SAMPLE_INSURANCE_CODES[insIdx];
  const employmentStatus = SAMPLE_INSURANCE_CODES[empInsIdx];

  return {
    id,
    name: `Worker-${id}`,
    koreanName: id % 5 === 0 ? `워커 ${id}` : null,
    nationality,
    visaType,
    visaExpiryDate: `2027-${String((id % 12) + 1).padStart(2, "0")}-15`,
    dateOfBirth: `${String(1980 + (id % 25))}-${String((id % 12) + 1).padStart(2, "0")}-${String(((id + 10) % 28) + 1).padStart(2, "0")}`,
    status,
    insuranceDisclaimer: INSURANCE_DISCLAIMER,
    insuranceEligibilities: [
      {
        insuranceType: "NATIONAL_PENSION",
        status: pensionStatus,
        reason: `${pensionStatus} 테스트 사유`,
        note: id % 4 === 0 ? "테스트 부가 안내" : null,
      },
      {
        insuranceType: "HEALTH_INSURANCE",
        status: "MANDATORY",
        reason: "외국인 근로자 전원 의무가입",
        note: null,
      },
      {
        insuranceType: "EMPLOYMENT_INSURANCE",
        status: employmentStatus,
        reason: `${employmentStatus} 테스트 사유`,
        note: null,
      },
      {
        insuranceType: "INDUSTRIAL_ACCIDENT",
        status: "MANDATORY",
        reason: "외국인 근로자 전원 의무가입",
        note: null,
      },
    ],
    contractStartDate: `2025-${String((id % 12) + 1).padStart(2, "0")}-01`,
    contractEndDate: id % 3 === 0 ? null : `2026-${String((id % 12) + 1).padStart(2, "0")}-28`,
    contactPhone:
      id % 2 === 0
        ? `010-${String(1000 + id).padStart(4, "0")}-${String(5000 + id).padStart(4, "0")}`
        : null,
    contactEmail: id % 3 === 0 ? `worker${id}@example.com` : null,
    jobPosition: id % 4 === 0 ? "프레스 가공" : id % 4 === 1 ? "조립" : null,
    passportNumber: id % 2 === 0 ? `M${String(10000000 + id)}` : null,
    entryDate: `2024-${String((id % 12) + 1).padStart(2, "0")}-15`,
    registrationNumber: id % 3 === 0 ? `${String(800101 + id)}-${String(1000000 + id)}` : null,
    companyId: (id % 3) + 1,
  };
}

// 수동 작성 2건 + 자동 생성 23건 = 총 25건
export const mockWorkers: readonly WorkerResponse[] = [
  {
    id: 1,
    name: "Nguyen Van A",
    koreanName: "응우옌 반 아",
    nationality: "VIETNAM",
    visaType: "E9",
    visaExpiryDate: "2026-12-31",
    dateOfBirth: "1995-03-15",
    status: "ACTIVE",
    insuranceDisclaimer: INSURANCE_DISCLAIMER,
    insuranceEligibilities: [
      {
        insuranceType: "NATIONAL_PENSION",
        status: "MANDATORY",
        reason: "일반 외국인 사회보장협정 미체결국",
        note: "사회보장협정 체결국으로 본국 가입증명서 제출 시 면제 가능",
      },
      {
        insuranceType: "HEALTH_INSURANCE",
        status: "MANDATORY",
        reason: "외국인 근로자 전원 의무가입",
        note: null,
      },
      {
        insuranceType: "EMPLOYMENT_INSURANCE",
        status: "AUTO_BENEFITS_OPT_IN",
        reason: "E-9 피보험자격 자동취득",
        note: "실업급여·육아휴직 급여는 별도 신청 시 적용",
      },
      {
        insuranceType: "INDUSTRIAL_ACCIDENT",
        status: "MANDATORY",
        reason: "외국인 근로자 전원 의무가입",
        note: null,
      },
    ],
    contractStartDate: "2025-03-01",
    contractEndDate: "2026-02-28",
    contactPhone: "010-1234-5678",
    contactEmail: null,
    jobPosition: "프레스 가공",
    passportNumber: "M12345678",
    entryDate: "2024-06-15",
    registrationNumber: "950315-5123456",
    companyId: 1,
  },
  {
    id: 2,
    name: "Zhang Wei",
    koreanName: null,
    nationality: "CHINA",
    visaType: "H2",
    visaExpiryDate: "2027-06-15",
    dateOfBirth: "1988-11-20",
    status: "ACTIVE",
    insuranceDisclaimer: INSURANCE_DISCLAIMER,
    insuranceEligibilities: [
      {
        insuranceType: "NATIONAL_PENSION",
        status: "EXEMPT",
        reason: "사회보장협정 체결국 근로자",
        note: null,
      },
      {
        insuranceType: "HEALTH_INSURANCE",
        status: "MANDATORY",
        reason: "외국인 근로자 전원 의무가입",
        note: null,
      },
      {
        insuranceType: "EMPLOYMENT_INSURANCE",
        status: "AUTO_BENEFITS_OPT_IN",
        reason: "H-2 피보험자격 자동취득",
        note: "신규 발급 중단, 기존 체류자 한정",
      },
      {
        insuranceType: "INDUSTRIAL_ACCIDENT",
        status: "MANDATORY",
        reason: "외국인 근로자 전원 의무가입",
        note: null,
      },
    ],
    contractStartDate: "2025-01-15",
    contractEndDate: null,
    contactPhone: "010-9876-5432",
    contactEmail: "zhang@example.com",
    jobPosition: null,
    passportNumber: "G98765432",
    entryDate: "2023-11-20",
    registrationNumber: null,
    companyId: 1,
  },
  ...Array.from({ length: 23 }, (_, i) => generateWorker(i + 3)),
];

// ─── 주요 기한 목 데이터 ──────────────────────────────────
const SAMPLE_DEADLINE_TYPES = [
  "VISA_EXPIRY",
  "NATIONAL_PENSION_ENROLLMENT",
  "HEALTH_INSURANCE_ENROLLMENT",
  "EMPLOYMENT_INSURANCE_ENROLLMENT",
  "INDUSTRIAL_ACCIDENT_ENROLLMENT",
  "CHANGE_REPORT",
  "CONTRACT_RENEWAL",
] as const;
const SAMPLE_DEADLINE_DESCS: Record<string, string> = {
  VISA_EXPIRY: "비자 갱신 필요",
  NATIONAL_PENSION_ENROLLMENT: "국민연금 취득신고 기한",
  HEALTH_INSURANCE_ENROLLMENT: "건강보험 취득신고 기한",
  EMPLOYMENT_INSURANCE_ENROLLMENT: "고용보험 취득신고 기한",
  INDUSTRIAL_ACCIDENT_ENROLLMENT: "산재보험 취득신고 기한",
  CHANGE_REPORT: "고용변동 신고 필요",
  CONTRACT_RENEWAL: "계약 갱신 필요",
};

function getWorkerName(workerId: number): string {
  const worker = mockWorkers.find((worker) => worker.id === workerId);
  return worker?.name ?? `Worker-${workerId}`;
}

function generateOverdueDeadline(id: number): ComplianceDeadlineResponse {
  const typeIdx = id % SAMPLE_DEADLINE_TYPES.length;
  const type = SAMPLE_DEADLINE_TYPES[typeIdx];
  const workerId = (id % 25) + 1;
  return {
    id,
    workerId,
    workerName: getWorkerName(workerId),
    deadlineType: type,
    dueDate: `2025-${String((id % 12) + 1).padStart(2, "0")}-${String((id % 28) + 1).padStart(2, "0")}`,
    status: "OVERDUE",
    description: SAMPLE_DEADLINE_DESCS[type],
  };
}

function generateUpcomingDeadline(id: number): ComplianceDeadlineResponse {
  const typeIdx = id % SAMPLE_DEADLINE_TYPES.length;
  const type = SAMPLE_DEADLINE_TYPES[typeIdx];
  const statuses = ["APPROACHING", "URGENT"] as const;
  const workerId = (id % 25) + 1;
  return {
    id,
    workerId,
    workerName: getWorkerName(workerId),
    deadlineType: type,
    dueDate: `2026-${String((id % 12) + 1).padStart(2, "0")}-${String((id % 28) + 1).padStart(2, "0")}`,
    status: statuses[id % 2],
    description: SAMPLE_DEADLINE_DESCS[type],
  };
}

// 기존 2건 유지 + 20건 추가 = 총 22건 overdue (> 20 for pagination)
export const mockOverdueDeadlines: readonly ComplianceDeadlineResponse[] = [
  {
    id: 1,
    workerId: 1,
    workerName: "Nguyen Van A",
    deadlineType: "VISA_EXPIRY",
    dueDate: "2025-12-31",
    status: "OVERDUE",
    description: "비자 갱신 필요",
  },
  {
    id: 2,
    workerId: 2,
    workerName: "Zhang Wei",
    deadlineType: "HEALTH_INSURANCE_ENROLLMENT",
    dueDate: "2025-11-30",
    status: "OVERDUE",
    description: "건강보험 취득신고 기한 초과",
  },
  ...Array.from({ length: 20 }, (_, i) => generateOverdueDeadline(i + 100)),
];

// 기존 3건 유지 + 22건 추가 = 총 25건 upcoming
export const mockUpcomingDeadlines: readonly ComplianceDeadlineResponse[] = [
  {
    id: 3,
    workerId: 1,
    workerName: "Nguyen Van A",
    deadlineType: "CONTRACT_RENEWAL",
    dueDate: "2026-04-15",
    status: "APPROACHING",
    description: "계약 갱신 필요",
  },
  {
    id: 4,
    workerId: 2,
    workerName: "Zhang Wei",
    deadlineType: "CHANGE_REPORT",
    dueDate: "2026-03-25",
    status: "URGENT",
    description: "고용변동 신고 필요",
  },
  {
    id: 5,
    workerId: 1,
    workerName: "Nguyen Van A",
    deadlineType: "VISA_EXPIRY",
    dueDate: "2026-04-10",
    status: "APPROACHING",
    description: "비자 만료 임박",
  },
  ...Array.from({ length: 22 }, (_, i) => generateUpcomingDeadline(i + 200)),
];
