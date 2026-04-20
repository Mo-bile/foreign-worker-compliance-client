# Compliance companyId 필터 + 데드라인 workerName 표시 — 설계 문서

> 작성일: 2026-04-20 | 관련: Mo-bile/foreign-worker-management#41
> BE 수정 완료: companyId 필터 동작 + ComplianceDeadlineResponse에 workerName 추가

---

## 1. companyId 주입 — useCompanyContext() 패턴

### 현재 문제

compliance 쿼리 훅(`use-compliance.ts`)과 BFF 라우트가 `companyId`를 전달하지 않아, 전 회사 데이터가 섞여 표시됨.

### 설계

workers 페이지와 동일한 패턴 적용:

```
CompanyProvider (selectedCompanyId)
  → compliance/page.tsx (useCompanyContext → companyId)
    → useOverdueDeadlines(companyId)
    → useUpcomingDeadlines(30, companyId)
      → fetchApi("/api/compliance/overdue?companyId=1")
        → BFF route → apiClient.get("/api/compliance/overdue?companyId=1")
          → BE
```

### 변경 파일

| 파일 | 변경 |
|------|------|
| `lib/queries/use-compliance.ts` | `useOverdueDeadlines(companyId)`, `useUpcomingDeadlines(days, companyId)` — companyId 파라미터 추가. null이면 `enabled: false` |
| `app/api/compliance/overdue/route.ts` | searchParams에서 `companyId` 읽어 BE로 전달 |
| `app/api/compliance/upcoming/route.ts` | searchParams에서 `companyId` 읽어 BE로 전달 |
| `app/(app)/compliance/page.tsx` | `useCompanyContext()`에서 `selectedCompanyId` 가져와 훅에 전달 |

### 쿼리 키

```ts
// companyId가 queryKey에 포함되어야 회사 전환 시 자동 리패치
queryKey: ["compliance", "overdue", { companyId }]
queryKey: ["compliance", "upcoming", days, { companyId }]
```

### usePaginatedOverdueDeadlines / usePaginatedUpcomingDeadlines

이 래퍼 훅들은 내부에서 `useOverdueDeadlines()` / `useUpcomingDeadlines()`를 호출하므로, 원본 훅에 companyId가 추가되면 래퍼도 companyId를 받아 전달해야 함:

```ts
export function usePaginatedOverdueDeadlines(
  companyId: number | null,
  filters: ComplianceFilterValues,
  page: number,
)
```

---

## 2. ComplianceDeadlineResponse에 workerName 추가

### 타입 변경

```ts
export interface ComplianceDeadlineResponse {
  readonly id: number;
  readonly workerId: number;
  readonly workerName: string;  // NEW
  readonly deadlineType: DeadlineType;
  readonly dueDate: string;
  readonly status: DeadlineStatus;
  readonly description: string;
}
```

---

## 3. 데드라인 테이블 — "근로자" 컬럼

### AS-IS

```
| 근로자 ID | 설명 | 기한 | 상태 |
| 1         | ... | ... | ...  |
```

### TO-BE

```
| 근로자              | 설명 | 기한 | 상태 |
| Nguyen Van Minh (1) | ... | ... | ...  |
```

### 변경 파일

| 파일 | 변경 |
|------|------|
| `components/compliance/deadline-table.tsx` | `<TableHead>근로자 ID</TableHead>` → `<TableHead>근로자</TableHead>`, 셀에 `{d.workerName} ({d.workerId})` 표시 |

---

## 4. Mock 데이터

| 파일 | 변경 |
|------|------|
| `mocks/data.ts` | deadline mock에 `workerName` 필드 추가. 수동 작성 deadline과 generateOverdueDeadline/generateUpcomingDeadline 모두 |
| `mocks/dashboard-data.ts` | dashboard alerts/upcomingDeadlines는 이미 `workerName` 포함 — 변경 없음 |

---

## 5. 테스트

| 테스트 | 변경 |
|--------|------|
| `__tests__/components/deadline-table.test.tsx` | mock 데이터에 `workerName` 추가, "근로자" 헤더 검증 |
| `__tests__/lib/use-paginated-compliance.test.tsx` | companyId 파라미터 추가 |
| `__tests__/components/deadline-chart.test.tsx` | mock에 `workerName` 추가 (타입 오류 방지) |

---

## 6. 범위 외

- `useWorkerDeadlines(workerId)` — 근로자 상세 페이지용. companyId 불필요 (이미 workerId로 스코핑)
- `useCompleteDeadline()` — mutation. companyId 불필요 (deadlineId로 동작)
- 대시보드 compliance 데이터 — 대시보드 API(`/api/dashboard?companyId=`)가 별도로 처리. 이번 범위 아님
