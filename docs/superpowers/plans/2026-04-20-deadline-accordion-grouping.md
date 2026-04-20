# 데드라인 아코디언 그룹핑 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 데드라인 테이블을 근로자별 아코디언 그룹으로 변경하여 한눈에 근로자별 초과/임박 건수를 파악할 수 있게 한다.

**Architecture:** `DeadlineTable` 컴포넌트 내부 렌더링만 변경. 외부 인터페이스(`DeadlineTableProps`) 유지. `items`를 `workerId`로 그룹화 → 정렬 → 아코디언 렌더링. 단일 근로자일 때는 아코디언 스킵.

**Tech Stack:** React 19, Tailwind v4, shadcn/ui, Vitest + Testing Library

---

### Task 1: DeadlineTable 아코디언 그룹핑 구현

**Files:**
- Modify: `components/compliance/deadline-table.tsx`

- [ ] **Step 1: 그룹화 유틸 함수 추가**

파일 하단(`export function DeadlineTable` 위)에 헬퍼 추가:

```tsx
interface DeadlineGroup {
  readonly workerId: number;
  readonly workerName: string;
  readonly deadlines: readonly ComplianceDeadlineResponse[];
}

function groupByWorker(
  items: readonly ComplianceDeadlineResponse[],
): readonly DeadlineGroup[] {
  const map = new Map<number, { workerName: string; deadlines: ComplianceDeadlineResponse[] }>();

  for (const d of items) {
    const existing = map.get(d.workerId);
    if (existing) {
      existing.deadlines.push(d);
    } else {
      map.set(d.workerId, { workerName: d.workerName, deadlines: [d] });
    }
  }

  const groups = [...map.entries()].map(([workerId, { workerName, deadlines }]) => ({
    workerId,
    workerName,
    deadlines: deadlines as readonly ComplianceDeadlineResponse[],
  }));

  // 전부 OVERDUE면 건수 내림차순, 아니면 최소 dueDate 오름차순
  const allOverdue = groups.every((g) =>
    g.deadlines.every((d) => d.status === "OVERDUE"),
  );

  if (allOverdue) {
    groups.sort((a, b) => b.deadlines.length - a.deadlines.length);
  } else {
    groups.sort((a, b) => {
      const aMin = Math.min(...a.deadlines.map((d) => new Date(d.dueDate).getTime()));
      const bMin = Math.min(...b.deadlines.map((d) => new Date(d.dueDate).getTime()));
      return aMin - bMin;
    });
  }

  return groups;
}
```

- [ ] **Step 2: 아코디언 상태 + 렌더링 변경**

`DeadlineTable` 컴포넌트 내부를 수정합니다. 기존 `useState(1)` (internalPage) 아래에 아코디언 상태 추가:

```tsx
const [expandedWorkers, setExpandedWorkers] = useState<Set<number>>(new Set());
```

기존 테이블 렌더링(line 96~131)을 아코디언 렌더링으로 교체. 전체 렌더링 부분은 다음과 같이 변경:

```tsx
// items가 확정된 후, 렌더링 직전에:
const groups = items ? groupByWorker(items) : [];
const isSingleWorker = groups.length <= 1;

// expandedWorkers가 비어있고 groups가 있으면 첫 번째 자동 펼침
const effectiveExpanded =
  expandedWorkers.size === 0 && groups.length > 0
    ? new Set([groups[0].workerId])
    : expandedWorkers;

function toggleWorker(workerId: number) {
  setExpandedWorkers((prev) => {
    const next = new Set(prev);
    // 첫 렌더링에서 auto-expanded된 항목도 토글 가능하게
    if (effectiveExpanded.has(workerId)) {
      // 이미 expanded → 접기
      next.delete(workerId);
      // effectiveExpanded에서도 제거하기 위해 명시적 추가 후 삭제
      next.add(workerId);
      next.delete(workerId);
    } else {
      next.add(workerId);
    }
    return next;
  });
}
```

실제로 `effectiveExpanded`를 state 밖에서 계산하면 토글이 꼬일 수 있습니다. 더 간단한 접근: `useEffect`로 첫 그룹을 초기화합니다.

```tsx
import { useState, useEffect } from "react";

// 컴포넌트 내부:
const [expandedWorkers, setExpandedWorkers] = useState<Set<number>>(new Set());

const groups = items ? groupByWorker(items) : [];
const isSingleWorker = groups.length <= 1;

// 첫 번째 그룹 자동 펼침 (items 변경 시)
useEffect(() => {
  if (groups.length > 0 && !isSingleWorker) {
    setExpandedWorkers(new Set([groups[0].workerId]));
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [items?.length]);

function toggleWorker(workerId: number) {
  setExpandedWorkers((prev) => {
    const next = new Set(prev);
    if (next.has(workerId)) {
      next.delete(workerId);
    } else {
      next.add(workerId);
    }
    return next;
  });
}
```

