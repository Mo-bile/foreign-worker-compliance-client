# Korean Professional Design System

## Overview

FWC 프로젝트의 디자인 시스템을 "Korean Professional" 방향으로 리디자인한다.
현재 shadcn 기본 디자인에서 벗어나, 한글 최적화 타이포그래피 + 네이비/골드 브랜딩 + 시맨틱 시그널 컬러 시스템을 도입한다.

### Goals

- 한글 가독성 극대화 (Pretendard Variable)
- 브랜드 아이덴티티 확립 (네이비 primary + 골드 accent-decorative)
- 상태 컬러를 CSS 변수로 중앙 관리 (다크모드 완전 대응)
- 기존 컴포넌트 구조/로직은 유지

### Non-Goals

- 레이아웃 구조 변경 (header/sidebar/main)
- `--sidebar-*` orphaned 변수 정리 (별도 스코프)
- 다크모드 토글 메커니즘 변경

---

## 1. Typography

### Font Stack

| Role | Font | Loading |
|------|------|---------|
| Sans (primary) | Pretendard Variable | `next/font/local` via `public/fonts/` |
| Mono | Geist Mono | `next/font/google` (기존 유지) |
| Heading | Pretendard Variable (weight 변화로 위계 표현) | 동일 |

### Implementation

1. `npm install pretendard`
2. `package.json`에 postinstall 스크립트 추가:
   ```json
   "postinstall": "cp node_modules/pretendard/dist/web/variable/woff2/PretendardVariable.woff2 public/fonts/"
   ```
3. `app/layout.tsx`:
   ```tsx
   import localFont from "next/font/local";
   import { Geist_Mono } from "next/font/google";

   const pretendard = localFont({
     src: "../public/fonts/PretendardVariable.woff2",
     variable: "--font-pretendard",
     weight: "45 920",
   });
   ```
4. `app/globals.css`의 순환참조 버그 수정 — `@theme inline` 블록 내에서:
   ```css
   /* @theme inline 블록 내 */
   --font-sans: var(--font-pretendard);  /* was: var(--font-sans) — circular */
   ```
   `@theme inline`에서 `--font-sans`가 자기 자신을 참조하고 있으므로, `var(--font-pretendard)`로 교체해야 순환참조가 해소된다.
5. `app/layout.tsx`에서 기존 `Geist` import와 `geistSans` 상수를 제거한다. `Geist_Mono`는 유지.

### Rationale

- Pretendard는 Inter 기반이지만, 한글에 특화된 목적 파생 폰트
- 한국 정부 공공 서비스 기본 서체 (Pretendard GOV) — 신뢰 신호
- B2B 컴플라이언스 도구에서는 "인지 부하 최소화"가 "폰트 차별화"보다 중요
- `next/font/local`은 node_modules에서 직접 로드 불가 → `public/fonts/`에 복사 필요

---

## 2. Core Color Palette

### Design Principles

- 네이비 Primary로 브랜드 존재감 부여
- 따뜻한 그레이 배경 (현재 차가운 블루그레이에서 전환)
- `--secondary`, `--muted`, `--accent` 동일 구조 유지 (3개가 같은 값을 공유하는 패턴 유지, 단 hue를 247→80으로 웜톤 전환)
- `--accent-decorative` 신규 변수로 골드 악센트 (기존 `--accent` 미변경)

### Light Mode (:root)

```css
--background:        oklch(0.975 0.005 80);   /* warm off-white */
--foreground:        oklch(0.20 0.04 255);    /* dark navy */
--card:              oklch(1 0 0);            /* pure white */
--card-foreground:   oklch(0.20 0.04 255);
--popover:           oklch(1 0 0);
--popover-foreground: oklch(0.20 0.04 255);
--primary:           oklch(0.30 0.06 255);    /* navy */
--primary-foreground: oklch(0.98 0.005 80);   /* warm white */
--secondary:         oklch(0.96 0.008 80);    /* warm light gray */
--secondary-foreground: oklch(0.20 0.04 255);
--muted:             oklch(0.96 0.008 80);    /* same as secondary */
--muted-foreground:  oklch(0.55 0.02 255);
--accent:            oklch(0.96 0.008 80);    /* same as secondary */
--accent-foreground: oklch(0.20 0.04 255);
--destructive:       oklch(0.57 0.22 25);
--border:            oklch(0.91 0.01 80);     /* warm border */
--input:             oklch(0.91 0.01 80);
--ring:              oklch(0.70 0.03 255);    /* navy focus ring */
--accent-decorative: oklch(0.72 0.12 85);     /* gold (NEW) */
```

