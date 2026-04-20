import type { WorkerResponse, ComplianceDeadlineResponse, CompanyResponse } from "@/types/api";

// ─── 사업장 목 데이터 ──────────────────────────────────
export const mockCompanies: readonly CompanyResponse[] = [
  {
    id: 1,
    name: "한국전자 주식회사",
    businessNumber: "123-45-67890",
    region: "SEOUL",
    regionName: "서울",
    subRegion: "강남구",
    industryCategory: "MANUFACTURING",
    industryCategoryName: "제조업",
    industrySubCategory: "전자부품",
    employeeCount: 150,
    domesticInsuredCount: 120,
    foreignWorkerCount: 30,
    address: "서울시 강남구 테헤란로 123",
    contactPhone: "02-1234-5678",
    averageForeignWorkerWage: 2900000,
    recentYearTerminationCount: 2,
    createdAt: "2025-01-15T09:00:00",
    updatedAt: "2025-06-20T14:30:00",
  },
  {
    id: 2,
    name: "부산건설 주식회사",
    businessNumber: "234-56-78901",
    region: "BUSAN",
    regionName: "부산",
    subRegion: "해운대구",
    industryCategory: "CONSTRUCTION",
    industryCategoryName: "건설업",
    industrySubCategory: null,
    employeeCount: 80,
    domesticInsuredCount: null,
    foreignWorkerCount: 25,
    address: "부산시 해운대구 센텀로 45",
    contactPhone: "051-9876-5432",
    averageForeignWorkerWage: 2750000,
    recentYearTerminationCount: 1,
    createdAt: "2025-03-01T10:00:00",
    updatedAt: "2025-07-15T11:00:00",
  },
  {
    id: 3,
    name: "경기농업 영농조합",
    businessNumber: "345-67-89012",
    region: "GYEONGGI",
    regionName: "경기",
    subRegion: "이천시",
    industryCategory: "AGRICULTURE",
    industryCategoryName: "농업",
    industrySubCategory: "시설원예",
    employeeCount: 30,
    domesticInsuredCount: 15,
    foreignWorkerCount: 15,
    address: "경기도 이천시 농업로 78",
    contactPhone: "031-5555-1234",
    averageForeignWorkerWage: 2500000,
    recentYearTerminationCount: 0,
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
const SAMPLE_STATUSES = ["ACTIVE", "INACTIVE", "TERMINATED"] as const;
const SAMPLE_NATIONALITY_LABELS: Record<string, string> = {
  VIETNAM: "베트남",
  CHINA: "중국",
  INDONESIA: "인도네시아",
  PHILIPPINES: "필리핀",
  THAILAND: "태국",
  CAMBODIA: "캄보디아",
  MYANMAR: "미얀마",
  NEPAL: "네팔",
};
const SAMPLE_VISA_LABELS: Record<string, string> = {
  E9: "고용허가제 일반외국인",
  H2: "외국국적동포",
  E7: "전문직",
  E8: "계절근로자",
  F2: "거주",
  F5: "영주",
  F6: "결혼이민",
  E7_4: "숙련기능인력",
};
const SAMPLE_STATUS_LABELS: Record<string, string> = {
  ACTIVE: "재직중",
  INACTIVE: "비활성",
  TERMINATED: "퇴사",
};
const SAMPLE_INSURANCE_CODES = [
  "MANDATORY",
  "FULL_MANDATORY",
  "AUTO_BENEFITS_OPT_IN",
  "OPTIONAL_ON_APPLICATION",
  "EXEMPT",
] as const;
const SAMPLE_INSURANCE_LABELS: Record<string, string> = {
  MANDATORY: "의무가입",
  FULL_MANDATORY: "전부 의무적용",
  AUTO_BENEFITS_OPT_IN: "자동가입(급여신청형)",
  OPTIONAL_ON_APPLICATION: "신청시가입",
  EXEMPT: "가입제외",
};
const INSURANCE_DISCLAIMER =
  "본 판정은 관리 보조 목적이며 법적 자문이 아닙니다. 정확한 가입 요건은 관할 공단에 확인하세요.";

function generateWorker(id: number): WorkerResponse {
  const natIdx = id % SAMPLE_NATIONALITIES.length;
  const visaIdx = id % SAMPLE_VISA_TYPES.length;
  const statusIdx = id % SAMPLE_STATUSES.length;
  const insIdx = id % SAMPLE_INSURANCE_CODES.length;
  const empInsIdx = (insIdx + 1) % SAMPLE_INSURANCE_CODES.length;
  const nationalityCode = SAMPLE_NATIONALITIES[natIdx];
  const visaTypeCode = SAMPLE_VISA_TYPES[visaIdx];
  const statusCode = SAMPLE_STATUSES[statusIdx];
  const pensionStatusCode = SAMPLE_INSURANCE_CODES[insIdx];
  const employmentStatusCode = SAMPLE_INSURANCE_CODES[empInsIdx];

  return {
    id,
    name: `Worker-${id}`,
    nationality: SAMPLE_NATIONALITY_LABELS[nationalityCode],
    nationalityCode,
    visaType: SAMPLE_VISA_LABELS[visaTypeCode],
    visaTypeCode,
    visaExpiryDate: `2027-${String((id % 12) + 1).padStart(2, "0")}-15`,
    dateOfBirth: `${String(1980 + (id % 25))}-${String((id % 12) + 1).padStart(2, "0")}-${String(((id + 10) % 28) + 1).padStart(2, "0")}`,
    status: SAMPLE_STATUS_LABELS[statusCode],
    statusCode,
    insuranceDisclaimer: INSURANCE_DISCLAIMER,
    insuranceEligibilities: [
      {
        insuranceType: "국민연금",
        insuranceTypeCode: "NATIONAL_PENSION",
        status: SAMPLE_INSURANCE_LABELS[pensionStatusCode],
        statusCode: pensionStatusCode,
        reason: `${SAMPLE_INSURANCE_LABELS[pensionStatusCode]} 테스트 사유`,
        note: id % 4 === 0 ? "테스트 부가 안내" : null,
      },
      {
        insuranceType: "건강보험",
        insuranceTypeCode: "HEALTH_INSURANCE",
        status: SAMPLE_INSURANCE_LABELS.MANDATORY,
        statusCode: "MANDATORY",
        reason: "외국인 근로자 전원 의무가입",
        note: null,
      },
      {
        insuranceType: "고용보험",
        insuranceTypeCode: "EMPLOYMENT_INSURANCE",
        status: SAMPLE_INSURANCE_LABELS[employmentStatusCode],
        statusCode: employmentStatusCode,
        reason: `${SAMPLE_INSURANCE_LABELS[employmentStatusCode]} 테스트 사유`,
        note: null,
      },
      {
        insuranceType: "산재보험",
        insuranceTypeCode: "INDUSTRIAL_ACCIDENT",
        status: SAMPLE_INSURANCE_LABELS.MANDATORY,
        statusCode: "MANDATORY",
        reason: "외국인 근로자 전원 의무가입",
        note: null,
      },
    ],
  };
}

// 수동 작성 2건 + 자동 생성 23건 = 총 25건
export const mockWorkers: readonly WorkerResponse[] = [
  {
    id: 1,
    name: "Nguyen Van A",
    nationality: "베트남",
    nationalityCode: "VIETNAM",
    visaType: "고용허가제 일반외국인",
    visaTypeCode: "E9",
    visaExpiryDate: "2026-12-31",
    dateOfBirth: "1995-03-15",
    status: "재직중",
    statusCode: "ACTIVE",
    insuranceDisclaimer: INSURANCE_DISCLAIMER,
    insuranceEligibilities: [
      {
        insuranceType: "국민연금",
        insuranceTypeCode: "NATIONAL_PENSION",
        status: SAMPLE_INSURANCE_LABELS.MANDATORY,
        statusCode: "MANDATORY",
        reason: "일반 외국인 사회보장협정 미체결국",
        note: "사회보장협정 체결국으로 본국 가입증명서 제출 시 면제 가능",
      },
      {
        insuranceType: "건강보험",
        insuranceTypeCode: "HEALTH_INSURANCE",
        status: SAMPLE_INSURANCE_LABELS.MANDATORY,
        statusCode: "MANDATORY",
        reason: "외국인 근로자 전원 의무가입",
        note: null,
      },
      {
        insuranceType: "고용보험",
        insuranceTypeCode: "EMPLOYMENT_INSURANCE",
        status: SAMPLE_INSURANCE_LABELS.AUTO_BENEFITS_OPT_IN,
        statusCode: "AUTO_BENEFITS_OPT_IN",
        reason: "E-9 피보험자격 자동취득",
        note: "실업급여·육아휴직 급여는 별도 신청 시 적용",
      },
      {
        insuranceType: "산재보험",
        insuranceTypeCode: "INDUSTRIAL_ACCIDENT",
        status: SAMPLE_INSURANCE_LABELS.MANDATORY,
        statusCode: "MANDATORY",
        reason: "외국인 근로자 전원 의무가입",
        note: null,
      },
    ],
  },
  {
    id: 2,
    name: "Zhang Wei",
    nationality: "중국",
    nationalityCode: "CHINA",
    visaType: "외국국적동포",
    visaTypeCode: "H2",
    visaExpiryDate: "2027-06-15",
    dateOfBirth: "1988-11-20",
    status: "재직중",
    statusCode: "ACTIVE",
    insuranceDisclaimer: INSURANCE_DISCLAIMER,
    insuranceEligibilities: [
      {
        insuranceType: "국민연금",
        insuranceTypeCode: "NATIONAL_PENSION",
        status: SAMPLE_INSURANCE_LABELS.EXEMPT,
        statusCode: "EXEMPT",
        reason: "사회보장협정 체결국 근로자",
        note: null,
      },
      {
        insuranceType: "건강보험",
        insuranceTypeCode: "HEALTH_INSURANCE",
        status: SAMPLE_INSURANCE_LABELS.MANDATORY,
        statusCode: "MANDATORY",
        reason: "외국인 근로자 전원 의무가입",
        note: null,
      },
      {
        insuranceType: "고용보험",
        insuranceTypeCode: "EMPLOYMENT_INSURANCE",
        status: SAMPLE_INSURANCE_LABELS.AUTO_BENEFITS_OPT_IN,
        statusCode: "AUTO_BENEFITS_OPT_IN",
        reason: "H-2 피보험자격 자동취득",
        note: "신규 발급 중단, 기존 체류자 한정",
      },
      {
        insuranceType: "산재보험",
        insuranceTypeCode: "INDUSTRIAL_ACCIDENT",
        status: SAMPLE_INSURANCE_LABELS.MANDATORY,
        statusCode: "MANDATORY",
        reason: "외국인 근로자 전원 의무가입",
        note: null,
      },
    ],
  },
  ...Array.from({ length: 23 }, (_, i) => generateWorker(i + 3)),
];

// ─── 데드라인 목 데이터 ──────────────────────────────────
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
  const statuses = ["APPROACHING", "URGENT", "PENDING"] as const;
  const workerId = (id % 25) + 1;
  return {
    id,
    workerId,
    workerName: getWorkerName(workerId),
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
