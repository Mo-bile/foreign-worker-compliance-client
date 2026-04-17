# 보험 도메인 보강 FE 대응 — 설계 문서

> 작성일: 2026-04-17 | 관련: `docs/task-insurance-fix-fe.md` (rev.2)
> Breaking 변경 3건: dateOfBirth 추가, 고용보험 5상태, 데드라인 타입 4분리

---

## 0. BE 응답 구조 변경 (전제)

BE가 `InsuranceEligibilityResult`에 영문 코드 필드를 추가했다:

```json
{
  "insuranceType": "국민연금",
  "insuranceTypeCode": "NATIONAL_PENSION",
  "status": "의무가입",
  "statusCode": "MANDATORY",
  "reason": "..."
}
```

FE 규약:
- **`statusCode` / `insuranceTypeCode`** → 로직용 (뱃지 색상, 필터, 집계, 타입 체크)
- **`status` / `insuranceType`** → 표시용 (UI 라벨). `regionName`/`industryCategoryName` 패턴과 동일

---

## 1. InsuranceStatus 영문 enum 전환

### AS-IS

```ts
export const INSURANCE_STATUSES = ["의무", "임의", "면제"] as const;
export type InsuranceStatus = (typeof INSURANCE_STATUSES)[number];
```

### TO-BE

5상태. "의무가입"(기존 MANDATORY)이 유지되고 고용보험 전용 3상태가 추가됨:

```ts
export const INSURANCE_STATUSES = [
  "MANDATORY",
  "FULL_MANDATORY",
  "AUTO_BENEFITS_OPT_IN",
  "OPTIONAL_ON_APPLICATION",
  "EXEMPT",
] as const;
export type InsuranceStatus = (typeof INSURANCE_STATUSES)[number];
```

라벨은 BE `status` (한글) 필드를 그대로 표시하므로 **FE 라벨 맵 불필요**. `InsuranceBadge`가 `statusCode`로 색상을 결정하고, 표시 텍스트는 BE `status`를 사용.

### BE 응답 ↔ FE 매핑

| BE `statusCode` | BE `status` (표시용) | 대상 보험 | 뱃지 색상 |
|-----------------|---------------------|----------|----------|
| `MANDATORY` | 의무가입 | 국민연금/건강보험/산재보험 | Blue |
| `FULL_MANDATORY` | 전부 의무적용 | 고용보험 (F2/F5/F6) | Blue |
| `AUTO_BENEFITS_OPT_IN` | 자동가입(급여신청형) | 고용보험 (E9/H2) | Indigo |
| `OPTIONAL_ON_APPLICATION` | 신청시가입 | 고용보험 (E7 등) | Gray |
| `EXEMPT` | 가입제외 | 면제 대상 | Green |

### `InsuranceEligibilityDto` 타입 변경

```ts
export interface InsuranceEligibilityDto {
  readonly insuranceType: string;       // "국민연금" (표시용)
  readonly insuranceTypeCode: string;   // "NATIONAL_PENSION" (로직용)
  readonly status: string;              // "의무가입" (표시용)
  readonly statusCode: InsuranceStatus; // "MANDATORY" (로직용)
  readonly reason: string;
}
```

### 영향 범위

| 파일 | 변경 내용 |
|------|----------|
| `types/api.ts` | `INSURANCE_STATUSES` 5개 영문 enum으로 변경, `InsuranceEligibilityDto`에 `insuranceTypeCode`+`statusCode` 추가 |
| `components/workers/insurance-badge.tsx` | props를 `{ statusCode, label }` 로 변경. statusCode로 색상, label(=BE status)로 텍스트 |
| `components/workers/worker-table.tsx` | 필터가 `statusCode` 기반. `FilterSelect`에 라벨 맵 전달 (필터 드롭다운에서만 필요) |
| `app/(app)/workers/[id]/page.tsx` | `InsuranceBadge`에 `statusCode`+`status` 전달 |
| `mocks/data.ts` | mock 데이터에 `insuranceTypeCode`+`statusCode` 추가 |
| `__tests__/` | 관련 테스트 업데이트 |

### 필터 드롭다운 라벨 맵

필터 UI에서만 라벨이 필요 (BE 한글을 쓸 수 없는 유일한 곳):

