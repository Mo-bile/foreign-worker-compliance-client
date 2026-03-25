# 대시보드 리뉴얼 디자인 스펙

> 기준 문서: `FE-HANDOFF.md`, `DESIGN-DECISIONS.md`, `SPEC-frontend.md`, `ui-mockup-dashboard.html`

---

## 1. 목표

기존 간소화 대시보드(StatCard 3개 + 데드라인 테이블/차트)를 목업 기준으로 업그레이드.
사업주가 로그인 후 "지금 뭘 해야 하는지" 즉시 파악할 수 있는 화면.

## 2. 레이아웃

```
[StatCard ×3 (균등)]  [StatCard 긴급 (row-span-2, signal-red-bg)]
─────────────────────────────────────────────────────────────────
[긴급 알림 카드 ×3]                    │ [컴플라이언스 게이지]
[비자분포 바 | 4대보험 현황]           │ [다가오는 데드라인 ×5]
[AI 인사이트 + 면책 고지]             │
```

- 메인 그리드: `grid-template-columns: 1fr 360px`
- StatCard 그리드: `grid-template-columns: repeat(3, 1fr) 1fr`
- 긴급 카드: 4번째 칸, `grid-column: 4`, `grid-row: 1 / 3` (2행 차지)

## 3. 데이터 모델

### API: `GET /api/dashboard`

```typescript
interface DashboardResponse {
  stats: {
    totalWorkers: number;
    visaBreakdown: { type: string; count: number }[];
    insuranceRate: number;
    insuranceRateChange: number;
    upcomingDeadlines: number;
    deadlineBreakdown: { d7: number; d30: number };
    urgentActions: number;
    urgentBreakdown: { visa: number; insurance: number };
  };
  alerts: {
    id: string;
    level: "critical" | "warning" | "info";
    title: string;
    description: string;
    dDay: number | null;
    badgeText: string;
    actions: { label: string; href: string }[];
  }[];
  visaDistribution: { type: string; count: number; percentage: number }[];
  insuranceSummary: {
    type: string;
    enrolled: number;
    label: string;
    status: "ok" | "warn";
    statusText: string;
  }[];
  complianceScore: {
    total: number;
    breakdown: { label: string; score: number }[];
  };
  aiInsight: string; // HTML string with <strong> tags
  upcomingDeadlines: {
    id: string;
    title: string;
    workerName: string;
    visaType: string;
    dDay: number;
    urgency: "overdue" | "d7" | "d30" | "safe";
  }[];
}
```

### Mock 데이터

목업 HTML의 하드코딩 값을 그대로 사용:
- 등록 근로자: 12명 (E-9 8, H-2 3, E-7 1)
- 보험 가입률: 91.7% (↑4.2%p)
- 다가오는 데드라인: 5건 (D-7 2건, D-30 3건)
- 긴급 조치: 3건 (비자 1, 보험 2)
- 컴플라이언스 점수: 73 (보험 92, 데드라인 65, 임금 62)

## 4. 컴포넌트 설계

### 4-1. StatCard 리뉴얼

기존 `components/dashboard/stat-card.tsx` 확장:
- `variant` prop 추가: `"default" | "urgent"`
- urgent: `signal-red-bg` 배경, 큰 숫자(48px), row-span-2
- `subtitle` prop: 하위 정보 텍스트
- `change` prop: `{ direction: "up" | "down"; text: string }` (변동 표시)

### 4-2. AlertCard (신규)

```
Props: { level, title, description, dDay, badgeText, actions }
```
- level에 따라 배경색/dot색/버튼색 결정
- actions: CTA 버튼 배열

### 4-3. ComplianceGauge (신규)

- SVG 반원 아크 (180도)
- linearGradient: red → orange → yellow → green
- stroke-dashoffset로 점수 반영
- 하단 등급 스케일 (90+ 우수, 70~89 양호, 50~69 주의, 50미만 위험)
- breakdown 그리드: 보험/데드라인/임금 점수

### 4-4. VisaDistributionBar (신규)

- 수평 바 차트 (Recharts 불필요, div 기반)
- 비자 타입별 라벨 + 프로그레스 바 + 인원수

### 4-5. InsuranceSummary (신규)

- 4열 그리드 (국민연금/건강보험/고용보험/산재보험)
- 각 항목: 숫자 + 라벨 + 상태(✓ 가입 / N 미가입)
- 툴팁: "비자 유형별 보험 가입 의무가 상이합니다"

### 4-6. AiInsightBlock (신규, 공통)

다른 화면에서도 재사용:
- `bg-secondary` 배경
- `✦ AI 분석` 태그 (primary 색상)
- 본문: `text-sm leading-relaxed`, `<strong>` 강조
- 면책 고지: 하단 구분선 + 10px muted 텍스트

### 4-7. DeadlineMiniTimeline (신규)

- 목록 형태 (기존 DeadlineTable과 별개)
- urgency 바 (4px 세로, 색상별) + 제목 + 근로자명 + D-day

## 5. CSS 변수 동기화

globals.css의 :root와 .dark를 목업 HTML의 값으로 업데이트.
주요 차이점:
- `--background`: 현재 `oklch(0.965 0.005 255)` → 목업 `oklch(0.99 0.00 0)`
- `--primary`: 현재 `oklch(0.30 0.06 255)` → 목업 `oklch(0.42 0.12 260)`
- 사이드바 토큰 추가 (sidebar-bg, sidebar-fg 등)
- chart 변수 동기화

## 6. 기존 코드 영향

- `StatCard`: 확장 (breaking change 없음, 새 props는 optional)
- `DeadlineChart`, `DeadlineTable`: 대시보드에서 제거하되 컴포넌트 자체는 유지 (다른 페이지에서 사용)
- 기존 `useWorkers`, `useOverdueDeadlines` 등은 대시보드에서 사용 안 함 → 새 `useDashboard` 훅으로 대체

## 7. 테스트 계획

- StatCard: 기존 테스트 확장 (urgent variant)
- AlertCard: level별 렌더링, 액션 버튼 클릭
- ComplianceGauge: 점수별 색상, breakdown 표시
- DashboardPage: mock API로 전체 렌더링 통합 테스트
