import type { SimulationResponse, SimulationResultResponse } from "@/types/simulator";
import { transformSimulationResult } from "@/lib/transforms/simulation-transform";

// ─── BE 형식 Mock (BACKEND 핸들러용) ─────────────────────────────
export const mockSimulationResultResponse: SimulationResultResponse = {
  id: 1,
  companyId: 1,
  desiredWorkers: 3,
  desiredTiming: "2026_H2",
  preferredNationality: "VIETNAM",
  quotaAnalysis: {
    industry: "MANUFACTURING",
    annualQuota: 4200,
    currentWorkerCount: 2856,
    exhaustionRate: 68.0,
    remainingQuota: 1344,
    quotaSufficient: true,
  },
  competitionAnalysis: {
    region: "GYEONGGI",
    industry: "MANUFACTURING",
    regionalWorkerCount: 15200,
    nationalWorkerCount: 48000,
    regionalShare: 0.317,
    competitionLevel: "MEDIUM",
  },
  nationalityAnalysis: {
    nationality: "VIETNAM",
    industry: "MANUFACTURING",
    totalCount: 12500,
    maleCount: 8200,
    femaleCount: 4300,
    industryShareRate: 32.4,
  },
  aiReport:
    "## 분석 요약\n현재 조건에서 E-9 근로자 배정 가능성이 높습니다. 해당 지역의 쿼터 여유분과 업종 수요를 고려할 때 신청 적기입니다.\n\n## 상세 분석\n현재 소진율 68%는 양호한 수준입니다. 전년 동기 대비 소진 속도가 12% 느려 하반기 신청 시 배정 가능성이 높습니다.",
  createdAt: "2026-03-24T14:32:00Z",
};

// ─── FE 형식 Mock (jsdom 테스트 핸들러용) ────────────────────────
export const mockSimulationResponse: SimulationResponse =
  transformSimulationResult(mockSimulationResultResponse);
