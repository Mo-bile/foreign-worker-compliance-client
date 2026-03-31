# BFF 매핑 BE 실응답 정합 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** BE 실응답 구조에 맞춰 시뮬레이터 BFF 매핑 레이어를 일괄 재정렬한다.

**Architecture:** BE 응답 타입을 실제 API shape에 맞추고, FE display 타입은 컴포넌트 안정성을 위해 최소 변경한다. Transform 레이어가 BE→FE 매핑을 전담하며, 컴포넌트 변경은 QuotaSection(연도별 축소)과 TimelineSection(국적비교 제거) 두 곳에 집중된다.

**Tech Stack:** TypeScript, Vitest, React, Next.js 16, DOMPurify, MSW

---

## 파일 배치표

### 수정 (전면 재작성)

| 파일 | 변경 |
|------|------|
| `types/simulator.ts` | BE 응답 타입 전면 교체 (필드명 + 구조), FE display 타입 일부 변경 |
| `mocks/simulator-data.ts` | BE 실응답 shape에 맞춰 2개 mock 재작성 |
| `lib/transforms/simulation-transform.ts` | 새 BE 타입 매핑, buildQuota/buildTimeline/buildVerdict/buildWhatIf 재작성 |
| `components/simulator/quota-section.tsx` | 차수별 → 연도별 테이블, industryTrend 삭제 |
| `components/simulator/timeline-section.tsx` | nationalityComparison 테이블 + 하이라이트 박스 삭제 |
| `app/api/simulations/route.ts` | BE 응답 구조 검증 키 변경 |
| `mocks/handlers.ts` | mock data import 참조만 (구조 변경 자동 반영) |

### 테스트 수정

| 파일 | 변경 |
|------|------|
| `__tests__/types/simulator-types.test.ts` | BE 타입 fixture를 새 필드명으로 교체 |
| `__tests__/mocks/simulator-data.test.ts` | mock 구조 검증 업데이트 |
| `__tests__/lib/transforms/simulation-transform.test.ts` | quota/timeline/whatIf assertion 업데이트 |
| `__tests__/api/simulations-route.test.ts` | 변경 최소 (BE 응답 키만) |
| `__tests__/components/quota-section.test.tsx` | 신규 — 연도별 테이블 렌더링 검증 |
| `__tests__/components/timeline-section.test.tsx` | 신규 — dot-line 타임라인 렌더링, nationalityComparison 미렌더링 검증 |

### 변경 없음

| 파일 | 이유 |
|------|------|
| `SimulationRequest`, `simulationRequestSchema` | FE→BFF 요청 타입, BE 변경 무관 |
| `useSimulation` hook | 타입 참조만, 변경 불필요 |
| `SimulationForm`, `CollapsibleCard`, `RecommendationBox` | BE 타입 무관 |
| `ScoringSection`, `WhatIfSection`, `AiSummarySection` | display 타입 동일 |
| `VerdictCard` | additionalBonuses display shape 동일 (transform에서 계산) |
| `SimulatorPage` | 컴포넌트 props 변경은 하위에서 흡수 |

---

## 구현 단계

### Task 1: BE Response Types 재작성 (`types/simulator.ts`)

**Files:**
- Modify: `types/simulator.ts:48-151` (BE Response Types 섹션)
- Test: `__tests__/types/simulator-types.test.ts`

- [ ] **Step 1: 테스트 fixture를 새 BE 타입으로 업데이트 (RED)**

`__tests__/types/simulator-types.test.ts` — BE Response Type Shapes 섹션의 mock 객체를 새 BE 필드명으로 교체:

```typescript
// ─── BE Response Type Shapes (새 필드명) ──────────────────────────────────────

describe("SimulationResultResponse shape", () => {
  const mockAdditionalBonus: AdditionalBonusBE = {
    reason: "Priority industry bonus",
    ratePercent: 30,
    cappedByDomesticCount: true,
  };

  const mockWhatIfScenario: WhatIfScenarioBE = {
    additionalDomesticCount: 5,
    newDomesticTotal: 15,
    newBaseLimit: 7,
    newBaseLimitAfterCap: 7,
    newTotalLimit: 9,
    newRemainingCapacity: 3,
    feasibility: "POSSIBLE",
  };

  const mockEmploymentLimit: EmploymentLimitAnalysis = {
    domesticInsuredCount: 10,
    baseLimit: 5,
    doubleCap: null,
    baseLimitAfterCap: 5,
    additionalBonuses: [mockAdditionalBonus],
    additionalCount: 2,
    totalLimit: 7,
    cappedByDomesticCount: false,
    currentForeignWorkerCount: 3,
    remainingCapacity: 4,
    limitExceeded: false,
    whatIfScenarios: [mockWhatIfScenario],
  };

  const mockScoringBonusItem: ScoringBonusItemBE = {
    code: "PRIORITY_INDUSTRY",
    displayName: "우선 지원 업종",
    points: 5,
    applied: true,
  };

  const mockScoring: ScoringAnalysis = {
    appliedBonusItems: [mockScoringBonusItem],
    availableBonusItems: [],
    totalBonusScore: 5,
    totalDeductionScore: 0,
    estimatedScore: 72,
    maxPossibleScore: 100,
  };

  const mockQuotaHistoryItem: QuotaHistoryItem = {
    year: 2025,
    quotaCount: 36000,
    source: "도입계획",
  };

  const mockQuotaStatus: QuotaStatusResponseBE = {
    industry: "제조업",
    currentYearQuota: 38000,
    recentHistory: [mockQuotaHistoryItem],
  };

  const mockTimelineStep: TimelineStepBE = {
    stepName: "구인 신청",
    estimatedDays: 14,
    description: "고용센터에 구인 신청서 제출",
  };

  const mockTimeline: TimelineEstimateBE = {
    preferredNationality: "VIETNAM",
    estimatedMonths: 4,
    steps: [mockTimelineStep],
  };

  // aiInsights — 변경 없음
  const mockAiInsights: AiInsightsResponse = {
    overallVerdict: "허용 범위 내",
    limitInsight: "현재 고용 한도 내입니다.",
    scoringInsight: "점수가 상위 30%입니다.",
    quotaInsight: "쿼터 여유 있음.",
    timelineInsight: "약 4개월 소요 예상.",
    actionItems: ["서류 준비를 서두르세요."],
    disclaimer: "이 결과는 참고용입니다.",
  };

  const mockResult: SimulationResultResponse = {
    id: 1,
    companyId: 42,
    desiredWorkers: 5,
    desiredTiming: "2026-Q3",
    preferredNationality: "VIETNAM",
    domesticInsuredCount: 10,
    employmentLimitAnalysis: mockEmploymentLimit,
    scoringAnalysis: mockScoring,
    quotaStatus: mockQuotaStatus,
    timelineEstimate: mockTimeline,
    aiInsights: mockAiInsights,
    createdAt: "2026-03-30T00:00:00Z",
  };

  it("has numeric id and companyId", () => {
    expect(typeof mockResult.id).toBe("number");
    expect(typeof mockResult.companyId).toBe("number");
  });

  it("has string desiredTiming and createdAt", () => {
    expect(typeof mockResult.desiredTiming).toBe("string");
    expect(typeof mockResult.createdAt).toBe("string");
  });

  it("has top-level domesticInsuredCount", () => {
    expect(typeof mockResult.domesticInsuredCount).toBe("number");
  });

  it("allows preferredNationality to be null", () => {
    const withNull: SimulationResultResponse = { ...mockResult, preferredNationality: null };
    expect(withNull.preferredNationality).toBeNull();
  });

  describe("employmentLimitAnalysis sub-object", () => {
    it("has required numeric fields including new ones", () => {
      const el = mockResult.employmentLimitAnalysis;
      expect(typeof el.domesticInsuredCount).toBe("number");
      expect(typeof el.baseLimit).toBe("number");
      expect(typeof el.baseLimitAfterCap).toBe("number");
      expect(typeof el.additionalCount).toBe("number");
      expect(typeof el.totalLimit).toBe("number");
      expect(typeof el.currentForeignWorkerCount).toBe("number");
      expect(typeof el.remainingCapacity).toBe("number");
    });

    it("allows doubleCap to be null", () => {
      expect(mockResult.employmentLimitAnalysis.doubleCap).toBeNull();
    });

    it("has boolean fields", () => {
      expect(typeof mockResult.employmentLimitAnalysis.limitExceeded).toBe("boolean");
      expect(typeof mockResult.employmentLimitAnalysis.cappedByDomesticCount).toBe("boolean");
    });

    it("additionalBonuses have ratePercent and cappedByDomesticCount", () => {
      const bonus = mockResult.employmentLimitAnalysis.additionalBonuses[0];
      expect(typeof bonus.reason).toBe("string");
      expect(typeof bonus.ratePercent).toBe("number");
      expect(typeof bonus.cappedByDomesticCount).toBe("boolean");
    });

    it("whatIfScenarios have all new required fields", () => {
      const scenario = mockResult.employmentLimitAnalysis.whatIfScenarios[0];
      expect(typeof scenario.additionalDomesticCount).toBe("number");
      expect(typeof scenario.newDomesticTotal).toBe("number");
      expect(typeof scenario.newBaseLimit).toBe("number");
      expect(typeof scenario.newBaseLimitAfterCap).toBe("number");
      expect(typeof scenario.newTotalLimit).toBe("number");
      expect(typeof scenario.newRemainingCapacity).toBe("number");
      expect(["IMPOSSIBLE", "INSUFFICIENT", "POSSIBLE", "SURPLUS"]).toContain(scenario.feasibility);
    });
  });

  describe("scoringAnalysis sub-object", () => {
    it("has required numeric score fields including totalDeductionScore", () => {
      const s = mockResult.scoringAnalysis;
      expect(typeof s.totalBonusScore).toBe("number");
      expect(typeof s.totalDeductionScore).toBe("number");
      expect(typeof s.estimatedScore).toBe("number");
      expect(typeof s.maxPossibleScore).toBe("number");
    });

    it("bonus items use displayName and points", () => {
      const item = mockResult.scoringAnalysis.appliedBonusItems[0];
      expect(typeof item.code).toBe("string");
      expect(typeof item.displayName).toBe("string");
      expect(typeof item.points).toBe("number");
      expect(typeof item.applied).toBe("boolean");
    });
  });

  describe("quotaStatus sub-object", () => {
    it("has industry and currentYearQuota", () => {
      expect(typeof mockResult.quotaStatus.industry).toBe("string");
      expect(typeof mockResult.quotaStatus.currentYearQuota).toBe("number");
    });

    it("recentHistory items have year, quotaCount, source", () => {
      const item = mockResult.quotaStatus.recentHistory[0];
      expect(typeof item.year).toBe("number");
      expect(typeof item.quotaCount).toBe("number");
      expect(typeof item.source).toBe("string");
    });
  });

  describe("timelineEstimate sub-object", () => {
    it("has estimatedMonths as a number", () => {
      expect(typeof mockResult.timelineEstimate.estimatedMonths).toBe("number");
    });

    it("steps have stepName and estimatedDays", () => {
      const step = mockResult.timelineEstimate.steps[0];
      expect(typeof step.stepName).toBe("string");
      expect(typeof step.estimatedDays).toBe("number");
      expect(typeof step.description).toBe("string");
    });
  });

  // aiInsights — 기존 테스트 유지 (구조 변경 없음)
  describe("aiInsights sub-object", () => {
    it("has all required string insight fields", () => {
      const ai = mockResult.aiInsights;
      expect(typeof ai.overallVerdict).toBe("string");
      expect(typeof ai.limitInsight).toBe("string");
      expect(typeof ai.scoringInsight).toBe("string");
      expect(typeof ai.quotaInsight).toBe("string");
      expect(typeof ai.timelineInsight).toBe("string");
      expect(typeof ai.disclaimer).toBe("string");
    });

    it("has actionItems as an array of strings", () => {
      const { actionItems } = mockResult.aiInsights;
      expect(Array.isArray(actionItems)).toBe(true);
      for (const item of actionItems) {
        expect(typeof item).toBe("string");
      }
    });
  });
});
```

Import 문도 새 타입 이름으로 교체:

```typescript
import type {
  SimulationVerdict,
  SimulationResultResponse,
  EmploymentLimitAnalysis,
  ScoringAnalysis,
  QuotaStatusResponseBE,
  TimelineEstimateBE,
  AiInsightsResponse,
  AdditionalBonusBE,
  WhatIfScenarioBE,
  ScoringBonusItemBE,
  QuotaHistoryItem,
  TimelineStepBE,
} from "@/types/simulator";
```

- [ ] **Step 2: 테스트 실행 — FAIL 확인**

Run: `npx vitest run __tests__/types/simulator-types.test.ts`
Expected: FAIL — 새 타입이 아직 없음

- [ ] **Step 3: BE Response Types 구현**

`types/simulator.ts`의 BE Response Types 섹션(line 48~151)을 아래로 교체:

```typescript
// ─── BE Response Types (실제 API shape) ──────────────────

export interface AdditionalBonusBE {
  readonly reason: string;
  readonly ratePercent: number;
  readonly cappedByDomesticCount: boolean;
}

export type WhatIfFeasibility = "IMPOSSIBLE" | "INSUFFICIENT" | "POSSIBLE" | "SURPLUS";

export interface WhatIfScenarioBE {
  readonly additionalDomesticCount: number;
  readonly newDomesticTotal: number;
  readonly newBaseLimit: number;
  readonly newBaseLimitAfterCap: number;
  readonly newTotalLimit: number;
  readonly newRemainingCapacity: number;
  readonly feasibility: WhatIfFeasibility;
}

export interface EmploymentLimitAnalysis {
  readonly domesticInsuredCount: number;
  readonly baseLimit: number;
  readonly doubleCap: number | null;
  readonly baseLimitAfterCap: number;
  readonly additionalBonuses: readonly AdditionalBonusBE[];
  readonly additionalCount: number;
  readonly totalLimit: number;
  readonly cappedByDomesticCount: boolean;
  readonly currentForeignWorkerCount: number;
  readonly remainingCapacity: number;
  readonly limitExceeded: boolean;
  readonly whatIfScenarios: readonly WhatIfScenarioBE[];
}

export interface ScoringBonusItemBE {
  readonly code: string;
  readonly displayName: string;
  readonly points: number;
  readonly applied: boolean;
}

export interface ScoringAnalysis {
  readonly appliedBonusItems: readonly ScoringBonusItemBE[];
  readonly availableBonusItems: readonly ScoringBonusItemBE[];
  readonly totalBonusScore: number;
  readonly totalDeductionScore: number;
  readonly estimatedScore: number;
  readonly maxPossibleScore: number;
}

export interface QuotaHistoryItem {
  readonly year: number;
  readonly quotaCount: number;
  readonly source: string;
}

export interface QuotaStatusResponseBE {
  readonly industry: string;
  readonly currentYearQuota: number;
  readonly recentHistory: readonly QuotaHistoryItem[];
}

export interface TimelineStepBE {
  readonly stepName: string;
  readonly estimatedDays: number;
  readonly description: string;
}

export interface TimelineEstimateBE {
  readonly preferredNationality: string | null;
  readonly estimatedMonths: number;
  readonly steps: readonly TimelineStepBE[];
}

export interface AiInsightsResponse {
  readonly overallVerdict: string;
  readonly limitInsight: string;
  readonly scoringInsight: string;
  readonly quotaInsight: string;
  readonly timelineInsight: string;
  readonly actionItems: readonly string[];
  readonly disclaimer: string;
}

export interface SimulationResultResponse {
  readonly id: number;
  readonly companyId: number;
  readonly desiredWorkers: number;
  readonly desiredTiming: string;
  readonly preferredNationality: string | null;
  readonly domesticInsuredCount: number;
  readonly employmentLimitAnalysis: EmploymentLimitAnalysis;
  readonly scoringAnalysis: ScoringAnalysis;
  readonly quotaStatus: QuotaStatusResponseBE;
  readonly timelineEstimate: TimelineEstimateBE;
  readonly aiInsights: AiInsightsResponse;
  readonly createdAt: string;
}
```

삭제되는 타입: `AdditionalBonus`, `WhatIfScenario`, `EmploymentLimitResponse`, `ScoringBonusItem`, `ScoringResponse`, `RoundHistoryItem`, `QuotaStatusResponse`, `TimelineStep`, `NationalityDuration`, `TimelineResponse`

- [ ] **Step 4: 테스트 실행 — PASS 확인**

Run: `npx vitest run __tests__/types/simulator-types.test.ts`
Expected: PASS (타입 테스트 통과)

- [ ] **Step 5: 커밋**

```bash
git add types/simulator.ts __tests__/types/simulator-types.test.ts
git commit -m "refactor: BE 응답 타입을 실제 API shape에 맞춰 재정렬"
```

---

### Task 2: FE Display Types 변경 (`types/simulator.ts`)

**Files:**
- Modify: `types/simulator.ts:153-253` (FE Display Types 섹션)

이 Task에서는 테스트가 없다 — display 타입은 컴포넌트/transform 테스트에서 검증된다.

- [ ] **Step 1: FE Display Types 수정**

`types/simulator.ts`의 FE Display Types 섹션에서 다음을 변경:

**1) `AdditionalBonusDisplay` 추가 (VerdictDisplayData용):**
```typescript
export interface AdditionalBonusDisplay {
  readonly reason: string;
  readonly additionalCount: number;
}
```

**2) `VerdictDisplayData.additionalBonuses` 타입 변경:**
```typescript
readonly additionalBonuses: readonly AdditionalBonusDisplay[];
```

**3) `QuotaRoundRow` → `QuotaYearRow` 교체, `QuotaDisplayData` 재작성:**
```typescript
export interface QuotaYearRow {
  readonly year: number;
  readonly quotaCount: string;
  readonly source: string;
  readonly isCurrent: boolean;
}

export interface QuotaDisplayData {
  readonly industry: string;
  readonly currentYearQuota: string;
  readonly yearRows: readonly QuotaYearRow[];
}
```

**4) `TimelineDisplayData` 재작성, `TimelineStepDisplay` 추가:**
```typescript
export interface TimelineStepDisplay {
  readonly title: string;
  readonly duration: string;
  readonly description: string;
}

export interface TimelineDisplayData {
  readonly estimatedMonths: number;
  readonly preferredNationality: string | null;
  readonly steps: readonly TimelineStepDisplay[];
}
```

삭제되는 FE 타입: `QuotaRoundRow`, 기존 `QuotaDisplayData` 필드들 (`currentRound`, `roundAllocation`, `industryAllocationText`, `roundRows`, `industryTrend`), 기존 `TimelineDisplayData`의 `nationalityComparison` 필드

- [ ] **Step 2: 타입 체크 (컴파일 오류 확인)**

Run: `npx tsc --noEmit 2>&1 | head -30`
Expected: FAIL — mock data, transform, 컴포넌트에서 컴파일 에러 (예상대로, 순차적으로 수정할 예정)

- [ ] **Step 3: 커밋**

```bash
git add types/simulator.ts
git commit -m "refactor: FE display 타입 변경 (QuotaDisplayData 연도별, TimelineDisplayData 간소화)"
```

---

### Task 3: Mock Data 재작성 (`mocks/simulator-data.ts`)

**Files:**
- Modify: `mocks/simulator-data.ts`
- Test: `__tests__/mocks/simulator-data.test.ts`

- [ ] **Step 1: mock 구조 검증 테스트 업데이트 (RED)**

`__tests__/mocks/simulator-data.test.ts`를 새 BE shape에 맞춰 교체:

```typescript
import { describe, it, expect } from "vitest";
import { mockWithinQuotaResponse, mockExceededResponse } from "@/mocks/simulator-data";

describe("mockWithinQuotaResponse", () => {
  it("필수_최상위_필드를_모두_갖는다", () => {
    expect(mockWithinQuotaResponse).toHaveProperty("employmentLimitAnalysis");
    expect(mockWithinQuotaResponse).toHaveProperty("scoringAnalysis");
    expect(mockWithinQuotaResponse).toHaveProperty("quotaStatus");
    expect(mockWithinQuotaResponse).toHaveProperty("timelineEstimate");
    expect(mockWithinQuotaResponse).toHaveProperty("aiInsights");
    expect(mockWithinQuotaResponse).toHaveProperty("domesticInsuredCount");
  });

  it("한도_이내 조건: limitExceeded가_false이다", () => {
    expect(mockWithinQuotaResponse.employmentLimitAnalysis.limitExceeded).toBe(false);
  });

  it("한도_이내 조건: remainingCapacity가_0보다_크다", () => {
    expect(mockWithinQuotaResponse.employmentLimitAnalysis.remainingCapacity).toBeGreaterThan(0);
  });

  it("한도_이내 조건: whatIfScenarios가_빈_배열이다", () => {
    expect(mockWithinQuotaResponse.employmentLimitAnalysis.whatIfScenarios).toHaveLength(0);
  });

  it("scoringAnalysis_필드가_올바른_구조를_갖는다", () => {
    const { scoringAnalysis } = mockWithinQuotaResponse;
    expect(scoringAnalysis).toHaveProperty("appliedBonusItems");
    expect(scoringAnalysis).toHaveProperty("availableBonusItems");
    expect(scoringAnalysis).toHaveProperty("totalBonusScore");
    expect(scoringAnalysis).toHaveProperty("totalDeductionScore");
    expect(scoringAnalysis).toHaveProperty("estimatedScore");
    expect(scoringAnalysis).toHaveProperty("maxPossibleScore");
  });

  it("scoringAnalysis_bonusItem이_displayName과_points를_사용한다", () => {
    const item = mockWithinQuotaResponse.scoringAnalysis.appliedBonusItems[0];
    expect(item).toHaveProperty("displayName");
    expect(item).toHaveProperty("points");
    expect(item).not.toHaveProperty("label");
    expect(item).not.toHaveProperty("score");
  });

  it("quotaStatus_필드가_연도별_구조를_갖는다", () => {
    const { quotaStatus } = mockWithinQuotaResponse;
    expect(quotaStatus).toHaveProperty("industry");
    expect(quotaStatus).toHaveProperty("currentYearQuota");
    expect(quotaStatus).toHaveProperty("recentHistory");
    expect(quotaStatus).not.toHaveProperty("currentRound");
    expect(quotaStatus).not.toHaveProperty("roundAllocation");
  });

  it("timelineEstimate_필드가_올바른_구조를_갖는다", () => {
    const { timelineEstimate } = mockWithinQuotaResponse;
    expect(timelineEstimate).toHaveProperty("preferredNationality");
    expect(timelineEstimate).toHaveProperty("estimatedMonths");
    expect(timelineEstimate).toHaveProperty("steps");
    expect(timelineEstimate).not.toHaveProperty("nationalityComparison");
  });

  it("timelineEstimate_step이_stepName과_estimatedDays를_사용한다", () => {
    const step = mockWithinQuotaResponse.timelineEstimate.steps[0];
    expect(step).toHaveProperty("stepName");
    expect(step).toHaveProperty("estimatedDays");
    expect(step).not.toHaveProperty("step");
    expect(step).not.toHaveProperty("duration");
  });

  it("employmentLimitAnalysis_새_필드를_갖는다", () => {
    const el = mockWithinQuotaResponse.employmentLimitAnalysis;
    expect(el).toHaveProperty("baseLimitAfterCap");
    expect(el).toHaveProperty("additionalCount");
    expect(el).toHaveProperty("cappedByDomesticCount");
  });

  it("additionalBonuses가_ratePercent를_사용한다", () => {
    const bonus = mockWithinQuotaResponse.employmentLimitAnalysis.additionalBonuses[0];
    expect(bonus).toHaveProperty("ratePercent");
    expect(bonus).toHaveProperty("cappedByDomesticCount");
    expect(bonus).not.toHaveProperty("additionalCount");
  });

  it("aiInsights_필드가_올바른_구조를_갖는다", () => {
    const { aiInsights } = mockWithinQuotaResponse;
    expect(aiInsights).toHaveProperty("overallVerdict");
    expect(aiInsights).toHaveProperty("limitInsight");
    expect(aiInsights).toHaveProperty("actionItems");
    expect(aiInsights).toHaveProperty("disclaimer");
  });
});

describe("mockExceededResponse", () => {
  it("한도_초과 조건: limitExceeded가_true이다", () => {
    expect(mockExceededResponse.employmentLimitAnalysis.limitExceeded).toBe(true);
  });

  it("한도_초과 조건: remainingCapacity가_0이다", () => {
    expect(mockExceededResponse.employmentLimitAnalysis.remainingCapacity).toBe(0);
  });

  it("한도_초과 조건: whatIfScenarios가_4개_항목을_갖는다", () => {
    expect(mockExceededResponse.employmentLimitAnalysis.whatIfScenarios).toHaveLength(4);
  });

  it("whatIfScenarios에_4가지_feasibility_값이_모두_존재한다", () => {
    const feasibilities = mockExceededResponse.employmentLimitAnalysis.whatIfScenarios.map(
      (s) => s.feasibility,
    );
    expect(feasibilities).toContain("IMPOSSIBLE");
    expect(feasibilities).toContain("INSUFFICIENT");
    expect(feasibilities).toContain("POSSIBLE");
    expect(feasibilities).toContain("SURPLUS");
  });

  it("whatIfScenarios가_새_필드명을_사용한다", () => {
    const scenario = mockExceededResponse.employmentLimitAnalysis.whatIfScenarios[0];
    expect(scenario).toHaveProperty("additionalDomesticCount");
    expect(scenario).toHaveProperty("newDomesticTotal");
    expect(scenario).toHaveProperty("newTotalLimit");
    expect(scenario).toHaveProperty("newRemainingCapacity");
    expect(scenario).not.toHaveProperty("delta");
    expect(scenario).not.toHaveProperty("newLimit");
  });
});
```

- [ ] **Step 2: 테스트 실행 — FAIL 확인**

Run: `npx vitest run __tests__/mocks/simulator-data.test.ts`
Expected: FAIL — mock data가 아직 이전 shape

- [ ] **Step 3: Mock data 구현**

`mocks/simulator-data.ts`를 BE 실응답 shape로 전면 재작성:

```typescript
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
    additionalBonuses: [{ reason: "비수도권 우대", ratePercent: 20, cappedByDomesticCount: false }],
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
    currentYearQuota: 38000,
    recentHistory: [
      { year: 2024, quotaCount: 34000, source: "제46차 외국인력정책위원회" },
      { year: 2025, quotaCount: 36000, source: "제47차 외국인력정책위원회" },
      { year: 2026, quotaCount: 38000, source: "제48차 외국인력정책위원회" },
    ],
  },
  timelineEstimate: {
    preferredNationality: "VIETNAM",
    estimatedMonths: 4,
    steps: [
      { stepName: "내국인 구인노력", estimatedDays: 14, description: "워크넷 등록 후 14일 구인노력 의무 이행" },
      { stepName: "고용허가서 신청", estimatedDays: 30, description: "관할 고용센터에 서류 제출 후 심사" },
      { stepName: "근로계약 체결", estimatedDays: 14, description: "EPS 시스템을 통한 근로계약 체결" },
      { stepName: "비자발급·입국", estimatedDays: 90, description: "사증발급인정서 → 비자 발급 → 입국" },
      { stepName: "취업교육", estimatedDays: 20, description: "입국 후 취업교육(20시간) 이수" },
    ],
  },
  aiInsights: {
    overallVerdict:
      "귀사는 현재 고용 한도(16명) 내에서 3명 추가 채용이 가능합니다. 예상 배정 점수 68점은 상위 약 30% 수준으로, <strong>배정 가능성이 높은 편입니다</strong>.",
    limitInsight: "내국인 33명 기준 고용 한도 16명 중 12명 사용, 잔여 4명입니다.",
    scoringInsight: "기본 60점 + 가점 8점 = 68점. 우수 기숙사 인증 시 73점(상위 ~20%)까지 향상 가능합니다.",
    quotaInsight: "식료품제조업 배정 비율이 증가 추세이며, 경쟁률은 완화되고 있습니다.",
    timelineInsight: "베트남 국적 선택 시 약 4개월 소요 예상입니다.",
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

// ─── Mock 2: 한도 초과 (Exceeded) ────────────────────────────
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
    additionalBonuses: [{ reason: "비수도권 우대", ratePercent: 20, cappedByDomesticCount: false }],
    additionalCount: 2,
    totalLimit: 16,
    cappedByDomesticCount: false,
    currentForeignWorkerCount: 16,
    remainingCapacity: 0,
    limitExceeded: true,
    whatIfScenarios: [
      { additionalDomesticCount: 0, newDomesticTotal: 33, newBaseLimit: 14, newBaseLimitAfterCap: 14, newTotalLimit: 16, newRemainingCapacity: 0, feasibility: "IMPOSSIBLE" },
      { additionalDomesticCount: 3, newDomesticTotal: 36, newBaseLimit: 15, newBaseLimitAfterCap: 15, newTotalLimit: 17, newRemainingCapacity: 1, feasibility: "INSUFFICIENT" },
      { additionalDomesticCount: 7, newDomesticTotal: 40, newBaseLimit: 17, newBaseLimitAfterCap: 17, newTotalLimit: 19, newRemainingCapacity: 3, feasibility: "POSSIBLE" },
      { additionalDomesticCount: 12, newDomesticTotal: 45, newBaseLimit: 19, newBaseLimitAfterCap: 19, newTotalLimit: 22, newRemainingCapacity: 6, feasibility: "SURPLUS" },
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
    currentYearQuota: 38000,
    recentHistory: [
      { year: 2024, quotaCount: 34000, source: "제46차 외국인력정책위원회" },
      { year: 2025, quotaCount: 36000, source: "제47차 외국인력정책위원회" },
      { year: 2026, quotaCount: 38000, source: "제48차 외국인력정책위원회" },
    ],
  },
  timelineEstimate: {
    preferredNationality: "VIETNAM",
    estimatedMonths: 4,
    steps: [
      { stepName: "내국인 구인노력", estimatedDays: 14, description: "워크넷 등록 후 14일 구인노력 의무 이행" },
      { stepName: "고용허가서 신청", estimatedDays: 30, description: "관할 고용센터에 서류 제출 후 심사" },
      { stepName: "근로계약 체결", estimatedDays: 14, description: "EPS 시스템을 통한 근로계약 체결" },
      { stepName: "비자발급·입국", estimatedDays: 90, description: "사증발급인정서 → 비자 발급 → 입국" },
      { stepName: "취업교육", estimatedDays: 20, description: "입국 후 취업교육(20시간) 이수" },
    ],
  },
  aiInsights: {
    overallVerdict:
      "귀사는 현재 고용 한도(16명)를 모두 사용하고 있어 <strong>추가 채용이 불가합니다</strong>.",
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
```

