import type { WorkerResponse, ComplianceDeadlineResponse } from "@/types/api";

export const mockWorkers: readonly WorkerResponse[] = [
  {
    id: 1, name: "Nguyen Van A", nationality: "베트남",
    visaType: "고용허가제 일반외국인", visaExpiryDate: "2026-12-31", status: "재직중",
    insuranceEligibilities: [
      { insuranceType: "국민연금", status: "의무", reason: "일반 외국인 (사회보장협정 미체결국)" },
      { insuranceType: "건강보험", status: "의무", reason: "외국인 근로자 전원 의무가입" },
      { insuranceType: "고용보험", status: "임의", reason: "E9 비자: 임의가입 대상" },
      { insuranceType: "산재보험", status: "의무", reason: "외국인 근로자 전원 의무가입" },
    ],
  },
  {
    id: 2, name: "Zhang Wei", nationality: "중국",
    visaType: "외국국적동포", visaExpiryDate: "2027-06-15", status: "재직중",
    insuranceEligibilities: [
      { insuranceType: "국민연금", status: "면제", reason: "사회보장협정 체결국 근로자" },
      { insuranceType: "건강보험", status: "의무", reason: "외국인 근로자 전원 의무가입" },
      { insuranceType: "고용보험", status: "임의", reason: "H2 비자: 임의가입 대상" },
      { insuranceType: "산재보험", status: "의무", reason: "외국인 근로자 전원 의무가입" },
    ],
  },
];

export const mockOverdueDeadlines: readonly ComplianceDeadlineResponse[] = [
  { id: 1, workerId: 1, deadlineType: "VISA_EXPIRY", dueDate: "2025-12-31", status: "OVERDUE", description: "비자 갱신 필요" },
  { id: 2, workerId: 2, deadlineType: "INSURANCE_ENROLLMENT", dueDate: "2025-11-30", status: "OVERDUE", description: "건강보험 가입 기한 초과" },
];

export const mockUpcomingDeadlines: readonly ComplianceDeadlineResponse[] = [
  { id: 3, workerId: 1, deadlineType: "CONTRACT_RENEWAL", dueDate: "2026-04-15", status: "APPROACHING", description: "계약 갱신 필요" },
  { id: 4, workerId: 2, deadlineType: "CHANGE_REPORT", dueDate: "2026-03-25", status: "URGENT", description: "고용변동 신고 필요" },
  { id: 5, workerId: 1, deadlineType: "VISA_EXPIRY", dueDate: "2026-04-10", status: "APPROACHING", description: "비자 만료 임박" },
];