```ts
export const INSURANCE_STATUS_LABELS: Record<InsuranceStatus, string> = {
  MANDATORY: "의무가입",
  FULL_MANDATORY: "전부 의무적용",
  AUTO_BENEFITS_OPT_IN: "자동가입(급여신청형)",
  OPTIONAL_ON_APPLICATION: "신청시가입",
  EXEMPT: "가입제외",
};
```

---

## 2. 뱃지 색상 — Indigo 톤 다운 (A안)

### 색상 매핑

| `statusCode` | 색상 | CSS 변수 | oklch 값 |
|--------------|------|----------|----------|
| `MANDATORY` | Blue | `--signal-blue` / `--signal-blue-bg` | 기존 유지 |
| `FULL_MANDATORY` | Blue | `--signal-blue` / `--signal-blue-bg` | 기존 유지 |
| `AUTO_BENEFITS_OPT_IN` | Indigo | `--signal-indigo` / `--signal-indigo-bg` | `oklch(0.55 0.12 280)` / `oklch(0.93 0.03 280)` |
| `OPTIONAL_ON_APPLICATION` | Gray | `--signal-gray` / `--signal-gray-bg` | 기존 유지 |
| `EXEMPT` | Green | `--signal-green` / `--signal-green-bg` | 기존 유지 |

`MANDATORY`와 `FULL_MANDATORY`는 둘 다 Blue — 사용자 관점에서 "완전 의무"로 동일한 의미.

### 변경 파일

| 파일 | 변경 내용 |
|------|----------|
| `app/globals.css` | `--signal-indigo`, `--signal-indigo-bg` 변수 추가 (light + dark) |
| `app/globals.css` (`@theme inline`) | `--color-signal-indigo`, `--color-signal-indigo-bg` 추가 |
| `components/workers/insurance-badge.tsx` | `STATUS_STYLES` 맵 영문 enum 5개 키로 전환 + indigo 스타일 추가 |

### Dark 모드 값

```css
/* light */
--signal-indigo: oklch(0.55 0.12 280);
--signal-indigo-bg: oklch(0.93 0.03 280);

/* dark */
--signal-indigo-bg: oklch(0.2 0.06 280);
```

---

## 3. dateOfBirth 필드 추가

### Zod 스키마

```ts
// types/api.ts — registerWorkerRequestSchema에 추가
dateOfBirth: z.string()
  .regex(isoDateRegex, "날짜 형식: YYYY-MM-DD")
  .refine((val) => new Date(val) <= new Date(), "미래 날짜는 입력할 수 없습니다"),
```

### 폼 배치

```
이름         | 생년월일      ← NEW (개인 식별 정보 그룹)
사업장       | 국적
비자 유형    | 비자 만료일
입국일       | 계약 시작일
계약 종료일  | 여권번호
외국인등록번호| 연락처
이메일       |
```

### 근로자 상세 페이지

`app/(app)/workers/[id]/page.tsx`의 "기본 정보" 카드에 `dateOfBirth` 표시 추가:

```tsx
<div>
  <dt className="text-sm text-muted-foreground">생년월일</dt>
  <dd className="font-medium">{w.dateOfBirth}</dd>
</div>
```

### 영향 범위

| 파일 | 변경 내용 |
|------|----------|
| `types/api.ts` | `registerWorkerRequestSchema`에 `dateOfBirth` 추가 |
| `types/api.ts` | `WorkerResponse` 인터페이스에 `dateOfBirth: string` 추가 |
| `components/workers/worker-form.tsx` | `dateOfBirth` 입력 필드 추가 (이름 다음), defaultValues에 추가 |
| `app/(app)/workers/[id]/page.tsx` | 기본 정보에 생년월일 표시 |
| `app/api/workers/route.ts` | POST body에 dateOfBirth 포함 (스키마 통과 시 자동 포함) |
| `mocks/data.ts` | mock worker 데이터에 dateOfBirth 추가 |

---

## 4. DeadlineType enum 확장 (A안)

### AS-IS

```ts
export const DEADLINE_TYPES = [
  "VISA_EXPIRY",
  "INSURANCE_ENROLLMENT",
  "CHANGE_REPORT",
  "CONTRACT_RENEWAL",
] as const;
```

### TO-BE

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

### 라벨 맵

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

### 영향 범위