- [ ] **Step 4: 테스트 실행 — PASS 확인**

Run: `npx vitest run __tests__/mocks/simulator-data.test.ts`
Expected: PASS

- [ ] **Step 5: 커밋**

```bash
git add mocks/simulator-data.ts __tests__/mocks/simulator-data.test.ts
git commit -m "refactor: mock data를 BE 실응답 shape로 재작성"
```

---

### Task 4: Transform Layer 재작성 (`lib/transforms/simulation-transform.ts`)

**Files:**
- Modify: `lib/transforms/simulation-transform.ts`
- Test: `__tests__/lib/transforms/simulation-transform.test.ts`

- [ ] **Step 1: transform 테스트 업데이트 (RED)**

`__tests__/lib/transforms/simulation-transform.test.ts`에서 변경이 필요한 섹션:

**1) import 문 — 변경 없음 (mock data와 함수만 사용)**

**2) quota roundRows 섹션 → quota yearRows 섹션으로 교체:**

```typescript
// ─── Quota Year Rows ─────────────────────────────────────────────────────────

describe("quota yearRows 포맷", () => {
  const result = transformSimulationResult(mockWithinQuotaResponse);

  it("industry와 currentYearQuota가 올바르게 설정된다", () => {
    expect(result.quota.industry).toBe("식료품제조업");
    expect(result.quota.currentYearQuota).toBe("38,000명");
  });

  it("recentHistory를 yearRows로 변환한다", () => {
    const rows = result.quota.yearRows;
    expect(rows).toHaveLength(3);
  });

  it("각 yearRow가 올바른 형식이다", () => {
    const rows = result.quota.yearRows;
    expect(rows[0].year).toBe(2024);
    expect(rows[0].quotaCount).toBe("34,000명");
    expect(rows[0].source).toBe("제46차 외국인력정책위원회");
    expect(rows[0].isCurrent).toBe(false);
  });

  it("현재 연도 row의 isCurrent가 true이다", () => {
    // currentYear 기본값 = new Date().getFullYear() = 2026
    const result2026 = transformSimulationResult(mockWithinQuotaResponse);
    const currentRow = result2026.quota.yearRows.find((r) => r.year === 2026);
    expect(currentRow?.isCurrent).toBe(true);
  });

  it("quotaCount가 숫자 포맷(콤마)으로 표시된다", () => {
    const rows = result.quota.yearRows;
    expect(rows[2].quotaCount).toBe("38,000명");
  });
});
```

**3) whatIf 섹션의 delta assertion 변경 — mock 데이터의 필드명 변경으로 인해 domesticInsuredCount 조건도 변경:**

```typescript
// ─── whatIf ───────────────────────────────────────────────────────────────────

describe("whatIf", () => {
  it("WITHIN_QUOTA이면_whatIf가_null이다", () => {
    const result = transformSimulationResult(mockWithinQuotaResponse);
    expect(result.whatIf).toBeNull();
  });

  it("EXCEEDED이면_whatIf가_null이_아니다", () => {
    const result = transformSimulationResult(mockExceededResponse);
    expect(result.whatIf).not.toBeNull();
  });

  it("whatIf rows의_additionalDomesticCount_0은_현재로_표시한다", () => {
    const result = transformSimulationResult(mockExceededResponse);
    const rows = result.whatIf!.rows;
    const currentRow = rows.find((r) => r.domesticInsuredCount === 33);
    expect(currentRow?.delta).toBe("현재");
  });

  it("whatIf rows의_delta_양수는_+n명_형식으로_표시한다", () => {
    const result = transformSimulationResult(mockExceededResponse);
    const rows = result.whatIf!.rows;
    expect(rows[1].delta).toBe("+3명");
    expect(rows[2].delta).toBe("+7명");
    expect(rows[3].delta).toBe("+12명");
  });

  it("feasibilityLabel이_올바르게_매핑된다", () => {
    const result = transformSimulationResult(mockExceededResponse);
    const rows = result.whatIf!.rows;
    expect(rows[0].feasibilityLabel).toBe("불가");
    expect(rows[1].feasibilityLabel).toBe("부족");
    expect(rows[2].feasibilityLabel).toBe("가능");
    expect(rows[3].feasibilityLabel).toBe("여유");
  });

  it("minimumConditionText가 첫 번째 POSSIBLE 시나리오를 기반으로 생성된다", () => {
    const result = transformSimulationResult(mockExceededResponse);
    // POSSIBLE: newDomesticTotal=40, additionalDomesticCount=7
    expect(result.whatIf!.minimumConditionText).toContain("40명");
    expect(result.whatIf!.minimumConditionText).toContain("+7명");
  });

  it("EXCEEDED이지만_whatIfScenarios가_빈_배열이면_whatIf는_null이다", () => {
    const noScenarios = transformSimulationResult({
      ...mockExceededResponse,
      employmentLimitAnalysis: {
        ...mockExceededResponse.employmentLimitAnalysis,
        whatIfScenarios: [],
      },
    });
    expect(noScenarios.whatIf).toBeNull();
  });
});
```

**4) progressLevel 경계값 — mock spread의 필드명 변경:**

```typescript
describe("progressLevel 경계값", () => {
  const makeResult = (current: number, total: number) =>
    transformSimulationResult({
      ...mockWithinQuotaResponse,
      employmentLimitAnalysis: {
        ...mockWithinQuotaResponse.employmentLimitAnalysis,
        currentForeignWorkerCount: current,
        totalLimit: total,
        remainingCapacity: total - current,
        limitExceeded: false,
      },
    });
  // ... it() 블록은 동일
});
```

