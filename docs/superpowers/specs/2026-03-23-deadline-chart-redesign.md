# 임박 데드라인 분포 차트 리디자인

> 날짜: 2026-03-23

## 배경

대시보드와 컴플라이언스 페이지의 "임박 데드라인 분포 (30일)" 차트가 단색 막대 그래프로 밋밋함. 상태별 색상 구분과 스타일링 개선이 필요.

## 목표

- 상태별(긴급/임박/대기) 색상 구분으로 정보 밀도 향상
- 둥근 모서리, 커스텀 Tooltip, 마운트 애니메이션으로 시각적 완성도 개선
- 기존 props 인터페이스 유지 (대시보드/컴플라이언스 페이지 영향 없음)

## 디자인

### 차트 타입

Recharts **StackedBar** — 날짜별 누적 막대. 날짜별 총건수와 상태 비율을 동시에 전달.

### 데이터 구조 변경

현재 날짜별 `count`만 집계 → 날짜 × 상태별 그룹핑:

```ts
// Before
{ date: string; count: number }

// After
{ date: string; urgent: number; approaching: number; pending: number }
```

`useMemo` 내부에서 `deadlines`를 순회하며 `dueDate` + `status`로 그룹핑.

- OVERDUE, COMPLETED 상태는 차트에서 제외 (이미 별도 테이블에서 관리)

### 색상 체계

| 상태 | 색상 | CSS 변수 또는 값 |
|------|------|-----------------|
| URGENT | red-500 | `#ef4444` |
| APPROACHING | amber-500 | `#f59e0b` |
| PENDING | green-500 | `#22c55e` |

SPEC의 데드라인 색상 체계(OVERDUE 빨강 → URGENT 주황 → APPROACHING 노랑 → PENDING 초록)와 유사하되, 차트에서는 OVERDUE가 제외되므로 URGENT를 빨강으로 승격하여 시각적 경고 효과를 극대화.

> **의도적 편차**: SPEC 기준 URGENT=주황이지만, 이 차트에서는 OVERDUE 부재 시 빨강을 URGENT에 할당. 차트 로컬 오버라이드이며, 테이블 등 다른 UI에는 적용하지 않음.

### 스타일링

- **둥근 모서리**: URGENT(최상단) Bar만 `radius={[4, 4, 0, 0]}`, 나머지(APPROACHING, PENDING)는 `radius={[0, 0, 0, 0]}`
- **커스텀 Tooltip**: 다크모드 대응, 상태별 건수 + 총건수 표시
- **X축 날짜 포맷**: `dueDate`는 ISO 문자열(`"2026-03-25"`). `MM/DD` 형식으로 변환하여 표시
- **Tooltip 날짜 포맷**: `MM/DD (요일)` — `Intl.DateTimeFormat('ko-KR', { weekday: 'short' })`로 요일 파생
- **CartesianGrid**: 점선 유지, stroke 연하게 (`stroke="hsl(var(--border))"`)
- **Y축**: `allowDecimals={false}` 유지 (건수는 정수)
- **마운트 애니메이션**: `animationDuration={800}`, `prefers-reduced-motion` 미디어 쿼리 시 `isAnimationActive={false}`
- **커스텀 범례**: 차트 상단, 색상 원 + 한글 라벨 (긴급 / 임박 / 대기)

### 스택 순서 (아래 → 위)

1. PENDING (초록) — 가장 아래
2. APPROACHING (주황) — 중간
3. URGENT (빨강) — 가장 위 (시선 집중)

### 커스텀 Tooltip 구조

```
3/25 (목)
─────────
긴급  1건
임박  2건
대기  3건
─────────
합계  6건
```

배경: `hsl(var(--popover))`, 테두리: `hsl(var(--border))`, 텍스트: `hsl(var(--popover-foreground))`

## 변경 범위

| 파일 | 변경 내용 |
|------|----------|
| `components/dashboard/deadline-chart.tsx` | useMemo 그룹핑 로직 변경, StackedBar + 커스텀 Tooltip/Legend |

- 외부 인터페이스(props) 변경 없음
- `app/(app)/page.tsx`, `app/(app)/compliance/page.tsx` 수정 불필요

## 테스트

테스트 케이스 (Vitest + Testing Library):

1. **빈 배열** → "데이터가 없습니다" 빈 상태 렌더
2. **OVERDUE/COMPLETED만** → 모두 필터링되어 빈 상태 렌더
3. **혼합 상태** → 날짜별 상태 그룹핑이 올바른지 검증 (urgent/approaching/pending 카운트)
4. **단일 날짜, 단일 상태** → 정상 렌더
5. **로딩 상태** → Skeleton 렌더
6. **에러 상태** → 에러 메시지 렌더
