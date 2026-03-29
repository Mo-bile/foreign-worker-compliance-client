import type { SimulationResponse, SimulationResultResponse } from "@/types/simulator";
import { transformSimulationResult } from "@/lib/transforms/simulation-transform";

// ─── BE 형식 Mock (BACKEND 핸들러용) ─────────────────────────────
export const mockSimulationResultResponse: SimulationResultResponse = {
  id: "sim-mock-001",
  companyId: 1,
  desiredWorkers: 3,
  desiredTiming: "2026_H2",
  preferredNationality: "VIETNAM",
  quotaAnalysis: {
    industryQuota: 4200,
    currentAllocated: 2856,
    remainingQuota: 1344,
    utilizationRate: 68.0,
    quotaSufficient: true,
  },
  competitionAnalysis: {
    regionApplicants: 127,
    densityRank: 35,
    avgApplicationRate: 1.4,
    competitionLevel: "MEDIUM",
  },
  nationalityAnalysis: {
    nationality: "VIETNAM",
    industryShareRate: 32.4,
    requestedShareRate: 28.7,
    available: true,
  },
  aiReport:
    "## 분석 요약\n현재 조건에서 E-9 근로자 배정 가능성이 높습니다. 해당 지역의 쿼터 여유분과 업종 수요를 고려할 때 신청 적기입니다.\n\n## 상세 분석\n현재 소진율 68%는 양호한 수준입니다. 전년 동기 대비 소진 속도가 12% 느려 하반기 신청 시 배정 가능성이 높습니다.",
  createdAt: "2026-03-24T14:32:00Z",
};

// ─── FE 형식 Mock (jsdom 테스트 핸들러용) ────────────────────────
export const mockSimulationResponse: SimulationResponse =
  transformSimulationResult(mockSimulationResultResponse);