**5) totalLimit=0 edge cases — 동일하게 `employmentLimitAnalysis`로 변경**

**6) scoring rows — mock의 `displayName`/`points` 변경으로 transform이 알아서 매핑하므로 테스트 assertion은 동일 (label, score 텍스트)**

**7) scoring improvement with deductionCodes, scoring rows with deductionCodes — 동일 (assertion은 FE display 값)**

- [ ] **Step 2: 테스트 실행 — FAIL 확인**

Run: `npx vitest run __tests__/lib/transforms/simulation-transform.test.ts`
Expected: FAIL — transform 함수가 아직 이전 BE 타입 사용

- [ ] **Step 3: Transform 구현**

`lib/transforms/simulation-transform.ts` 전면 수정. 주요 변경점:

**Import 변경:**
```typescript
import type {
  SimulationResultResponse,
  SimulationResponse,
  SimulationVerdict,
  VerdictDisplayData,
  AdditionalBonusDisplay,
  ScoringDisplayData,
  ScoringTableRow,
  ScoringImprovementData,
  QuotaDisplayData,
  QuotaYearRow,
  TimelineDisplayData,
  TimelineStepDisplay,
  WhatIfDisplayData,
  WhatIfRow,
  WhatIfFeasibility,
  RecommendationDisplayData,
  RecommendationItem,
  EmploymentLimitAnalysis,
  ScoringAnalysis,
  QuotaStatusResponseBE,
  TimelineEstimateBE,
  AiInsightsResponse,
} from "@/types/simulator";
```

**buildVerdict — additionalBonuses 계산:**
```typescript
function buildVerdict(
  limit: EmploymentLimitAnalysis,
  desiredWorkers: number,
): VerdictDisplayData {
  // ... 기존 로직 유지, additionalBonuses만 변경:
  const additionalBonuses: readonly AdditionalBonusDisplay[] = limit.additionalBonuses.map((b) => ({
    reason: b.reason,
    additionalCount: Math.floor(limit.baseLimitAfterCap * b.ratePercent / 100),
  }));
  // ... return에 additionalBonuses 사용
}
```

**buildScoringRows — `displayName`→`label`, `points`→`score` 매핑:**
```typescript
function buildScoringRows(
  scoring: ScoringAnalysis,
  deductionCodes: ReadonlySet<string>,
): readonly ScoringTableRow[] {
  // ... item.displayName, item.points 사용
  for (const item of scoring.appliedBonusItems) {
    const isDeduction = deductionCodes.has(item.code);
    rows.push({
      label: item.displayName,
      score: isDeduction ? `-${item.points}점` : `+${item.points}점`,
      status: "✓",
      isDeduction,
    });
  }
  for (const item of scoring.availableBonusItems) {
    const isDeduction = deductionCodes.has(item.code);
    rows.push({
      label: item.displayName,
      score: "0점",
      status: "미해당",
      isDeduction,
    });
  }
  // ...
}
```

**buildScoringImprovement — `displayName`/`points` 매핑:**
```typescript
function buildScoringImprovement(
  scoring: ScoringAnalysis,
  deductionCodes: ReadonlySet<string>,
): ScoringImprovementData | null {
  const bonusCandidates = scoring.availableBonusItems.filter(
    (item) => !deductionCodes.has(item.code),
  );
  const bestAvailable = bonusCandidates.reduce<typeof scoring.availableBonusItems[number] | null>(
    (best, item) => (best === null || item.points > best.points ? item : best),
    null,
  );
  if (bestAvailable === null) return null;
  const improvedScore = scoring.estimatedScore + bestAvailable.points;
  return {
    currentScore: scoring.estimatedScore,
    currentPercentile: estimatePercentile(scoring.estimatedScore),
    improvedScore,
    improvedPercentile: estimatePercentile(improvedScore),
    improvementLabel: `${bestAvailable.displayName} 시`,
    improvementDescription: `${bestAvailable.displayName} 인증을 받으면 +${bestAvailable.points}점으로 배정 가능성이 크게 향상됩니다. 인증 기준은 관할 고용센터에 문의하세요.`,
  };
}
```

**buildQuota — 연도별 구조:**
```typescript
function buildQuota(
  quota: QuotaStatusResponseBE,
  currentYear: number = new Date().getFullYear(),
): QuotaDisplayData {
  const yearRows: QuotaYearRow[] = quota.recentHistory.map((h) => ({
    year: h.year,
    quotaCount: `${formatNumber(h.quotaCount)}명`,
    source: h.source,
    isCurrent: h.year === currentYear,
  }));

  return {
    industry: quota.industry,
    currentYearQuota: `${formatNumber(quota.currentYearQuota)}명`,
    yearRows,
  };
}
```

**buildTimeline — `stepName`/`estimatedDays` 매핑:**
```typescript
function formatDays(estimatedDays: number): string {
  if (estimatedDays >= 30) return `약 ${Math.round(estimatedDays / 30)}개월`;
  return `약 ${estimatedDays}일`;
}

function buildTimeline(timeline: TimelineEstimateBE): TimelineDisplayData {
  const steps: readonly TimelineStepDisplay[] = timeline.steps.map((s) => ({
    title: s.stepName,
    duration: formatDays(s.estimatedDays),
    description: s.description,
  }));

  return {
    estimatedMonths: timeline.estimatedMonths,
    preferredNationality: timeline.preferredNationality,
    steps,
  };
}
```

**buildWhatIf — 새 BE 필드명 매핑:**
```typescript
function buildWhatIf(limit: EmploymentLimitAnalysis): WhatIfDisplayData | null {
  if (!limit.limitExceeded) return null;
  if (limit.whatIfScenarios.length === 0) {
    console.warn("[buildWhatIf] limitExceeded=true but whatIfScenarios is empty");
    return null;
  }

  const rows: WhatIfRow[] = limit.whatIfScenarios.map((s) => ({
    domesticInsuredCount: s.newDomesticTotal,
    delta: s.additionalDomesticCount === 0 ? "현재" : `+${s.additionalDomesticCount}명`,
    newLimit: s.newTotalLimit,
    remainingCapacity: s.newRemainingCapacity,
    feasibility: s.feasibility,
    feasibilityLabel: FEASIBILITY_LABELS[s.feasibility] ?? s.feasibility,
  }));

  const minPossible = limit.whatIfScenarios.find(
    (s) => s.additionalDomesticCount > 0 && (s.feasibility === "POSSIBLE" || s.feasibility === "SURPLUS"),
  );

  const minimumConditionText = minPossible
    ? `내국인 피보험자를 현재 ${limit.domesticInsuredCount}명에서 ${minPossible.newDomesticTotal}명(+${minPossible.additionalDomesticCount}명)으로 늘리면 추가 채용이 가능해집니다.`
    : "현재 시나리오에서는 추가 채용이 어렵습니다.";

  return { rows, minimumConditionText };
}
```

