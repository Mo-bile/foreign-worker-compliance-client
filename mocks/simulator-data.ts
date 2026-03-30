import type { SimulationResultResponse } from "@/types/simulator";

// ─── Mock 1: 한도 이내 (Within Quota) ────────────────────────────
export const mockWithinQuotaResponse: SimulationResultResponse = {
  id: 1,
  companyId: 1,
  desiredWorkers: 3,
  desiredTiming: "2026_Q2",
  preferredNationality: "VIETNAM",
  employmentLimit: {
    domesticInsuredCount: 33,
    baseLimit: 14,
    additionalBonuses: [{ reason: "비수도권 우대", additionalCount: 2 }],
    totalLimit: 16,
    currentForeignWorkerCount: 12,
    remainingCapacity: 4,
    limitExceeded: false,
    whatIfScenarios: [],
  },
  scoring: {
    appliedBonusItems: [
      { code: "DEPOPULATION_AREA", label: "인구감소지역 소재 사업장", score: 5, applied: true, isDeduction: false },
      { code: "LABOR_LAW_COMPLIANCE", label: "최근 2년간 노동관계법 위반 없음", score: 3, applied: true, isDeduction: false },
    ],
    availableBonusItems: [
      { code: "PREMIUM_DORMITORY", label: "우수 기숙사 제공", score: 5, applied: false, isDeduction: false },
      { code: "NEW_WORKPLACE", label: "외국인 고용이 처음인 사업장", score: 3, applied: false, isDeduction: false },
    ],
    totalBonusScore: 8,
    estimatedScore: 68,
    maxPossibleScore: 84,
  },
  quotaStatus: {
    industry: "식료품제조업",
    currentRound: "2026년 2차 (4~6월)",
    roundAllocation: 12500,
    industryAllocation: 2250,
    roundHistory: [
      { round: "2025년 5차", allocation: 10200, industryAllocation: 1836, competitionRate: 1.8, isCurrent: false, isFuture: false },
      { round: "2026년 1차", allocation: 11800, industryAllocation: 2124, competitionRate: 1.6, isCurrent: false, isFuture: false },
      { round: "2026년 2차 (현재)", allocation: 12500, industryAllocation: 2250, competitionRate: null, isCurrent: true, isFuture: false },
      { round: "2026년 3차 (예정)", allocation: 0, industryAllocation: 0, competitionRate: null, isCurrent: false, isFuture: true },
    ],
    industryTrend:
      "식료품제조업은 최근 3차수 연속 배정 비율 증가 추세 (16% → 18%). 전차수 대비 경쟁률 소폭 완화(1.8→1.6). 이번 차수에서 지원 시 유리한 시점입니다.",
  },
  timeline: {
    preferredNationality: "VIETNAM",
    estimatedMonths: 4,
    steps: [
      { step: 1, title: "내국인 구인노력", description: "워크넷 등록 후 14일 구인노력 의무 이행", duration: "14일" },
      { step: 2, title: "고용허가 신청 → 배정", description: "서류 제출 후 점수 심사, 차수별 배정 결과 통보", duration: "1~2개월" },
      { step: 3, title: "근로계약 체결", description: "배정된 근로자와 표준근로계약서 체결", duration: "2~3주" },
      { step: 4, title: "입국 및 취업교육", description: "비자 발급 → 입국 → 취업교육(20시간) 이수", duration: "1~2개월" },
    ],
    nationalityComparison: [
      { nationality: "베트남", flag: "🇻🇳", avgMonths: 4, note: "수요 최다, 대기 시간 상대적으로 김" },
      { nationality: "캄보디아", flag: "🇰🇭", avgMonths: 3.5, note: "" },
      { nationality: "인도네시아", flag: "🇮🇩", avgMonths: 3.5, note: "" },
      { nationality: "필리핀", flag: "🇵🇭", avgMonths: 3, note: "송출 절차 비교적 빠름" },
      { nationality: "네팔", flag: "🇳🇵", avgMonths: 4.5, note: "송출 절차 상대적으로 길어질 수 있음" },
      { nationality: "미얀마", flag: "🇲🇲", avgMonths: 4, note: "정세에 따라 변동 가능" },
      { nationality: "무관 (미지정)", flag: "🌐", avgMonths: 3, note: "가장 빠른 배정 가능" },
    ],
  },
  aiInsights: {
    overallVerdict:
      "귀사는 현재 고용 한도(16명) 내에서 3명 추가 채용이 가능합니다. 예상 배정 점수 68점은 상위 약 30% 수준으로, <strong>배정 가능성이 높은 편입니다</strong>. 다만 점수 경쟁이 심한 차수에서는 탈락 가능성도 있으므로, 우수 기숙사 제공(+5점)으로 점수를 개선하시는 것을 권장합니다.",
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
  desiredTiming: "2026_Q2",
  preferredNationality: "VIETNAM",
  employmentLimit: {
    domesticInsuredCount: 33,
    baseLimit: 14,
    additionalBonuses: [{ reason: "비수도권 우대", additionalCount: 2 }],
    totalLimit: 16,
    currentForeignWorkerCount: 16,
    remainingCapacity: 0,
    limitExceeded: true,
    whatIfScenarios: [
      { domesticInsuredCount: 33, delta: 0, newLimit: 16, remainingCapacity: 0, feasibility: "IMPOSSIBLE" },
      { domesticInsuredCount: 36, delta: 3, newLimit: 17, remainingCapacity: 1, feasibility: "INSUFFICIENT" },
      { domesticInsuredCount: 40, delta: 7, newLimit: 19, remainingCapacity: 3, feasibility: "POSSIBLE" },
      { domesticInsuredCount: 45, delta: 12, newLimit: 22, remainingCapacity: 6, feasibility: "SURPLUS" },
    ],
  },
  scoring: {
    appliedBonusItems: [
      { code: "DEPOPULATION_AREA", label: "인구감소지역 소재 사업장", score: 5, applied: true, isDeduction: false },
      { code: "LABOR_LAW_COMPLIANCE", label: "최근 2년간 노동관계법 위반 없음", score: 3, applied: true, isDeduction: false },
    ],
    availableBonusItems: [
      { code: "PREMIUM_DORMITORY", label: "우수 기숙사 제공", score: 5, applied: false, isDeduction: false },
      { code: "NEW_WORKPLACE", label: "외국인 고용이 처음인 사업장", score: 3, applied: false, isDeduction: false },
    ],
    totalBonusScore: 8,
    estimatedScore: 68,
    maxPossibleScore: 84,
  },
  quotaStatus: {
    industry: "식료품제조업",
    currentRound: "2026년 2차 (4~6월)",
    roundAllocation: 12500,
    industryAllocation: 2250,
    roundHistory: [
      { round: "2025년 5차", allocation: 10200, industryAllocation: 1836, competitionRate: 1.8, isCurrent: false, isFuture: false },
      { round: "2026년 1차", allocation: 11800, industryAllocation: 2124, competitionRate: 1.6, isCurrent: false, isFuture: false },
      { round: "2026년 2차 (현재)", allocation: 12500, industryAllocation: 2250, competitionRate: null, isCurrent: true, isFuture: false },
      { round: "2026년 3차 (예정)", allocation: 0, industryAllocation: 0, competitionRate: null, isCurrent: false, isFuture: true },
    ],
    industryTrend:
      "식료품제조업은 최근 3차수 연속 배정 비율 증가 추세 (16% → 18%). 전차수 대비 경쟁률 소폭 완화(1.8→1.6).",
  },
  timeline: {
    preferredNationality: "VIETNAM",
    estimatedMonths: 4,
    steps: [
      { step: 1, title: "내국인 구인노력", description: "워크넷 등록 후 14일 구인노력 의무 이행", duration: "14일" },
      { step: 2, title: "고용허가 신청 → 배정", description: "서류 제출 후 점수 심사, 차수별 배정 결과 통보", duration: "1~2개월" },
      { step: 3, title: "근로계약 체결", description: "배정된 근로자와 표준근로계약서 체결", duration: "2~3주" },
      { step: 4, title: "입국 및 취업교육", description: "비자 발급 → 입국 → 취업교육(20시간) 이수", duration: "1~2개월" },
    ],
    nationalityComparison: [
      { nationality: "베트남", flag: "🇻🇳", avgMonths: 4, note: "수요 최다, 대기 시간 상대적으로 김" },
      { nationality: "캄보디아", flag: "🇰🇭", avgMonths: 3.5, note: "" },
      { nationality: "인도네시아", flag: "🇮🇩", avgMonths: 3.5, note: "" },
      { nationality: "필리핀", flag: "🇵🇭", avgMonths: 3, note: "송출 절차 비교적 빠름" },
      { nationality: "네팔", flag: "🇳🇵", avgMonths: 4.5, note: "송출 절차 상대적으로 길어질 수 있음" },
      { nationality: "미얀마", flag: "🇲🇲", avgMonths: 4, note: "정세에 따라 변동 가능" },
      { nationality: "무관 (미지정)", flag: "🌐", avgMonths: 3, note: "가장 빠른 배정 가능" },
    ],
  },
  aiInsights: {
    overallVerdict:
      "귀사는 현재 고용 한도(16명)를 모두 사용하고 있어 <strong>추가 채용이 불가합니다</strong>. 한도를 늘리려면 내국인 피보험자 수를 증가시키거나, 기존 외국인 근로자의 출국/사업장 변경 후 신청해야 합니다.",
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
