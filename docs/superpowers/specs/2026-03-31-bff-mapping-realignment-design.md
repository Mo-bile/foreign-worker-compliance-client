# BFF 매핑 BE 실응답 정합 설계

## Context

시뮬레이터 도메인 리디자인(PR #25) 이후, BE 팀이 실제 API 응답 스펙(PR #30)을 공유함.
FE의 BE 응답 타입(`SimulationResultResponse`)과 실제 BE 응답 간 필드명 불일치 및 구조적 차이가 확인됨.
BFF transform 레이어를 실제 BE 응답에 맞춰 일괄 재정렬한다.

### BE 팀 확인 결과

| 항목 | BE 상태 | FE 조치 |
|------|---------|---------|
| 차수별 쿼터 (round-level) | 불가 (데이터 미보유, 추후 가능) | 연도별 총량 기준 설계 |
| 국적별 소요기간 비교 | 가능 (`/api/metadata` 확장, 2단계) | 1단계에서 제거, 2단계에서 추가 |
| 개별 보너스 추가인원 | 가능하나 불필요 | `ratePercent × baseLimitAfterCap`로 FE 계산 |

## BE 실응답 구조 (GET /api/simulations/{id})

```json
{
  "id": 1,
  "companyId": 1,
  "desiredWorkers": 5,
  "preferredNationality": "VIETNAM",
  "desiredTiming": "2026-Q3",
  "domesticInsuredCount": 80,

  "employmentLimitAnalysis": {
    "domesticInsuredCount": 80,
    "baseLimit": 35,
    "doubleCap": null,
    "baseLimitAfterCap": 35,
    "additionalBonuses": [
      { "reason": "비수도권", "ratePercent": 30, "cappedByDomesticCount": true }
    ],
    "additionalCount": 10,
    "totalLimit": 45,
    "cappedByDomesticCount": false,
    "currentForeignWorkerCount": 50,
    "remainingCapacity": 0,
    "limitExceeded": true,
    "whatIfScenarios": [
      {
        "additionalDomesticCount": 3,
        "newDomesticTotal": 83,
        "newBaseLimit": 35,
        "newBaseLimitAfterCap": 35,
        "newTotalLimit": 45,
        "newRemainingCapacity": 0,
        "feasibility": "IMPOSSIBLE"
      }
    ]
  },

  "scoringAnalysis": {
    "appliedBonusItems": [
      { "code": "S01", "displayName": "사회보장협정 체결국", "points": 5, "applied": true }
    ],
    "availableBonusItems": [
      { "code": "S02", "displayName": "한국어능력시험 합격", "points": 3, "applied": false }
    ],
    "totalBonusScore": 5,
    "totalDeductionScore": 0,
    "estimatedScore": 75,
    "maxPossibleScore": 100
  },

  "quotaStatus": {
    "industry": "제조업",
    "currentYearQuota": 38000,
    "recentHistory": [
      { "year": 2026, "quotaCount": 38000, "source": "제48차" },
      { "year": 2025, "quotaCount": 36000, "source": "도입계획" }
    ]
  },

  "timelineEstimate": {
    "preferredNationality": "VIETNAM",
    "estimatedMonths": 8,
    "steps": [
      { "stepName": "내국인 구인노력", "estimatedDays": 14, "description": "워크넷 구인공고 등록" },
      { "stepName": "고용허가서 신청", "estimatedDays": 30, "description": "관할 고용센터 신청" },
      { "stepName": "근로계약 체결", "estimatedDays": 14, "description": "EPS 시스템 통한 근로계약" },
      { "stepName": "비자발급·입국", "estimatedDays": 90, "description": "사증발급인정서 → 입국" },
      { "stepName": "취업교육", "estimatedDays": 20, "description": "입국 후 취업교육 이수" }
    ]
  },

  "aiInsights": {
    "overallVerdict": "...",
    "limitInsight": "...",
    "scoringInsight": "...",
    "quotaInsight": "...",
    "timelineInsight": "...",
    "actionItems": ["..."],
    "disclaimer": "..."
  },

  "createdAt": "2026-03-31T09:30:00"
}
```

## 변경 범위

### Layer 1: BE Response Types (`types/simulator.ts`)

실제 BE 필드명에 맞춰 전면 교체한다. FE display types는 별도 유지.

#### 삭제되는 BE 타입/필드

| 타입/필드 | 사유 |
|-----------|------|
| `AdditionalBonus.additionalCount` | BE는 부모에 `additionalCount` 총량만 제공 |
| `RoundHistoryItem` | BE에 차수별 데이터 없음 |
| `QuotaStatusResponse.currentRound` | BE에 없음 |
| `QuotaStatusResponse.roundAllocation` | BE에 없음 |
| `QuotaStatusResponse.industryAllocation` | BE에 없음 |
| `QuotaStatusResponse.industryTrend` | BE에 없음 |
| `TimelineResponse.nationalityComparison` | 2단계에서 metadata로 이동 |
| `NationalityDuration` | 2단계로 이동 |
| `TimelineStep.step` | BE에 없음 (index로 대체) |
| `TimelineStep.duration` | BE는 `estimatedDays` (number) |

#### 새로 추가되는 top-level 필드

| 필드 | BE 소스 | 비고 |
|------|---------|------|
| `domesticInsuredCount` | root level `number` | `employmentLimitAnalysis.domesticInsuredCount`와 중복이나 BE 응답 shape 일치를 위해 포함 |

#### 새로 추가되는 BE 타입/필드

| 타입/필드 | BE 소스 |
|-----------|---------|
| `EmploymentLimitAnalysis.doubleCap` | `number \| null` |
| `EmploymentLimitAnalysis.baseLimitAfterCap` | `number` |
| `EmploymentLimitAnalysis.additionalCount` | `number` (총량) |
| `EmploymentLimitAnalysis.cappedByDomesticCount` | `boolean` |
| `AdditionalBonusBE.ratePercent` | `number` |
| `AdditionalBonusBE.cappedByDomesticCount` | `boolean` |
| `ScoringAnalysis.totalDeductionScore` | `number` |
| `WhatIfScenarioBE.newDomesticTotal` | `number` |
| `WhatIfScenarioBE.newBaseLimit` | `number` |
| `WhatIfScenarioBE.newBaseLimitAfterCap` | `number` |
| `QuotaHistoryItem.source` | `string` |
| `TimelineStepBE.stepName` | `string` |
| `TimelineStepBE.estimatedDays` | `number` |

#### 필드명 매핑 (rename only)

| BE 필드 | 현재 FE 필드 |
|---------|-------------|
| `employmentLimitAnalysis` | `employmentLimit` |
| `scoringAnalysis` | `scoring` |
| `timelineEstimate` | `timeline` |
| `displayName` | `label` |
| `points` | `score` |
| `additionalDomesticCount` | `delta` |
| `newTotalLimit` | `newLimit` |
| `newRemainingCapacity` | `remainingCapacity` |
| `stepName` | `title` |
| `currentYearQuota` | (신규 구조) |

### Layer 2: FE Display Types (`types/simulator.ts`)

컴포넌트가 소비하는 display 타입. BE 타입과 분리되어 있으므로 BE 변경의 영향을 최소화한다.

#### QuotaDisplayData — 연도별로 축소

```typescript
// Before
interface QuotaDisplayData {
  currentRound: string;
  roundAllocation: string;
  industryAllocationText: string;
  roundRows: QuotaRoundRow[];
  industryTrend: string;
}

// After
interface QuotaDisplayData {
  industry: string;
  currentYearQuota: string;          // "38,000명"
  yearRows: readonly QuotaYearRow[];
}

interface QuotaYearRow {
  year: number;
  quotaCount: string;                // "38,000명"
  source: string;
  isCurrent: boolean;
}
```

#### TimelineDisplayData — nationalityComparison 제거

```typescript
// Before
interface TimelineDisplayData {
  estimatedMonths: number;
  steps: readonly TimelineStep[];
  nationalityComparison: readonly NationalityDuration[];
  preferredNationality: string | null;
}

// After
interface TimelineDisplayData {
  estimatedMonths: number;
  preferredNationality: string | null;
  steps: readonly TimelineStepDisplay[];
}

interface TimelineStepDisplay {
  title: string;
  duration: string;       // "약 14일", "약 1개월" (estimatedDays 변환)
  description: string;
}
```

#### AdditionalBonusDisplay — FE 계산 기반

```typescript
// Before
interface AdditionalBonus {
  reason: string;
  additionalCount: number;
}

// After (FE display type, transform에서 계산)
interface AdditionalBonusDisplay {
  reason: string;
  additionalCount: number;  // Math.floor(baseLimitAfterCap * ratePercent / 100)
}
```

VerdictDisplayData의 `additionalBonuses` 필드 타입이 `AdditionalBonusDisplay[]`로 변경된다.

### Layer 3: Transform (`lib/transforms/simulation-transform.ts`)

#### 주요 매핑 로직

| 변환 | 로직 |
|------|------|
| `displayName` → `label` | 직접 매핑 |
| `points` → `score` | 직접 매핑 |
| `additionalDomesticCount` → `delta` | 직접 매핑 |
| `newTotalLimit` → `newLimit` | 직접 매핑 |
| `newRemainingCapacity` → `remainingCapacity` | 직접 매핑 |
| `estimatedDays` → `duration` | `≥30 → "약 N개월"`, `<30 → "약 N일"` |
| 보너스 추가인원 | `Math.floor(baseLimitAfterCap × ratePercent / 100)` |
| quota `isCurrent` | `year === currentYear` (기본 매개변수) |
| `newDomesticTotal` → `domesticInsuredCount` (WhatIfRow) | 직접 매핑 |

#### estimatedDays → duration 변환 규칙

```
estimatedDays < 30  → "약 {days}일"
estimatedDays >= 30 → "약 {Math.round(days / 30)}개월"
```

#### buildQuota 변경

```typescript
// Before: roundHistory 기반, 차수별 비교
function buildQuota(quota: QuotaStatusResponse, currentYear?: number): QuotaDisplayData

// After: recentHistory 기반, 연도별 추이
function buildQuota(quota: QuotaStatusResponseBE, currentYear?: number): QuotaDisplayData
```

- `roundRows` → `yearRows` 변환
- `industryTrend`, `industryAllocationText` 삭제
- `industry`, `currentYearQuota` 추가

#### buildTimeline 변경

```typescript
// Before: nationalityComparison 포함
function buildTimeline(timeline: TimelineResponse): TimelineDisplayData

// After: steps만, estimatedDays→duration 변환
function buildTimeline(timeline: TimelineEstimateBE): TimelineDisplayData
```

#### buildVerdict additionalBonuses 변경

```typescript
// Before: BE의 { reason, additionalCount } 그대로 전달
// After: BE의 { reason, ratePercent } + baseLimitAfterCap으로 계산
const additionalBonuses = limit.additionalBonuses.map(b => ({
  reason: b.reason,
  additionalCount: Math.floor(limit.baseLimitAfterCap * b.ratePercent / 100),
}));
```

#### buildWhatIf 변경

`buildWhatIf`는 `EmploymentLimitAnalysis` (이전 `EmploymentLimitResponse`)에서 whatIfScenarios를 읽는다. BE 필드명이 모두 변경되므로 매핑 필요:

```typescript
// BE field → WhatIfRow display field
s.newDomesticTotal         → domesticInsuredCount
s.additionalDomesticCount  → delta (0이면 "현재", 양수면 "+N명")
s.newTotalLimit            → newLimit
s.newRemainingCapacity     → remainingCapacity
s.feasibility              → feasibility (변경 없음)
```

`minimumConditionText` 생성 시에도 동일하게 `additionalDomesticCount`, `newDomesticTotal` 사용.
WhatIfSection **컴포넌트**는 변경 없음 (display 타입 WhatIfRow가 동일하므로).

### Layer 4: Mock Data (`mocks/simulator-data.ts`)

BE 응답 shape에 맞춰 2개 mock (한도이내/초과) 재작성.

> **Note:** `desiredTiming` 포맷이 FE 요청(`2026_Q2`, underscore)과 BE 응답(`2026-Q3`, hyphen)에서 다름. Mock 응답 데이터는 BE 포맷(`2026-Q3`)을 사용한다.

주요 변경:

- `employmentLimit` → `employmentLimitAnalysis` + 새 필드들
- `scoring` → `scoringAnalysis` + `displayName`, `points`, `totalDeductionScore`
- `quotaStatus` → 연도별 구조
- `timeline` → `timelineEstimate` + `stepName`, `estimatedDays`
- `nationalityComparison` 제거

### Layer 5: Components

#### QuotaSection (`components/simulator/quota-section.tsx`)

| Before | After |
|--------|-------|
| 현재 차수 데이터 행 (currentRound, roundAllocation, industryAllocation) | 현재 연도 쿼터 행 (industry, currentYearQuota) |
| 차수별 비교 테이블 (roundRows: round, allocation, industryAllocation, competitionRate) | 연도별 추이 테이블 (yearRows: year, quotaCount, source) |
| 업종 동향 박스 (industryTrend) | 삭제 |
| 데이터 출처 칩 | source 컬럼으로 통합 |

#### TimelineSection (`components/simulator/timeline-section.tsx`)

| Before | After |
|--------|-------|
| Dot-line 타임라인 (step.title, step.duration) | 유지 (step.title, step.duration — 변환된 문자열) |
| 국적별 비교 테이블 (nationalityComparison) | 삭제 |
| 하이라이트 박스 (선택 국적 vs 미지정) | 삭제 |

#### VerdictCard — 변경 최소

`additionalBonuses` 표시가 `reason + additionalCount` → 동일 (transform에서 계산)

### Layer 6: API Route (`app/api/simulations/route.ts`)

- BE 응답 구조 검증 키 변경: `employmentLimit` → `employmentLimitAnalysis`, `scoring` → `scoringAnalysis`, `timeline` → `timelineEstimate`
- `fetchDeductionCodes` 로직 변경 없음

### Layer 7: MSW Handlers (`mocks/handlers.ts`)

- Mock data import 업데이트
- `transformSimulationResult` 호출은 동일 (mock이 새 BE shape이므로)

### Layer 8: Tests

| 테스트 파일 | 변경 |
|------------|------|
| `simulator-types.test.ts` | BE 타입 fixture를 새 필드명으로 교체 |
| `simulation-transform.test.ts` | mock 기반 assertion 업데이트 (quota: 연도별, timeline: steps만) |
| `simulator-data.test.ts` | mock 구조 검증 업데이트 |
| `simulations-route.test.ts` | BE 응답 검증 키 변경 |
| `simulation-form.test.tsx` | 변경 없음 (BE 타입 무관) |
| `verdict-card.test.tsx` | additionalBonuses fixture 변경 |
| `quota-section.test.tsx` | 신규 (연도별 테이블 렌더링) |
| `timeline-section.test.tsx` | 신규 (국적 비교 제거 후 steps만) |

## 변경하지 않는 것

- `SimulationRequest` (FE → BFF 요청 타입) — 변경 없음
- `simulationRequestSchema` (Zod) — 변경 없음
- `useSimulation` hook — 변경 없음
- `SimulationForm` — 변경 없음
- `CollapsibleCard`, `RecommendationBox`, `AiSummarySection` — 변경 없음
- `ScoringSection` — display 타입 동일, 변경 없음 (컴포넌트만; transform 함수 변경은 Layer 3에 문서화)
- `WhatIfSection` — display 타입 동일, 변경 없음 (컴포넌트만; transform 함수 변경은 Layer 3에 문서화)
- `InputGuide`, `ResultSummarySidebar`, `SimulationProgress` — 변경 없음
- `SimulatorPage` — 변경 없음 (컴포넌트 props 타입 변경은 하위에서 흡수)

## 2단계 확장 포인트 (이번 스코프 아님)

- `/api/metadata`에 `nationalityDurations` 필드 추가 → TimelineSection에 비교 테이블 복원
- BE가 차수별 데이터 보유 시 → QuotaSection 확장 (연도별 → 차수별)
- `industryTrend` BE 제공 시 → QuotaSection에 동향 박스 복원
