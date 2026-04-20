# 보험 도메인 보강 FE 대응 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** BE의 보험 도메인 보강(Breaking 3건)에 맞춰 FE 타입·UI·mock·테스트를 업데이트한다.

**Architecture:** `types/api.ts` 타입/상수 변경 → 컴포넌트 업데이트 → mock 데이터 수정 → 테스트 순서. BFF transform 추가 없음(BE가 영문 코드 필드를 직접 제공).

**Tech Stack:** Next.js 16, React 19, Zod v4, TanStack Query v5, Tailwind v4 (oklch), Vitest, MSW v2

---

### Task 1: types/api.ts — InsuranceStatus 5상태 영문 enum 전환

**Files:**
- Modify: `types/api.ts:4-58` (NATIONALITIES 배열 + NATIONALITY_LABELS)
- Modify: `types/api.ts:117-119` (INSURANCE_STATUSES + InsuranceStatus)
- Modify: `types/api.ts:288-292` (InsuranceEligibilityDto)
- Modify: `types/api.ts:294-302` (WorkerResponse)
- Test: `__tests__/types/schemas.test.ts`

- [ ] **Step 1: Write failing tests for new enum values**

```ts
// __tests__/types/schemas.test.ts — 기존 "enum 상수" describe 블록에 추가/수정

it("NATIONALITIES는_26개_값을_가진다", () => {
  expect(NATIONALITIES).toHaveLength(26);
});

it("INSURANCE_STATUSES는_5개_영문_enum_값을_가진다", () => {
  expect(INSURANCE_STATUSES).toHaveLength(5);
  expect(INSURANCE_STATUSES).toContain("MANDATORY");
  expect(INSURANCE_STATUSES).toContain("FULL_MANDATORY");
  expect(INSURANCE_STATUSES).toContain("AUTO_BENEFITS_OPT_IN");
  expect(INSURANCE_STATUSES).toContain("OPTIONAL_ON_APPLICATION");
  expect(INSURANCE_STATUSES).toContain("EXEMPT");
});
```

import에 `INSURANCE_STATUSES`를 추가할 것.

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run __tests__/types/schemas.test.ts`
Expected: FAIL — NATIONALITIES length 24≠26, INSURANCE_STATUSES에 영문 값 없음

- [ ] **Step 3: Update types/api.ts — Nationality 2개 추가**

`NATIONALITIES` 배열 끝에 추가:

```ts
  "FRANCE",
  "EAST_TIMOR",
  "LAOS",
] as const;
```

`NATIONALITY_LABELS`에 추가:

```ts
  FRANCE: "프랑스",
  EAST_TIMOR: "동티모르",
  LAOS: "라오스",
};
```

- [ ] **Step 4: Update types/api.ts — InsuranceStatus 5상태**

```ts
// ─── InsuranceStatus ─────────────────────────────────────────
export const INSURANCE_STATUSES = [
  "MANDATORY",
  "FULL_MANDATORY",
  "AUTO_BENEFITS_OPT_IN",
  "OPTIONAL_ON_APPLICATION",
  "EXEMPT",
] as const;
export type InsuranceStatus = (typeof INSURANCE_STATUSES)[number];

export const INSURANCE_STATUS_LABELS: Record<InsuranceStatus, string> = {
  MANDATORY: "의무가입",
  FULL_MANDATORY: "전부 의무적용",
  AUTO_BENEFITS_OPT_IN: "자동가입(급여신청형)",
  OPTIONAL_ON_APPLICATION: "신청시가입",
  EXEMPT: "가입제외",
};
```

- [ ] **Step 5: Update InsuranceEligibilityDto + WorkerResponse**

```ts
export interface InsuranceEligibilityDto {
  readonly insuranceType: string;
  readonly insuranceTypeCode: string;
  readonly status: string;
  readonly statusCode: InsuranceStatus;
  readonly reason: string;
}

export interface WorkerResponse {
  readonly id: number;
  readonly name: string;
  readonly nationality: Nationality;
  readonly visaType: VisaType;
  readonly visaExpiryDate: string;
  readonly dateOfBirth: string;
  readonly status: WorkerStatus;
  readonly insuranceEligibilities: readonly InsuranceEligibilityDto[];
}
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `npx vitest run __tests__/types/schemas.test.ts`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add types/api.ts __tests__/types/schemas.test.ts
git commit -m "feat: InsuranceStatus 5상태 영문 enum + Nationality 2개 추가 + InsuranceEligibilityDto 코드 필드"
```

---

### Task 2: types/api.ts — DeadlineType enum 확장 + dateOfBirth 스키마

**Files:**
- Modify: `types/api.ts:87-92` (DEADLINE_TYPES)
- Modify: `types/api.ts:190-195` (DEADLINE_TYPE_LABELS)
- Modify: `types/api.ts:245-262` (registerWorkerRequestSchema)
- Test: `__tests__/types/schemas.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
// __tests__/types/schemas.test.ts — 기존 describe("enum 상수")에 추가