### Dark Mode (.dark)

```css
--background:        oklch(0.16 0.03 255);    /* deep navy */
--foreground:        oklch(0.96 0.007 80);    /* warm white */
--card:              oklch(0.22 0.035 255);   /* navy card */
--card-foreground:   oklch(0.96 0.007 80);
--popover:           oklch(0.22 0.035 255);
--popover-foreground: oklch(0.96 0.007 80);
--primary:           oklch(0.85 0.02 255);    /* light navy (inverted) */
--primary-foreground: oklch(0.22 0.035 255);
--secondary:         oklch(0.28 0.035 255);   /* 3 identical */
--secondary-foreground: oklch(0.96 0.007 80);
--muted:             oklch(0.28 0.035 255);
--muted-foreground:  oklch(0.70 0.02 255);
--accent:            oklch(0.28 0.035 255);
--accent-foreground: oklch(0.96 0.007 80);
--destructive:       oklch(0.70 0.19 22);
--border:            oklch(0.91 0.01 80 / 12%);
--input:             oklch(0.91 0.01 80 / 18%);
--ring:              oklch(0.55 0.02 255);
--accent-decorative: oklch(0.68 0.10 85);     /* gold dark variant */
```

### `--accent` vs `--accent-decorative`

| Variable | Purpose | Used by |
|----------|---------|---------|
| `--accent` | 인터랙티브 표면 (dropdown focus, select hover) | shadcn UI 컴포넌트 |
| `--accent-decorative` | 장식적 악센트 (stat-card 보더, 브랜드 강조) | 커스텀 컴포넌트 |

`--accent`를 골드로 바꾸면 드롭다운/셀렉트의 focus 상태가 금색으로 변해 인터랙션 위계가 깨지므로, 별도 변수로 분리한다.

---

## 3. Signal Color System

### Architecture

```
globals.css          →  signal-colors.ts     →  Components
(CSS variables)         (semantic mapping)       (className usage)
--signal-red             OVERDUE → red           status-badge.tsx
--signal-red-bg          TERMINATED → red         worker-table.tsx
...                      의무 → blue              insurance-badge.tsx
                         ...                      deadline-chart.tsx
```

### CSS Variables (12 pairs)

#### Light Mode

```css
--signal-red:        oklch(0.55 0.20 25);
--signal-red-bg:     oklch(0.96 0.03 25);
--signal-orange:     oklch(0.65 0.18 55);
--signal-orange-bg:  oklch(0.96 0.04 55);
--signal-yellow:     oklch(0.65 0.16 85);
--signal-yellow-bg:  oklch(0.96 0.04 85);
--signal-blue:       oklch(0.50 0.15 255);
--signal-blue-bg:    oklch(0.96 0.03 255);
--signal-green:      oklch(0.52 0.15 155);
--signal-green-bg:   oklch(0.96 0.04 155);
--signal-gray:       oklch(0.55 0.01 255);
--signal-gray-bg:    oklch(0.96 0.005 255);
```

#### Dark Mode

```css
--signal-red:        oklch(0.72 0.17 25);
--signal-red-bg:     oklch(0.25 0.06 25);
--signal-orange:     oklch(0.75 0.15 55);
--signal-orange-bg:  oklch(0.25 0.05 55);
--signal-yellow:     oklch(0.78 0.13 85);
--signal-yellow-bg:  oklch(0.25 0.04 85);
--signal-blue:       oklch(0.72 0.12 255);
--signal-blue-bg:    oklch(0.22 0.05 255);
--signal-green:      oklch(0.72 0.13 155);
--signal-green-bg:   oklch(0.22 0.05 155);
--signal-gray:       oklch(0.70 0.01 255);
--signal-gray-bg:    oklch(0.25 0.01 255);
```