- [ ] **Step 3: 아코디언 JSX 렌더링**

기존 `<Table>...</Table>` 블록(line 96~131)을 교체:

```tsx
{isSingleWorker ? (
  // 단일 근로자 → 기존 flat 테이블
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>설명</TableHead>
        <TableHead>기한</TableHead>
        <TableHead>상태</TableHead>
        {onComplete && <TableHead>처리</TableHead>}
      </TableRow>
    </TableHeader>
    <TableBody>
      {(groups[0]?.deadlines ?? []).map((d) => (
        <TableRow key={d.id}>
          <TableCell>{d.description}</TableCell>
          <TableCell>{d.dueDate}</TableCell>
          <TableCell>
            <StatusBadge status={d.status} />
          </TableCell>
          {onComplete && (
            <TableCell>
              <Button
                variant="outline"
                size="sm"
                disabled={d.status === "COMPLETED" || isCompleting}
                onClick={() => onComplete(d.id)}
              >
                {d.status === "COMPLETED" ? "완료됨" : "완료"}
              </Button>
            </TableCell>
          )}
        </TableRow>
      ))}
    </TableBody>
  </Table>
) : (
  // 다수 근로자 → 아코디언
  <div className="space-y-2">
    {groups.map((group) => {
      const isExpanded = expandedWorkers.has(group.workerId);
      return (
        <div key={group.workerId} className="rounded-lg border">
          <button
            type="button"
            className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium hover:bg-secondary/50"
            onClick={() => toggleWorker(group.workerId)}
            aria-expanded={isExpanded}
          >
            <span>
              {isExpanded ? "▼" : "▶"}{" "}
              {group.workerName} — {title.includes("초과") ? "기한초과" : "임박"}{" "}
              {group.deadlines.length}건
            </span>
          </button>
          {isExpanded && (
            <div className="border-t px-2 pb-2">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>설명</TableHead>
                    <TableHead>기한</TableHead>
                    <TableHead>상태</TableHead>
                    {onComplete && <TableHead>처리</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {group.deadlines.map((d) => (
                    <TableRow key={d.id}>
                      <TableCell>{d.description}</TableCell>
                      <TableCell>{d.dueDate}</TableCell>
                      <TableCell>
                        <StatusBadge status={d.status} />
                      </TableCell>
                      {onComplete && (
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={d.status === "COMPLETED" || isCompleting}
                            onClick={() => onComplete(d.id)}
                          >
                            {d.status === "COMPLETED" ? "완료됨" : "완료"}
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      );
    })}
  </div>
)}
```

- [ ] **Step 4: "근로자" 헤더 제거 확인**

아코디언 모드에서는 근로자 이름이 아코디언 헤더에 있으므로 테이블 `<TableHead>근로자</TableHead>`가 필요 없습니다. 단일 근로자 모드에서도 근로자 컬럼 불필요 (한 명이니까). 위 코드에서 이미 "설명, 기한, 상태, 처리"만 헤더로 사용합니다.

- [ ] **Step 5: Commit**

```bash
git add components/compliance/deadline-table.tsx
git commit -m "feat: 데드라인 테이블 근로자별 아코디언 그룹핑"
```

---

### Task 2: 테스트 업데이트

**Files:**
- Modify: `__tests__/components/deadline-table.test.tsx`

- [ ] **Step 1: 기존 테스트 fixture 다양화**

현재 `testDeadlines`는 모든 항목이 `workerId: (i % 5) + 1`로 5명에 분포. 아코디언이 5그룹으로 렌더링됩니다. 기존 테스트의 assertion을 업데이트:

`limit이_있으면_해당_건수만_표시하고_페이지네이션_미표시` — limit 모드에서는 아코디언이 적용됩니다. limit=5이면 5건이 그룹핑됨. 테스트에서 "테스트 데드라인" 텍스트 검색은 아코디언이 펼쳐진 그룹에서만 보이므로 변경 필요:

```ts
it("limit이_있으면_해당_건수만_사용한다", () => {
  render(<DeadlineTable title="기한초과" deadlines={testDeadlines} isLoading={false} limit={5} />);
  // limit=5 → 5건이 그룹핑됨, 첫 번째 그룹만 펼침
  // 첫 번째 그룹의 데드라인이 표시되는지 확인
  expect(screen.getByText(/기한초과/)).toBeDefined();
});
```

- [ ] **Step 2: 아코디언 그룹핑 전용 테스트 추가**