it("DEADLINE_TYPES는_7개_값을_가진다", () => {
  expect(DEADLINE_TYPES).toHaveLength(7);
  expect(DEADLINE_TYPES).not.toContain("INSURANCE_ENROLLMENT");
  expect(DEADLINE_TYPES).toContain("NATIONAL_PENSION_ENROLLMENT");
  expect(DEADLINE_TYPES).toContain("HEALTH_INSURANCE_ENROLLMENT");
  expect(DEADLINE_TYPES).toContain("EMPLOYMENT_INSURANCE_ENROLLMENT");
  expect(DEADLINE_TYPES).toContain("INDUSTRIAL_ACCIDENT_ENROLLMENT");
});
```

```ts
// __tests__/types/schemas.test.ts — 기존 describe("registerWorkerRequestSchema")에 추가

it("dateOfBirth가_없으면_실패한다", () => {
  const invalid = {
    name: "Test",
    nationalityCode: "VIETNAM",
    visaType: "E9",
    visaExpiryDate: "2026-12-31",
    entryDate: "2024-01-15",
    contractStartDate: "2024-02-01",
    companyId: 1,
  };
  const result = registerWorkerRequestSchema.safeParse(invalid);
  expect(result.success).toBe(false);
});

it("dateOfBirth가_유효한_날짜면_통과한다", () => {
  const valid = {
    name: "Test",
    nationalityCode: "VIETNAM",
    visaType: "E9",
    visaExpiryDate: "2026-12-31",
    entryDate: "2024-01-15",
    contractStartDate: "2024-02-01",
    companyId: 1,
    dateOfBirth: "1990-05-15",
  };
  const result = registerWorkerRequestSchema.safeParse(valid);
  expect(result.success).toBe(true);
});

it("dateOfBirth가_미래날짜면_실패한다", () => {
  const invalid = {
    name: "Test",
    nationalityCode: "VIETNAM",
    visaType: "E9",
    visaExpiryDate: "2026-12-31",
    entryDate: "2024-01-15",
    contractStartDate: "2024-02-01",
    companyId: 1,
    dateOfBirth: "2099-01-01",
  };
  const result = registerWorkerRequestSchema.safeParse(invalid);
  expect(result.success).toBe(false);
});
```

import에 `DEADLINE_TYPES`를 추가할 것.

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run __tests__/types/schemas.test.ts`
Expected: FAIL — DEADLINE_TYPES length 4≠7, dateOfBirth 관련 테스트 실패

- [ ] **Step 3: Update DEADLINE_TYPES + DEADLINE_TYPE_LABELS**

```ts
export const DEADLINE_TYPES = [
  "VISA_EXPIRY",
  "NATIONAL_PENSION_ENROLLMENT",
  "HEALTH_INSURANCE_ENROLLMENT",
  "EMPLOYMENT_INSURANCE_ENROLLMENT",
  "INDUSTRIAL_ACCIDENT_ENROLLMENT",
  "CHANGE_REPORT",
  "CONTRACT_RENEWAL",
] as const;
```

```ts
export const DEADLINE_TYPE_LABELS: Record<DeadlineType, string> = {
  VISA_EXPIRY: "비자 만료",
  NATIONAL_PENSION_ENROLLMENT: "국민연금 취득신고",
  HEALTH_INSURANCE_ENROLLMENT: "건강보험 취득신고",
  EMPLOYMENT_INSURANCE_ENROLLMENT: "고용보험 취득신고",
  INDUSTRIAL_ACCIDENT_ENROLLMENT: "산재보험 취득신고",
  CHANGE_REPORT: "변경 신고",
  CONTRACT_RENEWAL: "계약 갱신",
};
```

- [ ] **Step 4: Add dateOfBirth to registerWorkerRequestSchema**

`name` 필드 바로 다음에 추가:

```ts
export const registerWorkerRequestSchema = z.object({
  name: z.string().min(1, "이름을 입력해주세요"),
  dateOfBirth: z
    .string()
    .regex(isoDateRegex, "날짜 형식: YYYY-MM-DD")
    .refine((val) => new Date(val) <= new Date(), "미래 날짜는 입력할 수 없습니다"),
  passportNumber: z.string().optional(),
  // ... 나머지 필드 그대로
});
```

- [ ] **Step 5: Fix existing schema tests — dateOfBirth 추가**

기존 `유효한_요청을_통과시킨다`와 `선택_필드가_없어도_통과한다` 테스트에 `dateOfBirth` 추가:

```ts
it("유효한_요청을_통과시킨다", () => {
  const valid = {
    name: "Nguyen Van A",
    dateOfBirth: "1990-05-15",
    nationalityCode: "VIETNAM" as Nationality,
    visaType: "E9" as VisaType,
    visaExpiryDate: "2026-12-31",
    entryDate: "2024-01-15",
    contractStartDate: "2024-02-01",
    companyId: 1,
  };
  const result = registerWorkerRequestSchema.safeParse(valid);
  expect(result.success).toBe(true);
});

it("선택_필드가_없어도_통과한다", () => {
  const valid = {
    name: "Test Worker",
    dateOfBirth: "1985-03-20",
    nationalityCode: "CHINA",
    visaType: "H2",
    visaExpiryDate: "2027-06-30",
    entryDate: "2025-01-01",
    contractStartDate: "2025-02-01",
    companyId: 2,
  };
  const result = registerWorkerRequestSchema.safeParse(valid);
  expect(result.success).toBe(true);
});
```

나머지 실패 테스트(`이름이_비어있으면`, `잘못된_비자유형이면`, `날짜_형식이_올바르지_않으면`)에도 `dateOfBirth: "1990-01-01"` 추가.

- [ ] **Step 6: Run tests to verify they pass**

Run: `npx vitest run __tests__/types/schemas.test.ts`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add types/api.ts __tests__/types/schemas.test.ts
git commit -m "feat: DeadlineType 보험별 4분리 + registerWorkerRequest에 dateOfBirth 추가"
```

---

### Task 3: CSS 변수 + InsuranceBadge 컴포넌트 업데이트

**Files:**
- Modify: `app/globals.css` (signal-indigo 변수 추가)
- Modify: `components/workers/insurance-badge.tsx`
- Test: `__tests__/components/insurance-badge.test.tsx`

- [ ] **Step 1: Write failing tests for 5-state badge**

```tsx
// __tests__/components/insurance-badge.test.tsx — 전체 교체
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { InsuranceBadge } from "@/components/workers/insurance-badge";