### Migration Strategy

기존 `lib/constants/status.ts`를 수정하여 시그널 변수를 사용하도록 한다. 새 파일(`signal-colors.ts`)을 만들지 않고, 기존 파일에서 색상 값만 교체한다.

#### lib/constants/status.ts (수정)

```ts
import type { DeadlineStatus } from "@/types/api";

// 배지용 — bg + text + hover
export const DEADLINE_STATUS_BADGE_STYLES: Record<DeadlineStatus, string> = {
  OVERDUE:     "bg-[var(--signal-red-bg)] text-[var(--signal-red)] hover:bg-[var(--signal-red-bg)]",
  URGENT:      "bg-[var(--signal-orange-bg)] text-[var(--signal-orange)] hover:bg-[var(--signal-orange-bg)]",
  APPROACHING: "bg-[var(--signal-yellow-bg)] text-[var(--signal-yellow)] hover:bg-[var(--signal-yellow-bg)]",
  PENDING:     "bg-[var(--signal-blue-bg)] text-[var(--signal-blue)] hover:bg-[var(--signal-blue-bg)]",
  COMPLETED:   "bg-[var(--signal-green-bg)] text-[var(--signal-green)] hover:bg-[var(--signal-green-bg)]",
} as const;

// 차트용 — CSS 변수 참조 (3개만, OVERDUE/COMPLETED 제외)
type ChartableStatus = Exclude<DeadlineStatus, "OVERDUE" | "COMPLETED">;

export const DEADLINE_STATUS_CHART_COLORS: Record<ChartableStatus, string> = {
  URGENT:      "var(--signal-orange)",
  APPROACHING: "var(--signal-yellow)",
  PENDING:     "var(--signal-green)",
} as const;
```

