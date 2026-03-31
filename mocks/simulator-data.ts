import type { SimulationResultResponse } from "@/types/simulator";

// ─── Mock 1: 한도 이내 (Within Quota) ────────────────────────────
export const mockWithinQuotaResponse: SimulationResultResponse = {
  id: 1,
  companyId: 1,
  desiredWorkers: 3,
  desiredTiming: "2026-Q2",
  preferredNationality: "VIETNAM",
  domesticInsuredCount: 33,
  employmentLimitAnalysis: {
    domesticInsuredCount: 33,
    baseLimit: 14,
    doubleCap: null,
    baseLimitAfterCap: 14,
    additionalBonuses: [
      { reason: "비수도권 우대", ratePercent: 20, cappedByDomesticCount: false },
    ],
    additionalCount: 2,
    totalLimit: 16,
    cappedByDomesticCount: false,
    currentForeignWorkerCount: 12,
    remainingCapacity: 4,
    limitExceeded: false,
    whatIfScenarios: [],
  },
  scoringAnalysis: {
    appliedBonusItems: [
      { code: "DEPOPULATION_AREA", displayName: "인구감소지역 소재 사업장", points: 5, applied: true },
      { code: "LABOR_LAW_COMPLIANCE", displayName: "최근 2년간 노동관계법 위반 없음", points: 3, applied: true },
    ],
    availableBonusItems: [
      { code: "PREMIUM_DORMITORY", displayName: "우수 기숙사 제공", points: 5, applied: false },
      { code: "NEW_WORKPLACE", displayName: "외국인 고용이 처음인 사업장", points: 3, applied: false },
    ],
    totalBonusScore: 8,
    totalDeductionScore: 0,
    estimatedScore: 68,
    maxPossibleScore: 84,
  },
  quotaStatus: {
    industry: "식료품제조업",
    currentYearQuota: 12500,
    recentHistory: [
      { year: 2024, quotaCount: 9800, source: "고용노동부 고시" },
      { year: 2025, quotaCount: 11000, source: "고용노동부 고시" },
      { year: 2026, quotaCount: 12500, source: "고용노동부 고시" },
    ],
  },
  timelineEstimate: {
    preferredNationality: "VIETNAM",
    estimatedMonths: 4,
    steps: [
      { stepName: "내국인 구인노력", estimatedDays: 14, description: "워크넷 등록 후 14일 구인노력 의무 이행" },
      { stepName: "고용허가 신청 → 배정", estimatedDays: 45, description: "서류 제출 후 점수 심사, 차수별 배정 결과 통보" },
      { stepName: "근로계약 체결", estimatedDays: 18, description: "배정된 근로자와 표준근로계약서 체결" },
      { stepName: "입국 및 취업교육", estimatedDays: 45, description: "비자 발급 → 입국 → 취업교육(20시간) 이수" },
    ],
  },
  aiInsights: {
    overallVerdict:
      "귀사는 현재 <strong>고용 한도(16명)</strong> 내에서 3명 추가 채용이 가능합니다. 예상 배정 점수 68점은 상위 약 30% 수준으로, 배정 가능성이 높은 편입니다. 다만 점수 경쟁이 심한 차수에서는 탈락 가능성도 있으므로, 우수 기숙사 제공(+5점)으로 점수를 개선하시는 것을 권장합니다.",
    limitInsight: "내국인 33명 기준 고용 한도 16명 중 12명 사용, 잔여 4명입니다.",
    scoringInsight: "기본 60점 + 가점 8점 = 68점. 우수 기숙사 인증 시 73점(상위 ~20%)까지 향상 가능합니다.",
    quotaInsight: "식료품제조업 배정 비율이 증가 추세이며, 이번 차수 경쟁률은 완화되고 있습니다.",
    timelineInsight: "베트남 국적 선택 시 약 4개월, 미지정 시 약 3개월 소요 예상입니다.",
    actionItems: [
      "내국인 구인노력 14일 이행",
      "고용허가 신청 구비서류 준비",
      "관할 고용센터 방문 또는 온라인 신청",
    ],
    disclaimer:
      "본 서비스는 법률 자문이 아닌 관리 보조 도구입니다. 실제 고용허가 발급 여부는 관할 고용센터의 심사에 따라 달라질 수 있습니다.",
  },
  createdAt: "2026-03-30T14:32:00Z",
};