describe("InsuranceBadge", () => {
  it("MANDATORY는_한글_라벨과_blue_스타일로_렌더링한다", () => {
    render(<InsuranceBadge statusCode="MANDATORY" label="의무가입" />);
    const badge = screen.getByText("의무가입");
    expect(badge).toBeDefined();
    expect(badge.className).toContain("signal-blue");
  });

  it("FULL_MANDATORY는_blue_스타일로_렌더링한다", () => {
    render(<InsuranceBadge statusCode="FULL_MANDATORY" label="전부 의무적용" />);
    const badge = screen.getByText("전부 의무적용");
    expect(badge).toBeDefined();
    expect(badge.className).toContain("signal-blue");
  });

  it("AUTO_BENEFITS_OPT_IN는_indigo_스타일로_렌더링한다", () => {
    render(<InsuranceBadge statusCode="AUTO_BENEFITS_OPT_IN" label="자동가입(급여신청형)" />);
    const badge = screen.getByText("자동가입(급여신청형)");
    expect(badge).toBeDefined();
    expect(badge.className).toContain("signal-indigo");
  });

  it("OPTIONAL_ON_APPLICATION는_gray_스타일로_렌더링한다", () => {
    render(<InsuranceBadge statusCode="OPTIONAL_ON_APPLICATION" label="신청시가입" />);
    const badge = screen.getByText("신청시가입");
    expect(badge).toBeDefined();
    expect(badge.className).toContain("signal-gray");
  });

  it("EXEMPT는_green_스타일로_렌더링한다", () => {
    render(<InsuranceBadge statusCode="EXEMPT" label="가입제외" />);
    const badge = screen.getByText("가입제외");
    expect(badge).toBeDefined();
    expect(badge.className).toContain("signal-green");
  });

  it("알_수_없는_statusCode는_기본_스타일로_렌더링한다", () => {
    render(<InsuranceBadge statusCode={"UNKNOWN" as any} label="알수없음" />);
    expect(screen.getByText("알수없음")).toBeDefined();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run __tests__/components/insurance-badge.test.tsx`
Expected: FAIL — InsuranceBadge props 불일치

- [ ] **Step 3: Add CSS variables to globals.css**

`app/globals.css` `:root` 블록의 signal colors 섹션(`--signal-gray-bg` 다음)에 추가:

```css
  --signal-indigo: oklch(0.55 0.12 280);
  --signal-indigo-bg: oklch(0.93 0.03 280);
```

`.dark` 블록의 signal bg overrides 섹션에 추가:

```css
  --signal-indigo-bg: oklch(0.2 0.06 280);
```

`@theme inline` 블록에 추가:

```css
  --color-signal-indigo: var(--signal-indigo);
  --color-signal-indigo-bg: var(--signal-indigo-bg);
```

- [ ] **Step 4: Update InsuranceBadge component**

```tsx
// components/workers/insurance-badge.tsx
import { Badge } from "@/components/ui/badge";
import type { InsuranceStatus } from "@/types/api";

const STATUS_STYLES: Record<InsuranceStatus, string> = {
  MANDATORY:
    "bg-[var(--signal-blue-bg)] text-[var(--signal-blue)] hover:bg-[var(--signal-blue-bg)]",
  FULL_MANDATORY:
    "bg-[var(--signal-blue-bg)] text-[var(--signal-blue)] hover:bg-[var(--signal-blue-bg)]",
  AUTO_BENEFITS_OPT_IN:
    "bg-[var(--signal-indigo-bg)] text-[var(--signal-indigo)] hover:bg-[var(--signal-indigo-bg)]",
  OPTIONAL_ON_APPLICATION:
    "bg-[var(--signal-gray-bg)] text-[var(--signal-gray)] hover:bg-[var(--signal-gray-bg)]",
  EXEMPT:
    "bg-[var(--signal-green-bg)] text-[var(--signal-green)] hover:bg-[var(--signal-green-bg)]",
};

interface InsuranceBadgeProps {
  readonly statusCode: InsuranceStatus;
  readonly label: string;
}

export function InsuranceBadge({ statusCode, label }: InsuranceBadgeProps) {
  return (
    <Badge variant="secondary" className={STATUS_STYLES[statusCode] ?? ""}>
      {label}
    </Badge>
  );
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run __tests__/components/insurance-badge.test.tsx`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add app/globals.css components/workers/insurance-badge.tsx __tests__/components/insurance-badge.test.tsx
git commit -m "feat: InsuranceBadge 5상태 영문 enum + Indigo 색상 추가"
```

---

### Task 4: 근로자 상세 페이지 + 보험 뱃지 호출부 업데이트

**Files:**
- Modify: `app/(app)/workers/[id]/page.tsx:47-48,59-77,99-106`
- Modify: `components/workers/worker-table.tsx:7-13,50-92,125-131`

- [ ] **Step 1: Update worker detail page**

`app/(app)/workers/[id]/page.tsx`:

1. 기본 정보 `<dl>` 안 국적 `<div>` 바로 위에 생년월일 추가:

```tsx
<div>
  <dt className="text-sm text-muted-foreground">생년월일</dt>
  <dd className="font-medium">{w.dateOfBirth}</dd>
</div>
<div>
  <dt className="text-sm text-muted-foreground">국적</dt>
  <dd className="font-medium">{nationalityLabel}</dd>
</div>
```

2. 보험 테이블의 `InsuranceBadge` 호출 변경:

```tsx
// 기존
<InsuranceBadge status={ie.status} />

// 변경
<InsuranceBadge statusCode={ie.statusCode} label={ie.status} />
```

- [ ] **Step 2: Update worker table — insurance filter**

`components/workers/worker-table.tsx`:

1. import에 `INSURANCE_STATUS_LABELS` 추가:

```ts
import {
  VISA_TYPES,
  VISA_TYPE_LABELS,
  NATIONALITY_LABELS,
  WORKER_STATUSES,
  WORKER_STATUS_LABELS,
  INSURANCE_STATUSES,
  INSURANCE_STATUS_LABELS,
} from "@/types/api";
```

2. `insuranceFilter` state 타입은 이미 `InsuranceStatus | "ALL"`이므로 그대로. 필터 로직에서 `ie.status` → `ie.statusCode`로 변경:

```ts
if (insuranceFilter !== "ALL") {
  if (!worker.insuranceEligibilities.some((ie) => ie.statusCode === insuranceFilter)) return false;
}
```

3. `FilterSelect`에 `labelMap` 추가:

```tsx
<FilterSelect
  value={insuranceFilter}
  onValueChange={handleInsuranceChange}
  placeholder="보험 상태 전체"
  options={[...INSURANCE_STATUSES]}
  labelMap={INSURANCE_STATUS_LABELS}
  className="w-44"
/>
```

- [ ] **Step 3: Run full test suite to check for TypeScript errors**

Run: `npx vitest run`
Expected: 일부 테스트 실패 (mock 데이터가 아직 한글이라 worker-table 테스트 등 실패). Task 5에서 수정.

- [ ] **Step 4: Commit**

```bash
git add app/(app)/workers/[id]/page.tsx components/workers/worker-table.tsx
git commit -m "feat: 근로자 상세/목록에 dateOfBirth 표시 + InsuranceBadge statusCode 전환"
```

---

### Task 5: 근로자 등록 폼에 dateOfBirth 추가

**Files:**
- Modify: `components/workers/worker-form.tsx:59-73,98-106`
- Test: `__tests__/components/worker-form.test.tsx`

- [ ] **Step 1: Write failing test**

`__tests__/components/worker-form.test.tsx` — 기존 `모든_필수_필드를_렌더링한다` 테스트에 추가:

```ts
it("모든_필수_필드를_렌더링한다", async () => {
  renderWithProviders(<WorkerForm />);

  expect(screen.getByLabelText("이름")).toBeDefined();
  expect(screen.getByLabelText("생년월일")).toBeDefined();
  expect(screen.getByLabelText("국적")).toBeDefined();
  expect(screen.getByLabelText("비자 유형")).toBeDefined();
  expect(screen.getByLabelText("비자 만료일")).toBeDefined();
  expect(screen.getByLabelText("입국일")).toBeDefined();
  expect(screen.getByLabelText("계약 시작일")).toBeDefined();
  expect(await screen.findByLabelText("사업장")).toBeDefined();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run __tests__/components/worker-form.test.tsx`
Expected: FAIL — "생년월일" label 찾을 수 없음

- [ ] **Step 3: Update WorkerForm — add dateOfBirth field**

`components/workers/worker-form.tsx`:

1. `defaultValues`에 추가:

```ts
defaultValues: {
  name: "",
  dateOfBirth: "",
  passportNumber: "",
  // ... 나머지 그대로
},
```

2. `이름` FormField 바로 다음에 추가 (사업장 `<div>` 앞):

```tsx
{/* 생년월일 */}
<FormField<RegisterWorkerRequest>
  label="생년월일"
  name="dateOfBirth"
  register={register}
  errors={errors}
  type="date"
/>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run __tests__/components/worker-form.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add components/workers/worker-form.tsx __tests__/components/worker-form.test.tsx
git commit -m "feat: 근로자 등록 폼에 생년월일 필드 추가"
```

---

### Task 6: dashboard-transform — ALERT_TITLE_MAP 업데이트

**Files:**
- Modify: `lib/transforms/dashboard-transform.ts:41-46`
- Test: `__tests__/lib/transforms/dashboard-transform.test.ts`

- [ ] **Step 1: Write failing test**

`__tests__/lib/transforms/dashboard-transform.test.ts`:

1. `baseRaw.alerts[1]`의 `deadlineType`을 `HEALTH_INSURANCE_ENROLLMENT`로 변경:

```ts
{
  deadlineId: 2,
  workerId: 5,
  workerName: "Pham Thi B",
  deadlineType: "HEALTH_INSURANCE_ENROLLMENT",
  status: "OVERDUE",
  dDay: 3,
  dueDate: "2026-03-26",
  description: "건강보험 미가입",
},
```

2. 기존 `INSURANCE_ENROLLMENT` 참조 테스트 수정:

```ts
it("deadlineType별로 그룹핑한다 (3 types → 3 groups)", () => {
  const result = transformDashboardResponse(baseRaw);
  expect(result.alertGroups).toHaveLength(3);
  const types = result.alertGroups.map((g) => g.deadlineType);
  expect(types).toContain("VISA_EXPIRY");
  expect(types).toContain("HEALTH_INSURANCE_ENROLLMENT");
  expect(types).toContain("CONTRACT_RENEWAL");
});
```

```ts
it("dDay >= 0이면 urgency가 critical이다 (HEALTH_INSURANCE_ENROLLMENT dDay: 3)", () => {
  const result = transformDashboardResponse(baseRaw);
  const insuranceGroup = result.alertGroups.find(
    (g) => g.deadlineType === "HEALTH_INSURANCE_ENROLLMENT",
  );
  expect(insuranceGroup?.urgency).toBe("critical");
});
```

3. 보험별 데드라인 라벨 테스트 추가:

```ts
it("보험별_데드라인_라벨을_올바르게_매핑한다", () => {
  const raw: DashboardRawResponse = {
    ...baseRaw,
    alerts: [
      { ...baseRaw.alerts[0], deadlineType: "NATIONAL_PENSION_ENROLLMENT", dDay: -4 },
      { ...baseRaw.alerts[1], deadlineType: "EMPLOYMENT_INSURANCE_ENROLLMENT", dDay: 3 },
    ],
  };
  const result = transformDashboardResponse(raw);
  const pensionGroup = result.alertGroups.find(
    (g) => g.deadlineType === "NATIONAL_PENSION_ENROLLMENT",
  );
  expect(pensionGroup?.label).toBe("국민연금 취득신고");
  const employmentGroup = result.alertGroups.find(
    (g) => g.deadlineType === "EMPLOYMENT_INSURANCE_ENROLLMENT",
  );
  expect(employmentGroup?.label).toBe("고용보험 취득신고");
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run __tests__/lib/transforms/dashboard-transform.test.ts`
Expected: FAIL — ALERT_TITLE_MAP에 보험별 키 없음, TypeScript 오류

- [ ] **Step 3: Update ALERT_TITLE_MAP**

`lib/transforms/dashboard-transform.ts`:

```ts
const ALERT_TITLE_MAP: Record<DeadlineType, string> = {
  VISA_EXPIRY: "비자 만료 임박",
  NATIONAL_PENSION_ENROLLMENT: "국민연금 취득신고",
  HEALTH_INSURANCE_ENROLLMENT: "건강보험 취득신고",
  EMPLOYMENT_INSURANCE_ENROLLMENT: "고용보험 취득신고",
  INDUSTRIAL_ACCIDENT_ENROLLMENT: "산재보험 취득신고",
  CONTRACT_RENEWAL: "근로계약 갱신",
  CHANGE_REPORT: "고용변동 신고",
};
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run __tests__/lib/transforms/dashboard-transform.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/transforms/dashboard-transform.ts __tests__/lib/transforms/dashboard-transform.test.ts
git commit -m "feat: dashboard ALERT_TITLE_MAP 보험별 4개 데드라인 타입 반영"
```

---

### Task 7: MSW mock 데이터 업데이트

**Files:**
- Modify: `mocks/data.ts`
- Modify: `mocks/dashboard-data.ts`

- [ ] **Step 1: Update mocks/data.ts — worker mock**

1. `SAMPLE_INSURANCE` 배열 변경:

```ts
const SAMPLE_INSURANCE_CODES = ["MANDATORY", "FULL_MANDATORY", "AUTO_BENEFITS_OPT_IN", "OPTIONAL_ON_APPLICATION", "EXEMPT"] as const;
const SAMPLE_INSURANCE_LABELS: Record<string, string> = {
  MANDATORY: "의무가입",
  FULL_MANDATORY: "전부 의무적용",
  AUTO_BENEFITS_OPT_IN: "자동가입(급여신청형)",
  OPTIONAL_ON_APPLICATION: "신청시가입",
  EXEMPT: "가입제외",
};
```

2. `generateWorker` 함수 수정 — `dateOfBirth` 추가, `insuranceEligibilities`에 코드 필드 추가:

```ts
function generateWorker(id: number): WorkerResponse {
  const natIdx = id % SAMPLE_NATIONALITIES.length;
  const visaIdx = id % SAMPLE_VISA_TYPES.length;
  const statusIdx = id % SAMPLE_STATUSES.length;
  const insIdx = id % SAMPLE_INSURANCE_CODES.length;
  const insCode = SAMPLE_INSURANCE_CODES[insIdx];
  const empInsIdx = (insIdx + 1) % SAMPLE_INSURANCE_CODES.length;
  const empInsCode = SAMPLE_INSURANCE_CODES[empInsIdx];

  return {
    id,
    name: `Worker-${id}`,
    nationality: SAMPLE_NATIONALITIES[natIdx],
    visaType: SAMPLE_VISA_TYPES[visaIdx],
    visaExpiryDate: `2027-${String((id % 12) + 1).padStart(2, "0")}-15`,
    dateOfBirth: `${1980 + (id % 20)}-${String((id % 12) + 1).padStart(2, "0")}-${String((id % 28) + 1).padStart(2, "0")}`,
    status: SAMPLE_STATUSES[statusIdx],
    insuranceEligibilities: [
      {
        insuranceType: "국민연금",
        insuranceTypeCode: "NATIONAL_PENSION",
        status: SAMPLE_INSURANCE_LABELS[insCode],
        statusCode: insCode,
        reason: "테스트 사유",
      },
      {
        insuranceType: "건강보험",
        insuranceTypeCode: "HEALTH_INSURANCE",
        status: "의무가입",
        statusCode: "MANDATORY",
        reason: "전원 의무가입",
      },
      {
        insuranceType: "고용보험",
        insuranceTypeCode: "EMPLOYMENT_INSURANCE",
        status: SAMPLE_INSURANCE_LABELS[empInsCode],
        statusCode: empInsCode,
        reason: "테스트 사유",
      },
      {
        insuranceType: "산재보험",
        insuranceTypeCode: "INDUSTRIAL_ACCIDENT",
        status: "의무가입",
        statusCode: "MANDATORY",
        reason: "전원 의무가입",
      },
    ],
  };
}
```

3. 수동 작성 2건(id:1 Nguyen Van A, id:2 Zhang Wei)도 동일하게 `dateOfBirth` + 코드 필드 추가:

```ts
{
  id: 1,
  name: "Nguyen Van A",
  nationality: "VIETNAM",
  visaType: "E9",
  visaExpiryDate: "2026-12-31",
  dateOfBirth: "1995-03-15",
  status: "ACTIVE",
  insuranceEligibilities: [
    { insuranceType: "국민연금", insuranceTypeCode: "NATIONAL_PENSION", status: "의무가입", statusCode: "MANDATORY", reason: "일반 외국인 (사회보장협정 미체결국)" },
    { insuranceType: "건강보험", insuranceTypeCode: "HEALTH_INSURANCE", status: "의무가입", statusCode: "MANDATORY", reason: "외국인 근로자 전원 의무가입" },
    { insuranceType: "고용보험", insuranceTypeCode: "EMPLOYMENT_INSURANCE", status: "자동가입(급여신청형)", statusCode: "AUTO_BENEFITS_OPT_IN", reason: "E-9 피보험자격 자동취득" },
    { insuranceType: "산재보험", insuranceTypeCode: "INDUSTRIAL_ACCIDENT", status: "의무가입", statusCode: "MANDATORY", reason: "외국인 근로자 전원 의무가입" },
  ],
},
{
  id: 2,
  name: "Zhang Wei",
  nationality: "CHINA",
  visaType: "H2",
  visaExpiryDate: "2027-06-15",
  dateOfBirth: "1988-11-20",
  status: "ACTIVE",
  insuranceEligibilities: [
    { insuranceType: "국민연금", insuranceTypeCode: "NATIONAL_PENSION", status: "가입제외", statusCode: "EXEMPT", reason: "사회보장협정 체결국 근로자" },
    { insuranceType: "건강보험", insuranceTypeCode: "HEALTH_INSURANCE", status: "의무가입", statusCode: "MANDATORY", reason: "외국인 근로자 전원 의무가입" },
    { insuranceType: "고용보험", insuranceTypeCode: "EMPLOYMENT_INSURANCE", status: "자동가입(급여신청형)", statusCode: "AUTO_BENEFITS_OPT_IN", reason: "H-2 피보험자격 자동취득" },
    { insuranceType: "산재보험", insuranceTypeCode: "INDUSTRIAL_ACCIDENT", status: "의무가입", statusCode: "MANDATORY", reason: "외국인 근로자 전원 의무가입" },
  ],
},
```

4. `SAMPLE_DEADLINE_TYPES`와 `SAMPLE_DEADLINE_DESCS` 업데이트:

```ts
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
```

5. 수동 작성 deadline 데이터(id:2)도 업데이트:

```ts
{
  id: 2,
  workerId: 2,
  deadlineType: "HEALTH_INSURANCE_ENROLLMENT",
  dueDate: "2025-11-30",
  status: "OVERDUE",
  description: "건강보험 취득신고 기한 초과",
},
```

- [ ] **Step 2: Update mocks/dashboard-data.ts**

`alerts[1]`의 `deadlineType` 변경:

```ts
{
  deadlineId: 2,
  workerId: 2,
  workerName: "Pham Thi B",
  deadlineType: "HEALTH_INSURANCE_ENROLLMENT",
  status: "OVERDUE",
  dDay: 0,
  dueDate: "2026-03-29",
  description: "입사 후 14일이 경과했으나 건강보험 취득신고가 완료되지 않았습니다.",
},
```

`upcomingDeadlines[1]`도 동일 변경:

```ts
{
  deadlineId: 2,
  workerId: 2,
  workerName: "Pham Thi B",
  visaType: "E9",
  deadlineType: "HEALTH_INSURANCE_ENROLLMENT",
  status: "OVERDUE",
  dDay: 0,
  dueDate: "2026-03-29",
},
```

- [ ] **Step 3: Run full test suite**

Run: `npx vitest run`
Expected: PASS (일부 테스트에서 mock 데이터 변경 영향 확인)

- [ ] **Step 4: Commit**

```bash
git add mocks/data.ts mocks/dashboard-data.ts
git commit -m "feat: MSW mock 데이터에 statusCode/insuranceTypeCode/dateOfBirth + 데드라인 타입 반영"
```

---

### Task 8: 기존 테스트 수정 — worker-table, 기타

**Files:**
- Modify: `__tests__/components/worker-table.test.tsx`
- Modify: `__tests__/lib/use-paginated-workers.test.tsx`
- Modify: `__tests__/components/alert-group-card.test.tsx`
- Modify: `__tests__/components/deadline-table.test.tsx`
- Modify: `__tests__/components/deadline-chart.test.tsx`
- Modify: `__tests__/mocks/dashboard-data.test.ts`

- [ ] **Step 1: Update worker-table test — insurance filter**

`__tests__/components/worker-table.test.tsx`:

보험 필터 테스트 수정 — `"면제"` → `"가입제외"` (라벨맵 기준):

```ts
it("보험_상태_필터에서_가입제외를_선택하면_해당_근로자만_표시한다", async () => {
  render(<WorkerTable workers={mockWorkers} isLoading={false} />);
  const insuranceTrigger = screen.getByRole("combobox", { name: "보험 상태 전체" });
  await userEvent.click(insuranceTrigger);
  const option = screen.getByRole("option", { name: "가입제외" });
  await userEvent.click(option);
  const expectedCount = mockWorkers.filter((w) =>
    w.insuranceEligibilities.some((ie) => ie.statusCode === "EXEMPT"),
  ).length;
  expect(expectedCount).toBeGreaterThan(0);
  expect(screen.getByText(new RegExp(`총 ${expectedCount}건`))).toBeDefined();
});
```

- [ ] **Step 2: Update use-paginated-workers test**

`__tests__/lib/use-paginated-workers.test.tsx`:

`insuranceStatus: "면제"` → `insuranceStatus: "EXEMPT"` 변경. 필터 로직에서 `ie.status` → `ie.statusCode` 참조하는 부분 확인. 테스트 내 mock 데이터가 `mockWorkers`를 import하면 자동 반영됨. 필터값만 수정:

```ts
insuranceStatus: "EXEMPT",
```

```ts
w.insuranceEligibilities.some((ie) => ie.statusCode === "EXEMPT"),
```

- [ ] **Step 3: Update dashboard-related tests**

`__tests__/components/alert-group-card.test.tsx`, `__tests__/components/deadline-table.test.tsx`, `__tests__/components/deadline-chart.test.tsx`, `__tests__/mocks/dashboard-data.test.ts`:

이 파일들에서 `INSURANCE_ENROLLMENT` 참조를 `HEALTH_INSURANCE_ENROLLMENT` 등으로 변경. 각 파일을 열어 `INSURANCE_ENROLLMENT` 문자열을 검색하고 적절한 보험별 타입으로 교체.

- [ ] **Step 4: Run full test suite**

Run: `npx vitest run`
Expected: ALL PASS

- [ ] **Step 5: Commit**

```bash
git add __tests__/
git commit -m "test: 보험 도메인 보강에 따른 전체 테스트 업데이트"
```

---

### Task 9: 최종 검증 + 빌드

- [ ] **Step 1: TypeScript 컴파일 확인**

Run: `npx tsc --noEmit`
Expected: 에러 없음

- [ ] **Step 2: Lint 확인**

Run: `npm run lint`
Expected: 에러 없음

- [ ] **Step 3: 전체 테스트**

Run: `npm run test`
Expected: ALL PASS

- [ ] **Step 4: 빌드 확인**

Run: `npm run build`
Expected: 성공

- [ ] **Step 5: 비교 HTML 정리**

```bash
rm insurance-badge-comparison.html
```

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore: 빌드 검증 + 임시 파일 정리"
```