**Note**: URGENT의 차트 색상이 빨강(#ef4444)에서 주황(--signal-orange)으로 변경됨.
이는 의도적 변경: OVERDUE=빨강이 제외된 차트에서 URGENT를 빨강으로 승격했던 기존 로직을
정규 컬러 체계로 되돌리는 것.

#### components/workers/worker-table.tsx (수정)

```ts
// 레이아웃 클래스는 유지, 색상만 시그널 변수로 교체
const WORKER_STATUS_COLORS: Record<WorkerStatus, string> = {
  ACTIVE:     "bg-[var(--signal-green-bg)] text-[var(--signal-green)] px-2 py-0.5 rounded-full text-xs font-medium",
  INACTIVE:   "bg-[var(--signal-gray-bg)] text-[var(--signal-gray)] px-2 py-0.5 rounded-full text-xs font-medium",
  TERMINATED: "bg-[var(--signal-red-bg)] text-[var(--signal-red)] px-2 py-0.5 rounded-full text-xs font-medium",
} as const;
```

`WORKER_STATUS_COLORS`는 외부 파일로 추출하지 않는다. 현재 worker-table.tsx에서만 사용되고,
레이아웃 클래스(`px-2 py-0.5 rounded-full text-xs font-medium`)가 포함되어 있어
색상 전용 상수와 분리하는 것이 더 명확하다.

#### components/workers/insurance-badge.tsx (수정)

```ts
const STATUS_STYLES: Record<string, string> = {
  의무: "bg-[var(--signal-blue-bg)] text-[var(--signal-blue)] hover:bg-[var(--signal-blue-bg)]",
  임의: "bg-[var(--signal-gray-bg)] text-[var(--signal-gray)] hover:bg-[var(--signal-gray-bg)]",
  면제: "bg-[var(--signal-green-bg)] text-[var(--signal-green)] hover:bg-[var(--signal-green-bg)]",
} as const;
```

`STATUS_STYLES`도 insurance-badge.tsx 로컬에 유지한다. 사용처가 이 파일 하나뿐이며,
hover 스타일이 포함되어 있어 순수 색상 상수와 혼합하지 않는다.

### @theme Registration

등록하지 않음. arbitrary value 문법 (`bg-[var(--signal-red)]`)으로 사용.
시그널 컬러는 상수 파일을 통해서만 참조되므로 Tailwind 네이티브 클래스 불필요.

### Rationale: 22 variables → 12 variables

3개 상태 시스템에서 색상이 겹침 (red: OVERDUE+TERMINATED, green: COMPLETED+ACTIVE+면제, blue: PENDING+의무, gray: INACTIVE+임의).
색상 팔레트 기반 그룹화로 변수 수를 절반으로 줄이고, 시각적 일관성 확보.

---

## 4. Stat Card Color Lines

### Changes to stat-card.tsx

`className` prop 추가, `border-t-[3px]` 기본 적용:

```tsx
interface StatCardProps {
  readonly title: string;
  readonly value: number | undefined;
  readonly icon: LucideIcon;
  readonly isLoading: boolean;
  readonly isError?: boolean;
  readonly className?: string;  // NEW
}

export function StatCard({ ..., className }: StatCardProps) {
  return (
    <Card className={cn("border-t-[3px]", className)}>
      {/* internal unchanged */}
    </Card>
  );
}
```

### Usage in page.tsx

Tailwind v4에서 `border-t-[value]`는 width/color가 모호하므로 `border-t-[color:value]` 타입 힌트 필요:

```tsx
<StatCard className="border-t-[color:var(--accent-decorative)]" ... />  /* gold — total workers */
<StatCard className="border-t-[color:var(--signal-red)]" ... />          /* red — overdue */
<StatCard className="border-t-[color:var(--signal-orange)]" ... />       /* orange — approaching */
```

---

## 5. Chart Colors

### chart-1~5 Variables

기존 무채색 → 시그널 변수에 연결:

```css
--chart-1: var(--signal-blue);
--chart-2: var(--signal-green);
--chart-3: var(--signal-orange);
--chart-4: var(--signal-red);
--chart-5: var(--accent-decorative);
```

### deadline-chart.tsx STATUS_CONFIG

```tsx
// Before: hardcoded hex
{ color: "#ef4444", label: "긴급" }

// After: CSS variable reference
{ color: "var(--signal-orange)", label: "긴급" }
```

Recharts SVG `fill` attr과 inline `style={{ backgroundColor }}`는 브라우저에서 CSS `var()` 문자열을 해석한다.
단, Recharts 내장 Legend/Tooltip 컴포넌트는 CSS 변수를 해석하지 못할 수 있으므로,
이 프로젝트의 커스텀 `ChartLegend`와 `ChartTooltip`을 계속 사용해야 한다 (Recharts 내장 컴포넌트로 교체 금지).

---

## File Change Summary

| # | File | Change | New/Modified |
|---|------|--------|-------------|
| 1 | `package.json` | `pretendard` dep + postinstall script | Modified |
| 2 | `public/fonts/PretendardVariable.woff2` | Font file (via postinstall) | New |
| 3 | `app/layout.tsx` | Geist → Pretendard (next/font/local) | Modified |
| 4 | `app/globals.css` | Core recolor + signal vars + accent-decorative + font bug fix + chart vars | Modified |
| 5 | `lib/constants/status.ts` | DEADLINE_STATUS_BADGE_STYLES + CHART_COLORS → signal vars | Modified |
| 6 | `components/dashboard/stat-card.tsx` | className prop + border-t | Modified |
| 7 | `components/dashboard/deadline-chart.tsx` | STATUS_CONFIG hex → CSS vars from status.ts | Modified |
| 8 | `components/compliance/status-badge.tsx` | No change (already imports from status.ts) | Unchanged |
| 9 | `components/workers/worker-table.tsx` | WORKER_STATUS_COLORS hardcoded colors → signal vars (inline) | Modified |
| 10 | `components/workers/insurance-badge.tsx` | STATUS_STYLES hardcoded colors → signal vars (inline) | Modified |
| 11 | `app/(app)/page.tsx` | StatCard border color classNames with `color:` type hint | Modified |

### Not Changed

- Layout structure (header/sidebar/main)
- Component logic / data flow
- `--sidebar-*` orphaned variables
- Dark mode toggle mechanism (next-themes)
- Geist Mono (kept for code/numbers)
