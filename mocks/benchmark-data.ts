import type { BenchmarkResponse } from "@/types/benchmark";

export const mockBenchmarkResponse: BenchmarkResponse = {
  id: 1,
  companyId: 1,
  analyzedAt: "2026-04-11T09:00:00Z",

  managementScore: 80,
  aiReport:
    "귀사의 관리 수준 점수는 **80점**입니다.\n\n" +
    "**임금 포지셔닝:** 귀사 E-9 평균 월임금 260만원은 전국 E-9의 " +
    "200~300만원 구간(68.8%)에 해당합니다.\n\n" +
    "**고용 안정성:** 최근 1년 이직률 12.5%(퇴사 3명/외국인 24명)입니다. " +
    "전국 E-9 근로자 중 10.8%가 이직을 희망하고 있으며, " +
    "그 주된 사유는 임금(24.5%)입니다. 임금 경쟁력은 별도로 점검이 권장됩니다.\n\n" +
    "**관리 수준:** 10개 항목 중 8개 충족(80점). " +
    "안전교육 실시 기록과 표준근로계약서 갱신이 필요합니다.\n\n" +
    "*본 서비스는 법률 자문이 아닌 관리 보조 도구입니다.*",

  wageAnalysis: {
    companyAvgWage: 260,
    visaType: "E-9",
    distribution: {
      under100: 0,
      from100to200: 2,
      from200to300: 221,
      over300: 98,
    },
    companyBracket: "200~300만원",
  },

  stabilityAnalysis: {
    turnoverRate: 12.5,
    terminationCount: 3,
    foreignWorkerCount: 24,
    terminationReasons: {
      lowWage: 24.5,
      companyIssue: 23.1,
      dangerous: 13.9,
      betterJob: 10.2,
      environment: 6.4,
      wageDelay: 5.4,
      friend: 3.8,
      other: 12.7,
    },
  },

  managementCheck: {
    totalItems: 10,
    passedItems: 8,
    score: 80,
    items: [
      { category: "보험", label: "4대보험 전원 가입", passed: true, required: true },
      { category: "보험", label: "고용보험 자격 취득 신고 완료", passed: true, required: true },
      { category: "계약", label: "표준근로계약서 작성", passed: true, required: true },
      { category: "계약", label: "근로계약 갱신 기한 준수", passed: false, required: true },
      { category: "안전", label: "안전보건교육 실시", passed: false, required: true },
      { category: "안전", label: "산업재해 예방 조치", passed: true, required: true },
      { category: "복지", label: "기숙사 또는 주거 지원", passed: true, required: false },
      { category: "복지", label: "통역 지원 체계", passed: true, required: false },
      { category: "신고", label: "외국인 고용 변동 신고", passed: true, required: true },
      { category: "신고", label: "비자 만료 전 연장 신청", passed: true, required: true },
    ],
  },

  positioningAnalysis: {
    region: "경기도",
    industryCategory: "식료품제조업",
    regionalTotal: 245000,
    industryTotal: 92386,
    companyForeignWorkerCount: 12,
    companyShare: 0.013,
    sizeCategory: "소규모",
  },
};

export const mockBenchmarkEmpty: BenchmarkResponse = {
  id: 2,
  companyId: 1,
  analyzedAt: "2026-04-10T09:00:00Z",
  managementScore: 80,
  aiReport:
    "귀사의 관리 수준 점수는 **80점**입니다.\n\n" +
    "임금 및 고용 안정성 데이터가 입력되지 않아 해당 진단은 생략되었습니다.\n\n" +
    "*사업장 정보에서 평균 월임금과 퇴사 인원을 입력하시면 더 상세한 진단을 받으실 수 있습니다.*",
  wageAnalysis: null,
  stabilityAnalysis: null,
  managementCheck: {
    totalItems: 10,
    passedItems: 8,
    score: 80,
    items: [
      { category: "보험", label: "4대보험 전원 가입", passed: true, required: true },
      { category: "보험", label: "고용보험 자격 취득 신고 완료", passed: true, required: true },
      { category: "계약", label: "표준근로계약서 작성", passed: true, required: true },
      { category: "계약", label: "근로계약 갱신 기한 준수", passed: false, required: true },
      { category: "안전", label: "안전보건교육 실시", passed: false, required: true },
      { category: "안전", label: "산업재해 예방 조치", passed: true, required: true },
      { category: "복지", label: "기숙사 또는 주거 지원", passed: true, required: false },
      { category: "복지", label: "통역 지원 체계", passed: true, required: false },
      { category: "신고", label: "외국인 고용 변동 신고", passed: true, required: true },
      { category: "신고", label: "비자 만료 전 연장 신청", passed: true, required: true },
    ],
  },
  positioningAnalysis: {
    region: "경기도",
    industryCategory: "식료품제조업",
    regionalTotal: 245000,
    industryTotal: 92386,
    companyForeignWorkerCount: 12,
    companyShare: 0.013,
    sizeCategory: "소규모",
  },
};

export const mockBenchmarkList: BenchmarkResponse[] = [
  mockBenchmarkResponse,
  { ...mockBenchmarkEmpty, id: 2 },
  {
    ...mockBenchmarkResponse,
    id: 3,
    analyzedAt: "2026-03-15T09:00:00Z",
    managementScore: 70,
    managementCheck: {
      ...mockBenchmarkResponse.managementCheck,
      passedItems: 7,
      score: 70,
      items: mockBenchmarkResponse.managementCheck.items.map((item, i) =>
        i === 5 ? { ...item, passed: false } : item,
      ),
    },
  },
];