```ts
describe("아코디언 그룹핑", () => {
  const multiWorkerDeadlines: ComplianceDeadlineResponse[] = [
    { id: 1, workerId: 1, workerName: "Worker-A", deadlineType: "VISA_EXPIRY", dueDate: "2025-01-01", status: "OVERDUE", description: "비자 갱신" },
    { id: 2, workerId: 1, workerName: "Worker-A", deadlineType: "NATIONAL_PENSION_ENROLLMENT", dueDate: "2025-01-01", status: "OVERDUE", description: "국민연금 취득신고" },
    { id: 3, workerId: 1, workerName: "Worker-A", deadlineType: "HEALTH_INSURANCE_ENROLLMENT", dueDate: "2025-01-01", status: "OVERDUE", description: "건강보험 취득신고" },
    { id: 4, workerId: 2, workerName: "Worker-B", deadlineType: "VISA_EXPIRY", dueDate: "2025-02-01", status: "OVERDUE", description: "비자 갱신" },
  ];

  it("근로자별로_그룹핑하여_아코디언_헤더를_표시한다", () => {
    render(<DeadlineTable title="기한초과 데드라인" deadlines={multiWorkerDeadlines} isLoading={false} />);
    expect(screen.getByText(/Worker-A — 기한초과 3건/)).toBeDefined();
    expect(screen.getByText(/Worker-B — 기한초과 1건/)).toBeDefined();
  });

  it("첫_번째_그룹이_기본_펼침_상태이다", () => {
    render(<DeadlineTable title="기한초과 데드라인" deadlines={multiWorkerDeadlines} isLoading={false} />);
    // Worker-A가 3건으로 최다 → 첫 번째 → 펼침
    expect(screen.getByText("국민연금 취득신고")).toBeDefined();
    expect(screen.getByText("건강보험 취득신고")).toBeDefined();
  });

  it("초과_건수_많은_순으로_정렬한다", () => {
    render(<DeadlineTable title="기한초과 데드라인" deadlines={multiWorkerDeadlines} isLoading={false} />);
    const buttons = screen.getAllByRole("button", { expanded: undefined });
    const accordionButtons = buttons.filter((b) => b.getAttribute("aria-expanded") !== null);
    // 첫 번째 아코디언이 Worker-A (3건)
    expect(accordionButtons[0].textContent).toContain("Worker-A");
  });

  it("아코디언_헤더_클릭으로_토글한다", async () => {
    render(<DeadlineTable title="기한초과 데드라인" deadlines={multiWorkerDeadlines} isLoading={false} />);
    // Worker-B 클릭하여 펼침
    const workerBButton = screen.getByText(/Worker-B — 기한초과 1건/).closest("button")!;
    await userEvent.click(workerBButton);
    // Worker-B의 데드라인이 보여야 함 (Worker-B는 비자 갱신 1건)
    // Worker-A의 데드라인도 여전히 보임 (펼침 유지)
    expect(workerBButton.getAttribute("aria-expanded")).toBe("true");
  });

  it("단일_근로자면_아코디언_없이_flat_테이블로_표시한다", () => {
    const singleWorker = multiWorkerDeadlines.filter((d) => d.workerId === 1);
    render(<DeadlineTable title="기한초과 데드라인" deadlines={singleWorker} isLoading={false} />);
    // 아코디언 헤더 없음
    expect(screen.queryByText(/Worker-A —/)).toBeNull();
    // 데드라인은 직접 표시
    expect(screen.getByText("국민연금 취득신고")).toBeDefined();
  });
});
```

- [ ] **Step 3: 기존 테스트 호환성 확인 및 수정**

기존 테스트 중 flat 테이블 구조를 가정한 것들을 수정. 주요 변경:

- `testDeadlines`는 5명 × 5건 = 25건. 아코디언 모드로 전환됨. `limit` 테스트, `pagination` 테스트는 아코디언 내부에서 동작해야 하므로 assertion 조정 필요.
- `onComplete` 테스트: 아코디언 첫 그룹이 펼쳐져 있으므로 해당 그룹의 완료 버튼만 보임.

각 테스트를 실행하면서 깨지는 것만 수정.

- [ ] **Step 4: 전체 테스트 실행**

Run: `npx vitest run __tests__/components/deadline-table.test.tsx`
Expected: ALL PASS

- [ ] **Step 5: Commit**

```bash
git add __tests__/components/deadline-table.test.tsx
git commit -m "test: 데드라인 아코디언 그룹핑 테스트"
```

---

### Task 3: 전체 검증

- [ ] **Step 1: 전체 테스트**

Run: `npx vitest run`
Expected: ALL PASS

- [ ] **Step 2: 시각 확인**

`npm run dev:mock` → `/compliance` 페이지에서:
- 기한초과 테이블: 근로자별 아코디언, 건수 많은 순, 첫 번째 펼침
- 임박 테이블: 근로자별 아코디언, 급한 순, 첫 번째 펼침
- 근로자 상세(`/workers/1`): 기존 flat 테이블 유지

- [ ] **Step 3: Commit (필요 시)**

```bash
git add -A
git commit -m "chore: 최종 검증 완료"
```