| 파일 | 변경 내용 |
|------|----------|
| `types/api.ts` | `DEADLINE_TYPES` 배열 수정 + `DEADLINE_TYPE_LABELS` 맵 수정 |
| `lib/transforms/dashboard-transform.ts` | `ALERT_TITLE_MAP`에서 `INSURANCE_ENROLLMENT` → 4개 보험별 키로 변경 |
| `app/(app)/compliance/page.tsx` | 필터 드롭다운 — 자동 반영 (DEADLINE_TYPES 배열 사용 시) |
| `mocks/data.ts` | deadline mock 데이터 `INSURANCE_ENROLLMENT` → 보험별 타입 교체 |
| `mocks/dashboard-data.ts` | dashboard mock 데이터 업데이트 |

### 전수 검색 대상

`INSURANCE_ENROLLMENT` 문자열 참조 위치 (9개 파일 확인됨):

- `types/api.ts` — enum 정의 + 라벨 맵
- `mocks/data.ts` — mock 데이터 2곳
- `mocks/dashboard-data.ts` — dashboard mock
- `lib/transforms/dashboard-transform.ts` — ALERT_TITLE_MAP
- `__tests__/components/alert-group-card.test.tsx`
- `__tests__/lib/transforms/dashboard-transform.test.ts`
- `__tests__/components/deadline-table.test.tsx`
- `__tests__/components/deadline-chart.test.tsx`
- `__tests__/mocks/dashboard-data.test.ts`

---

## 5. Nationality 2개 추가

### 추가 항목

| enum 값 | ISO 코드 | 한글명 |
|---------|---------|--------|
| `EAST_TIMOR` | TL | 동티모르 |
| `LAOS` | LA | 라오스 |

### 영향 범위

| 파일 | 변경 내용 |
|------|----------|
| `types/api.ts` | `NATIONALITIES` 배열에 2개 추가, `NATIONALITY_LABELS` 맵에 2개 추가 |
| `mocks/data.ts` | mock 데이터에 새 국적 근로자 추가 (선택) |

> 주: 드롭다운은 `/api/metadata`에서 동적 로드하므로, 하드코딩 상수는 폴백 용도. metadata API가 이미 26개국을 반환하면 UI는 자동 반영됨.

---

## 6. MSW Mock 업데이트

### 변경 사항

| mock 파일 | 변경 내용 |
|-----------|----------|
| `mocks/data.ts` | worker mock: `insuranceTypeCode`+`statusCode` 필드 추가, `dateOfBirth` 추가, deadline `INSURANCE_ENROLLMENT` → 보험별 분리 |
| `mocks/dashboard-data.ts` | 긴급 알림 deadlineType 보험별 분리 |

### 듀얼 핸들러

현재 worker/compliance BFF 라우트에 transform이 없음 (패스스루). BE 응답 형식 = FE 사용 형식이므로 `BACKEND` 경로와 `*` 경로가 같은 데이터를 반환. 이번에도 transform 추가 없이 유지.

---

## 7. 테스트 계획

| 테스트 | 검증 내용 |
|--------|----------|
| `insurance-badge.test.tsx` | 5상태별 올바른 색상 클래스 렌더링 + 한글 라벨 표시 |
| `worker-form.test.tsx` | dateOfBirth 필드 렌더링 + 미래 날짜 거부 + 빈 값 제출 실패 |
| `schemas.test.ts` | registerWorkerRequestSchema에 dateOfBirth 포함 검증 |
| `dashboard-transform.test.ts` | 4개 보험별 데드라인 타입 → 올바른 alert 그룹 타이틀 매핑 |
| `deadline-table.test.tsx` | 7개 타입 필터링 정상 동작 |
| `worker-table.test.tsx` | 보험 필터가 `statusCode` 기반 영문 enum으로 동작 |

---

## 8. 범위 외 (이번에 하지 않는 것)

- 근로자 목록 테이블에 보험 상태 요약 컬럼 추가 — task 문서 "(선택)". 별도 PR
- 보험 reason 텍스트 부가 정보 — BE reason에 이미 포함. FE 추가 작업 없음
- 대시보드 보험 집계 로직 — BE `requiresEnrollment()`로 처리. FE 변경 없음
- Workers BFF transform 도입 — BE가 영문 코드를 직접 제공하므로 불필요
