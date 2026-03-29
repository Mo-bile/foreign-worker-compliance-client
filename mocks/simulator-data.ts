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
  aiInsights: {
    overallVerdict:
      "현재 조건에서 E-9 근로자 배정 가능성이 높습니다. 해당 지역의 쿼터 여유분과 업종 수요를 고려할 때 신청 적기입니다.",
    quotaInsight: "현재 소진율 68%는 양호한 수준입니다. 전년 동기 대비 소진 속도가 12% 느려 하반기 신청 시 배정 가능성이 높습니다.",
    competitionInsight: "해당 지역은 경쟁 강도가 보통 수준입니다. 제조업 밀집 지역이나 최근 신규 사업장 유입이 둔화되어 배정에 유리합니다.",
    nationalityInsight: "베트남 국적 근로자는 제조업 분야에서 높은 비중을 차지하며, 인력 풀이 풍부합니다.",
    actionItems: [
      "내국인 구인노력 의무기간 14일을 우선 이행하세요",
      "필요 서류를 미리 준비하면 처리 기간을 단축할 수 있습니다",
      "관할 고용센터에 사전 상담을 신청하세요",
    ],
    disclaimer: "본 서비스는 법률 자문이 아닌 관리 보조 도구입니다. 정확한 법적 판단은 반드시 고용노동부 또는 전문가에게 문의하세요.",
  },
  createdAt: "2026-03-24T14:32:00Z",
};

// ─── FE 형식 Mock (jsdom 테스트 핸들러용) ────────────────────────
export const mockSimulationResponse: SimulationResponse =
  transformSimulationResult(mockSimulationResultResponse);