**transformSimulationResult — 새 top-level 필드명:**
```typescript
export function transformSimulationResult(
  raw: SimulationResultResponse,
  deductionCodes: ReadonlySet<string> = new Set(),
): SimulationResponse {
  const { employmentLimitAnalysis, scoringAnalysis, quotaStatus, timelineEstimate, aiInsights } = raw;

  return {
    id: String(raw.id),
    verdict: buildVerdict(employmentLimitAnalysis, raw.desiredWorkers),
    scoring: buildScoring(scoringAnalysis, deductionCodes),
    quota: buildQuota(quotaStatus),
    timeline: buildTimeline(timelineEstimate),
    aiSummary: sanitize(aiInsights.overallVerdict),
    whatIf: buildWhatIf(employmentLimitAnalysis),
    recommendation: buildRecommendation(aiInsights, employmentLimitAnalysis.limitExceeded),
    disclaimer: aiInsights.disclaimer,
    createdAt: raw.createdAt,
  };
}
```

- [ ] **Step 4: 테스트 실행 — PASS 확인**

Run: `npx vitest run __tests__/lib/transforms/simulation-transform.test.ts`
Expected: PASS

- [ ] **Step 5: 커밋**

```bash
git add lib/transforms/simulation-transform.ts __tests__/lib/transforms/simulation-transform.test.ts
git commit -m "refactor: transform 레이어를 BE 실응답 필드명에 맞춰 재정렬"
```

---

### Task 5: QuotaSection 컴포넌트 재작성

**Files:**
- Modify: `components/simulator/quota-section.tsx`
- Create: `__tests__/components/quota-section.test.tsx`

- [ ] **Step 1: 컴포넌트 테스트 작성 (RED)**

`__tests__/components/quota-section.test.tsx`:

```typescript
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { QuotaSection } from "@/components/simulator/quota-section";
import type { QuotaDisplayData } from "@/types/simulator";

const mockData: QuotaDisplayData = {
  industry: "식료품제조업",
  currentYearQuota: "38,000명",
  yearRows: [
    { year: 2024, quotaCount: "34,000명", source: "제46차", isCurrent: false },
    { year: 2025, quotaCount: "36,000명", source: "제47차", isCurrent: false },
    { year: 2026, quotaCount: "38,000명", source: "제48차", isCurrent: true },
  ],
};

describe("QuotaSection", () => {
  it("업종과 금년 쿼터를 표시한다", () => {
    render(<QuotaSection data={mockData} defaultOpen />);
    expect(screen.getByText("식료품제조업")).toBeDefined();
    expect(screen.getByText("38,000명")).toBeDefined();
  });

  it("연도별 추이 테이블을 렌더링한다", () => {
    render(<QuotaSection data={mockData} defaultOpen />);
    expect(screen.getByText("2024년")).toBeDefined();
    expect(screen.getByText("2025년")).toBeDefined();
    expect(screen.getByText(/2026년.*현재/)).toBeDefined();
  });

  it("각 row에 source를 표시한다", () => {
    render(<QuotaSection data={mockData} defaultOpen />);
    expect(screen.getByText("제46차")).toBeDefined();
    expect(screen.getByText("제48차")).toBeDefined();
  });

  it("차수별 컬럼(round, competitionRate)이 없다", () => {
    const { container } = render(<QuotaSection data={mockData} defaultOpen />);
    expect(container.textContent).not.toContain("경쟁률");
    expect(container.textContent).not.toContain("차수");
  });
});
```

- [ ] **Step 2: 테스트 실행 — FAIL 확인**

Run: `npx vitest run __tests__/components/quota-section.test.tsx`
Expected: FAIL — 컴포넌트가 아직 이전 타입 사용

- [ ] **Step 3: QuotaSection 구현**

`components/simulator/quota-section.tsx`를 연도별 구조로 재작성:

```typescript
import { cn } from "@/lib/utils";
import { CollapsibleCard } from "./collapsible-card";
import type { QuotaDisplayData } from "@/types/simulator";

interface QuotaSectionProps {
  readonly data: QuotaDisplayData;
  readonly defaultOpen?: boolean;
  readonly muted?: boolean;
}

export function QuotaSection({ data, defaultOpen = false, muted = false }: QuotaSectionProps) {
  return (
    <CollapsibleCard
      icon={<span>📊</span>}
      iconColorClass="bg-signal-blue-bg text-signal-blue"
      title="쿼터 현황"
      badge={
        <span className="inline-flex items-center rounded-full bg-signal-blue-bg px-2 py-0.5 text-[11px] font-semibold text-signal-blue">
          {data.industry}
        </span>
      }
      defaultOpen={defaultOpen}
      muted={muted}
    >
      {/* Current year info */}
      <div className="space-y-0">
        <DataRow label="업종" value={data.industry} />
        <DataRow label="금년 쿼터" value={data.currentYearQuota} />
      </div>

      {/* Year comparison table */}
      <div className="mt-4 mb-2 text-[13px] font-semibold">연도별 추이</div>
      <table className="w-full border-collapse text-[13px]">
        <thead>
          <tr>
            <th className="border border-border bg-secondary px-2.5 py-2.5 text-left font-semibold">연도</th>
            <th className="border border-border bg-secondary px-2.5 py-2.5 text-left font-semibold">쿼터</th>
            <th className="border border-border bg-secondary px-2.5 py-2.5 text-left font-semibold">출처</th>
          </tr>
        </thead>
        <tbody>
          {data.yearRows.map((row) => (
            <tr key={row.year}>
              <td
                className={cn(
                  "border border-border px-2.5 py-2.5",
                  row.isCurrent && "font-semibold",
                )}
              >
                {row.year}년{row.isCurrent && " (현재)"}
              </td>
              <td
                className={cn(
                  "border border-border px-2.5 py-2.5",
                  row.isCurrent && "font-semibold",
                )}
              >
                {row.quotaCount}
              </td>
              <td className="border border-border px-2.5 py-2.5 text-muted-foreground">
                {row.source}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </CollapsibleCard>
  );
}

function DataRow({ label, value }: { readonly label: string; readonly value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border px-0 py-2.5 last:border-b-0">
      <span className="text-[13px] text-muted-foreground">{label}</span>
      <span className="text-sm font-semibold">{value}</span>
    </div>
  );
}
```

- [ ] **Step 4: 테스트 실행 — PASS 확인**

Run: `npx vitest run __tests__/components/quota-section.test.tsx`
Expected: PASS

- [ ] **Step 5: 커밋**

```bash
git add components/simulator/quota-section.tsx __tests__/components/quota-section.test.tsx
git commit -m "refactor: QuotaSection을 연도별 쿼터 구조로 재작성"
```

---

### Task 6: TimelineSection 컴포넌트 간소화

**Files:**
- Modify: `components/simulator/timeline-section.tsx`
- Create: `__tests__/components/timeline-section.test.tsx`

- [ ] **Step 1: 컴포넌트 테스트 작성 (RED)**

`__tests__/components/timeline-section.test.tsx`:

```typescript
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TimelineSection } from "@/components/simulator/timeline-section";
import type { TimelineDisplayData } from "@/types/simulator";

const mockData: TimelineDisplayData = {
  estimatedMonths: 4,
  preferredNationality: "VIETNAM",
  steps: [
    { title: "내국인 구인노력", duration: "약 14일", description: "워크넷 등록" },
    { title: "고용허가서 신청", duration: "약 1개월", description: "서류 제출" },
    { title: "비자발급·입국", duration: "약 3개월", description: "입국" },
  ],
};

describe("TimelineSection", () => {
  it("예상 소요기간 뱃지를 표시한다", () => {
    render(<TimelineSection data={mockData} defaultOpen />);
    expect(screen.getByText("약 4개월")).toBeDefined();
  });

  it("각 step의 title과 description을 렌더링한다", () => {
    render(<TimelineSection data={mockData} defaultOpen />);
    expect(screen.getByText(/1\. 내국인 구인노력/)).toBeDefined();
    expect(screen.getByText("워크넷 등록")).toBeDefined();
    expect(screen.getByText(/2\. 고용허가서 신청/)).toBeDefined();
  });

  it("각 step의 duration 뱃지를 렌더링한다", () => {
    render(<TimelineSection data={mockData} defaultOpen />);
    expect(screen.getByText("약 14일")).toBeDefined();
    expect(screen.getByText("약 1개월")).toBeDefined();
  });

  it("국적별 비교 테이블이 없다", () => {
    const { container } = render(<TimelineSection data={mockData} defaultOpen />);
    expect(container.textContent).not.toContain("주요 송출국별");
    expect(container.textContent).not.toContain("평균 소요기간");
  });

  it("하이라이트 박스가 없다", () => {
    const { container } = render(<TimelineSection data={mockData} defaultOpen />);
    expect(container.textContent).not.toContain("현재 선택:");
  });
});
```

- [ ] **Step 2: 테스트 실행 — FAIL 확인**

Run: `npx vitest run __tests__/components/timeline-section.test.tsx`
Expected: FAIL — 컴포넌트가 아직 이전 타입 사용

- [ ] **Step 3: TimelineSection 구현**

`components/simulator/timeline-section.tsx`에서 nationalityComparison 테이블과 하이라이트 박스를 제거, `step.step` 대신 index 사용:

```typescript
import { cn } from "@/lib/utils";
import { CollapsibleCard } from "./collapsible-card";
import type { TimelineDisplayData } from "@/types/simulator";

interface TimelineSectionProps {
  readonly data: TimelineDisplayData;
  readonly defaultOpen?: boolean;
  readonly muted?: boolean;
}

export function TimelineSection({ data, defaultOpen = true, muted = false }: TimelineSectionProps) {
  return (
    <CollapsibleCard
      icon={<span>⏱</span>}
      iconColorClass="bg-signal-yellow-bg text-signal-yellow"
      title="예상 소요기간"
      badge={
        <span className="inline-flex items-center rounded-full bg-signal-yellow-bg px-2 py-0.5 text-[11px] font-semibold text-signal-yellow">
          약 {data.estimatedMonths}개월
        </span>
      }
      defaultOpen={defaultOpen}
      muted={muted}
    >
      {/* Dot-line timeline */}
      <div className="flex flex-col">
        {data.steps.map((step, i) => {
          const isLast = i === data.steps.length - 1;
          return (
            <div key={step.title} className="flex items-stretch gap-3">
              <div className="flex w-6 flex-col items-center">
                <div
                  className={cn(
                    "mt-[5px] h-2.5 w-2.5 shrink-0 rounded-full",
                    isLast ? "bg-signal-green" : "bg-primary",
                  )}
                />
                {!isLast && <div className="w-0.5 flex-1 bg-border" />}
              </div>
              <div className={cn("flex-1", !isLast && "pb-4")}>
                <div className="text-[13px] font-semibold">
                  {i + 1}. {step.title}
                </div>
                <div className="text-xs text-muted-foreground">{step.description}</div>
                <span
                  className={cn(
                    "mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold",
                    step.duration.includes("개월")
                      ? "bg-signal-orange-bg text-signal-orange"
                      : "bg-signal-blue-bg text-signal-blue",
                  )}
                >
                  {step.duration}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </CollapsibleCard>
  );
}
```

삭제: `NATIONALITY_LABELS` import, `nationalityComparison` 테이블, 하이라이트 박스

- [ ] **Step 4: 테스트 실행 — PASS 확인**

Run: `npx vitest run __tests__/components/timeline-section.test.tsx`
Expected: PASS

- [ ] **Step 5: 커밋**

```bash
git add components/simulator/timeline-section.tsx __tests__/components/timeline-section.test.tsx
git commit -m "refactor: TimelineSection에서 nationalityComparison 제거 (2단계 확장 예정)"
```

---

### Task 7: API Route 검증 키 업데이트

**Files:**
- Modify: `app/api/simulations/route.ts:46`
- Test: `__tests__/api/simulations-route.test.ts`

- [ ] **Step 1: API Route 수정**

`app/api/simulations/route.ts` line 46의 BE 응답 검증 키를 변경:

```typescript
// Before
if (!raw?.employmentLimit || !raw?.scoring || !raw?.quotaStatus || !raw?.timeline || !raw?.aiInsights) {

// After
if (!raw?.employmentLimitAnalysis || !raw?.scoringAnalysis || !raw?.quotaStatus || !raw?.timelineEstimate || !raw?.aiInsights) {
```

- [ ] **Step 2: 기존 route 테스트 실행 — PASS 확인**

Run: `npx vitest run __tests__/api/simulations-route.test.ts`
Expected: PASS (MSW handler가 mock data import를 통해 자동으로 새 shape 반영)

- [ ] **Step 3: 커밋**

```bash
git add app/api/simulations/route.ts
git commit -m "fix: BE 응답 구조 검증 키를 실제 API 필드명으로 변경"
```

---

### Task 8: MSW Handlers 검증 + 전체 테스트

**Files:**
- Verify: `mocks/handlers.ts` (구조 변경 자동 반영 확인)
- Verify: `__tests__/components/verdict-card.test.tsx` (fixture 호환성 확인)

- [ ] **Step 1: MSW handlers 타입 호환성 확인**

`mocks/handlers.ts`는 `mockWithinQuotaResponse`를 import하여 `transformSimulationResult`에 전달한다. mock data가 새 `SimulationResultResponse` shape으로 바뀌었으므로, transform 함수도 새 shape을 받도록 업데이트된 상태에서 자동으로 호환된다. 타입 체크로 확인:

Run: `npx tsc --noEmit 2>&1 | grep -E "handlers|verdict-card"`
Expected: 에러 없음

- [ ] **Step 2: verdict-card 테스트 호환성 확인**

`verdict-card.test.tsx`의 fixture는 `additionalBonuses: []`를 사용하므로 `AdditionalBonusDisplay` 타입 변경의 영향을 받지 않는다. 기존 테스트가 그대로 통과하는지 확인:

Run: `npx vitest run __tests__/components/verdict-card.test.tsx`
Expected: PASS (변경 없이 통과)

- [ ] **Step 3: 전체 타입 체크**

Run: `npx tsc --noEmit`
Expected: 에러 없음

- [ ] **Step 4: 전체 테스트 실행**

Run: `npx vitest run`
Expected: ALL PASS

- [ ] **Step 5: 실패 시 수정**

가능한 실패 포인트:
- `mocks/handlers.ts`에서 타입 불일치 → import 경로/타입 수정
- `verdict-card.test.tsx` fixture 타입 에러 → `AdditionalBonusDisplay` 타입으로 어노테이션 조정

- [ ] **Step 6: 최종 커밋 (수정 발생 시)**

```bash
git add mocks/handlers.ts __tests__/components/verdict-card.test.tsx
git commit -m "fix: BFF 매핑 재정렬 후 잔여 타입 에러 수정"
```