// ─── Mock 2: 한도 초과 (Exceeded) ────────────────────────────────
export const mockExceededResponse: SimulationResultResponse = {
  id: 2,
  companyId: 1,
  desiredWorkers: 3,
  desiredTiming: "2026-Q2",
  preferredNationality: "VIETNAM",
  domesticInsuredCount: 33,
  employmentLimitAnalysis: {
    domesticInsuredCount: 33,
    baseLimit: 14,
    doubleCap: null,
    baseLimitAfterCap: 14,
    additionalBonuses: [
      { reason: "비수도권 우대", ratePercent: 20, cappedByDomesticCount: false },
    ],
    additionalCount: 2,
    totalLimit: 16,
    cappedByDomesticCount: false,
    currentForeignWorkerCount: 16,
    remainingCapacity: 0,
    limitExceeded: true,
    whatIfScenarios: [
      {
        additionalDomesticCount: 0,
        newDomesticTotal: 33,
        newBaseLimit: 14,
        newBaseLimitAfterCap: 14,
        newTotalLimit: 16,
        newRemainingCapacity: 0,
        feasibility: "IMPOSSIBLE",
      },
      {
        additionalDomesticCount: 3,
        newDomesticTotal: 36,
        newBaseLimit: 15,
        newBaseLimitAfterCap: 15,
        newTotalLimit: 17,
        newRemainingCapacity: 1,
        feasibility: "INSUFFICIENT",
      },
      {
        additionalDomesticCount: 7,
        newDomesticTotal: 40,
        newBaseLimit: 17,
        newBaseLimitAfterCap: 17,
        newTotalLimit: 19,
        newRemainingCapacity: 3,
        feasibility: "POSSIBLE",
      },
      {
        additionalDomesticCount: 12,
        newDomesticTotal: 45,
        newBaseLimit: 20,
        newBaseLimitAfterCap: 20,
        newTotalLimit: 22,
        newRemainingCapacity: 6,
        feasibility: "SURPLUS",
      },
    ],
  },
  scoringAnalysis: {
    appliedBonusItems: [
      { code: "DEPOPULATION_AREA", displayName: "인구감소지역 소재 사업장", points: 5, applied: true },
      { code: "LABOR_LAW_COMPLIANCE", displayName: "최근 2년간 노동관계법 위반 없음", points: 3, applied: true },
    ],
    availableBonusItems: [
      { code: "PREMIUM_DORMITORY", displayName: "우수 기숙사 제공", points: 5, applied: false },
      { code: "NEW_WORKPLACE", displayName: "외국인 고용이 처음인 사업장", points: 3, applied: false },
    ],
    totalBonusScore: 8,
    totalDeductionScore: 0,
    estimatedScore: 68,
    maxPossibleScore: 84,
  },
  quotaStatus: {
    industry: "식료품제조업",
    currentYearQuota: 12500,
    recentHistory: [
      { year: 2024, quotaCount: 9800, source: "고용노동부 고시" },
      { year: 2025, quotaCount: 11000, source: "고용노동부 고시" },
      { year: 2026, quotaCount: 12500, source: "고용노동부 고시" },
    ],
  },
  timelineEstimate: {
    preferredNationality: "VIETNAM",
    estimatedMonths: 4,
    steps: [
      { stepName: "내국인 구인노력", estimatedDays: 14, description: "워크넷 등록 후 14일 구인노력 의무 이행" },
      { stepName: "고용허가 신청 → 배정", estimatedDays: 45, description: "서류 제출 후 점수 심사, 차수별 배정 결과 통보" },
      { stepName: "근로계약 체결", estimatedDays: 18, description: "배정된 근로자와 표준근로계약서 체결" },
      { stepName: "입국 및 취업교육", estimatedDays: 45, description: "비자 발급 → 입국 → 취업교육(20시간) 이수" },
    ],
  },
  aiInsights: {
    overallVerdict:
      "귀사는 현재 고용 한도(16명)를 모두 사용하고 있어 추가 채용이 불가합니다. 한도를 늘리려면 내국인 피보험자 수를 증가시키거나, 기존 외국인 근로자의 출국/사업장 변경 후 신청해야 합니다.",
    limitInsight: "내국인 33명 기준 고용 한도 16명이며, 현재 16명 전부 사용 중입니다.",
    scoringInsight: "점수 시뮬레이션은 참고용입니다. 한도 확보가 우선입니다.",
    quotaInsight: "쿼터에 여유가 있더라도 한도 초과 시 신청 자체가 불가합니다.",
    timelineInsight: "한도 내에서만 신청이 가능합니다.",
    actionItems: [
      "내국인 채용 확대: 7명 이상 추가 채용 시 외국인 3명 고용 가능",
      "기존 근로자 관리: 계약 만료 외국인 출국 후 신규 신청 가능",
      "재고용 검토: 기존 근로자 재고용은 신규 배정 없이도 가능",
      "고용센터 상담 예약하기",
    ],
    disclaimer:
      "본 서비스는 법률 자문이 아닌 관리 보조 도구입니다. 실제 고용허가 발급 여부는 관할 고용센터의 심사에 따라 달라질 수 있습니다.",
  },
  createdAt: "2026-03-30T14:45:00Z",
};
