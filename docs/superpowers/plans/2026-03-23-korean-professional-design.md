# Korean Professional Design System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebrand the FWC design system from shadcn defaults to a "Korean Professional" aesthetic — Pretendard font, navy/gold palette, OKLCH signal colors with full dark mode support.

**Architecture:** CSS-first approach. Core color tokens in `globals.css`, signal color mapping in existing `lib/constants/status.ts`. No new files except the font woff2. Components consume CSS variables via Tailwind arbitrary values.

**Tech Stack:** Next.js 16.2.0, Tailwind CSS v4 (OKLCH), `next/font/local`, Pretendard Variable, Recharts

**Spec:** `docs/superpowers/specs/2026-03-23-korean-professional-design.md`

---

## File Map

| File | Responsibility | Action |
|------|---------------|--------|
| `package.json` | Pretendard dep + postinstall script | Modify |
| `public/fonts/PretendardVariable.woff2` | Variable font file | Create (via postinstall) |
| `app/layout.tsx` | Font loading (Geist → Pretendard) | Modify |
| `app/globals.css` | All design tokens: core palette, signal vars, chart vars, font fix | Modify |
| `lib/constants/status.ts` | Deadline badge styles + chart colors → signal vars | Modify |
| `components/dashboard/stat-card.tsx` | Add className prop + border-t | Modify |
| `components/dashboard/deadline-chart.tsx` | No code changes — already imports from status.ts, picks up CSS var changes automatically | Verify only |
| `components/workers/worker-table.tsx` | WORKER_STATUS_COLORS → signal vars | Modify |
| `components/workers/insurance-badge.tsx` | STATUS_STYLES → signal vars | Modify |
| `app/(app)/page.tsx` | StatCard border color classNames | Modify |

---

### Task 1: Install Pretendard and Set Up Font Loading

**Files:**
- Modify: `package.json`
- Create: `public/fonts/` directory
- Modify: `app/layout.tsx:1-33`
- Modify: `app/globals.css:10`

- [ ] **Step 1: Install pretendard package**

Run: `npm install pretendard`

- [ ] **Step 2: Add postinstall script to package.json**

In `package.json`, add to `"scripts"`:

```json
"postinstall": "cp node_modules/pretendard/dist/web/variable/woff2/PretendardVariable.woff2 public/fonts/"
```

- [ ] **Step 3: Create public/fonts directory and run postinstall**

Run: `mkdir -p public/fonts && npm run postinstall`
Expected: `public/fonts/PretendardVariable.woff2` exists

- [ ] **Step 4: Verify font file exists**

Run: `ls -la public/fonts/PretendardVariable.woff2`
Expected: File exists with non-zero size (~5-10MB)

- [ ] **Step 5: Update app/layout.tsx — replace Geist with Pretendard**

Replace the entire file content of `app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import localFont from "next/font/local";
import { Geist_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const pretendard = localFont({
  src: "../public/fonts/PretendardVariable.woff2",
  variable: "--font-pretendard",
  weight: "45 920",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FWC - 외국인 근로자 컴플라이언스",
  description: "외국인 근로자 고용 컴플라이언스 관리 시스템",
};

export default function RootLayout({ children }: { readonly children: React.ReactNode }) {
  return (
    <html
      lang="ko"
      suppressHydrationWarning
      className={`${pretendard.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

- [ ] **Step 6: Fix circular font reference in globals.css**

In `app/globals.css` line 10, change:

```css
/* Before */
--font-sans: var(--font-sans);

/* After */
--font-sans: var(--font-pretendard);
```

- [ ] **Step 7: Verify dev server starts without errors**

Run: `npm run dev` (start, check for font loading errors in terminal, then stop)
Expected: No errors about missing fonts or circular references

- [ ] **Step 8: Commit**

```bash
git add package.json public/fonts/ app/layout.tsx app/globals.css
git commit -m "feat: replace Geist with Pretendard Variable font

- Install pretendard package with postinstall copy script
- Load via next/font/local from public/fonts/
- Fix circular --font-sans reference in @theme inline block
- Remove Geist Sans import (keep Geist Mono)"
```

---

### Task 2: Core Color Palette Recoloring

**Files:**
- Modify: `app/globals.css:51-118` (`:root` and `.dark` blocks)

- [ ] **Step 1: Replace `:root` block with new light mode palette**

In `app/globals.css`, replace the entire `:root { ... }` block (lines 51-84) with:

```css
:root {
  --background: oklch(0.975 0.005 80);
  --foreground: oklch(0.20 0.04 255);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.20 0.04 255);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.20 0.04 255);
  --primary: oklch(0.30 0.06 255);
  --primary-foreground: oklch(0.98 0.005 80);
  --secondary: oklch(0.96 0.008 80);
  --secondary-foreground: oklch(0.20 0.04 255);
  --muted: oklch(0.96 0.008 80);
  --muted-foreground: oklch(0.55 0.02 255);
  --accent: oklch(0.96 0.008 80);
  --accent-foreground: oklch(0.20 0.04 255);
  --destructive: oklch(0.57 0.22 25);
  --border: oklch(0.91 0.01 80);
  --input: oklch(0.91 0.01 80);
  --ring: oklch(0.70 0.03 255);
  --accent-decorative: oklch(0.72 0.12 85);
  --chart-1: oklch(0.87 0 0);
  --chart-2: oklch(0.556 0 0);
  --chart-3: oklch(0.439 0 0);
  --chart-4: oklch(0.371 0 0);
  --chart-5: oklch(0.269 0 0);
  --radius: 0.625rem;
  --sidebar: oklch(0.96 0.008 80);
  --sidebar-foreground: oklch(0.20 0.04 255);
  --sidebar-primary: oklch(0.30 0.06 255);
  --sidebar-primary-foreground: oklch(0.98 0.005 80);
  --sidebar-accent: oklch(0.91 0.01 80);
  --sidebar-accent-foreground: oklch(0.20 0.04 255);
  --sidebar-border: oklch(0.91 0.01 80);
  --sidebar-ring: oklch(0.70 0.03 255);
}
```

- [ ] **Step 2: Replace `.dark` block with new dark mode palette**

Replace the entire `.dark { ... }` block (lines 86-118) with:

```css
.dark {
  --background: oklch(0.16 0.03 255);
  --foreground: oklch(0.96 0.007 80);
  --card: oklch(0.22 0.035 255);
  --card-foreground: oklch(0.96 0.007 80);
  --popover: oklch(0.22 0.035 255);
  --popover-foreground: oklch(0.96 0.007 80);
  --primary: oklch(0.85 0.02 255);
  --primary-foreground: oklch(0.22 0.035 255);
  --secondary: oklch(0.28 0.035 255);
  --secondary-foreground: oklch(0.96 0.007 80);
  --muted: oklch(0.28 0.035 255);
  --muted-foreground: oklch(0.70 0.02 255);
  --accent: oklch(0.28 0.035 255);
  --accent-foreground: oklch(0.96 0.007 80);
  --destructive: oklch(0.70 0.19 22);
  --border: oklch(0.91 0.01 80 / 12%);
  --input: oklch(0.91 0.01 80 / 18%);
  --ring: oklch(0.55 0.02 255);
  --accent-decorative: oklch(0.68 0.10 85);
  --chart-1: oklch(0.87 0 0);
  --chart-2: oklch(0.556 0 0);
  --chart-3: oklch(0.439 0 0);
  --chart-4: oklch(0.371 0 0);
  --chart-5: oklch(0.269 0 0);
  --sidebar: oklch(0.18 0.03 255);
  --sidebar-foreground: oklch(0.96 0.007 80);
  --sidebar-primary: oklch(0.85 0.02 255);
  --sidebar-primary-foreground: oklch(0.96 0.007 80);
  --sidebar-accent: oklch(0.28 0.035 255);
  --sidebar-accent-foreground: oklch(0.96 0.007 80);
  --sidebar-border: oklch(0.91 0.01 80 / 12%);
  --sidebar-ring: oklch(0.55 0.02 255);
}
```

- [ ] **Step 3: Verify build passes**

Run: `npm run build`
Expected: Build succeeds. CSS variables are valid OKLCH values.

- [ ] **Step 4: Commit**

```bash
git add app/globals.css
git commit -m "feat: recolor core palette to navy/warm-gray Korean Professional theme

- Light mode: warm off-white background, navy primary, gold accent-decorative
- Dark mode: deep navy background, inverted navy primary
- secondary/muted/accent maintain identical-value structure (hue 247→80)
- Add --accent-decorative for gold branding (separate from interactive --accent)"
```

---

### Task 3: Add Signal Color Variables

**Files:**
- Modify: `app/globals.css` (add signal vars inside `:root` and `.dark`)

- [ ] **Step 1: Add signal color variables to `:root` block**

In `app/globals.css`, inside the `:root { ... }` block, add before `--radius`:

```css
  --signal-red: oklch(0.55 0.20 25);
  --signal-red-bg: oklch(0.96 0.03 25);
  --signal-orange: oklch(0.65 0.18 55);
  --signal-orange-bg: oklch(0.96 0.04 55);
  --signal-yellow: oklch(0.65 0.16 85);
  --signal-yellow-bg: oklch(0.96 0.04 85);
  --signal-blue: oklch(0.50 0.15 255);
  --signal-blue-bg: oklch(0.96 0.03 255);
  --signal-green: oklch(0.52 0.15 155);
  --signal-green-bg: oklch(0.96 0.04 155);
  --signal-gray: oklch(0.55 0.01 255);
  --signal-gray-bg: oklch(0.96 0.005 255);
```

- [ ] **Step 2: Add signal color variables to `.dark` block**

In `app/globals.css`, inside the `.dark { ... }` block, add before `--sidebar`:

```css
  --signal-red: oklch(0.72 0.17 25);
  --signal-red-bg: oklch(0.25 0.06 25);
  --signal-orange: oklch(0.75 0.15 55);
  --signal-orange-bg: oklch(0.25 0.05 55);
  --signal-yellow: oklch(0.78 0.13 85);
  --signal-yellow-bg: oklch(0.25 0.04 85);
  --signal-blue: oklch(0.72 0.12 255);
  --signal-blue-bg: oklch(0.22 0.05 255);
  --signal-green: oklch(0.72 0.13 155);
  --signal-green-bg: oklch(0.22 0.05 155);
  --signal-gray: oklch(0.70 0.01 255);
  --signal-gray-bg: oklch(0.25 0.01 255);
```

- [ ] **Step 3: Update chart variables to reference signal colors**

In both `:root` and `.dark`, replace the existing chart variables:

```css
  --chart-1: var(--signal-blue);
  --chart-2: var(--signal-green);
  --chart-3: var(--signal-orange);
  --chart-4: var(--signal-red);
  --chart-5: var(--accent-decorative);
```

- [ ] **Step 4: Verify build passes**

Run: `npm run build`
Expected: Build succeeds. No CSS parsing errors.

- [ ] **Step 5: Commit**

```bash
git add app/globals.css
git commit -m "feat: add signal color system with dark mode support

- 12 signal color pairs (red/orange/yellow/blue/green/gray × fg/bg)
- Light and dark mode variants using OKLCH
- Link chart-1~5 variables to signal colors for palette consistency"
```

---

### Task 4: Migrate Status Constants to Signal Variables

**Files:**
- Modify: `lib/constants/status.ts:1-17`

- [ ] **Step 1: Replace lib/constants/status.ts content**

Replace the entire file:

```ts
import type { DeadlineStatus } from "@/types/api";

export const DEADLINE_STATUS_BADGE_STYLES: Record<DeadlineStatus, string> = {
  OVERDUE: "bg-[var(--signal-red-bg)] text-[var(--signal-red)] hover:bg-[var(--signal-red-bg)]",
  URGENT: "bg-[var(--signal-orange-bg)] text-[var(--signal-orange)] hover:bg-[var(--signal-orange-bg)]",
  APPROACHING: "bg-[var(--signal-yellow-bg)] text-[var(--signal-yellow)] hover:bg-[var(--signal-yellow-bg)]",
  PENDING: "bg-[var(--signal-blue-bg)] text-[var(--signal-blue)] hover:bg-[var(--signal-blue-bg)]",
  COMPLETED: "bg-[var(--signal-green-bg)] text-[var(--signal-green)] hover:bg-[var(--signal-green-bg)]",
} as const;

type ChartableStatus = Exclude<DeadlineStatus, "OVERDUE" | "COMPLETED">;

export const DEADLINE_STATUS_CHART_COLORS: Record<ChartableStatus, string> = {
  URGENT: "var(--signal-orange)",
  APPROACHING: "var(--signal-yellow)",
  PENDING: "var(--signal-green)",
} as const;
```

- [ ] **Step 2: Run existing tests to verify no regressions**

Run: `npm run test -- __tests__/components/status-badge.test.tsx`
Expected: All 5 tests pass. StatusBadge still renders correct text. (CSS class changes don't affect text rendering tests.)

- [ ] **Step 3: Commit**

```bash
git add lib/constants/status.ts
git commit -m "refactor: migrate deadline status colors to signal CSS variables

- DEADLINE_STATUS_BADGE_STYLES: Tailwind hardcoded → signal vars
- DEADLINE_STATUS_CHART_COLORS: hex (#ef4444) → CSS var references
- URGENT chart color changes from red to orange (corrects to spec palette)"
```

---

### Task 5: Verify Deadline Chart Picks Up CSS Variable Colors

**Files:**
- No code changes needed in `components/dashboard/deadline-chart.tsx`

The chart already imports `DEADLINE_STATUS_CHART_COLORS` from `lib/constants/status.ts` (line 17).
After Task 4, those values changed from hex strings (`"#ef4444"`) to CSS variable references (`"var(--signal-orange)"`).
The chart consumes them via:
1. `fill={DEADLINE_STATUS_CHART_COLORS[status]}` (line 225) — SVG fill accepts CSS vars
2. `style={{ backgroundColor: r.color }}` (tooltip, line 123) — inline style accepts CSS vars
3. `style={{ backgroundColor: DEADLINE_STATUS_CHART_COLORS[status] }}` (legend, line 155)

No local `STATUS_CONFIG` exists — it was already refactored out in a prior PR.

- [ ] **Step 1: Run existing chart tests to verify no regressions**

Run: `npm run test -- __tests__/components/deadline-chart.test.tsx`
Expected: All tests pass. Chart grouping logic is unaffected by color value changes.

- [ ] **Step 2: No commit needed (no code changes)**

---

### Task 6: Update Worker Table and Insurance Badge Colors

**Files:**
- Modify: `components/workers/worker-table.tsx:15-19` (the `WORKER_STATUS_COLORS` constant)
- Modify: `components/workers/insurance-badge.tsx:3-7` (the `STATUS_STYLES` constant)

- [ ] **Step 1: Update WORKER_STATUS_COLORS in worker-table.tsx**

In `components/workers/worker-table.tsx`, find the `WORKER_STATUS_COLORS` constant and replace it:

```ts
const WORKER_STATUS_COLORS: Record<WorkerStatus, string> = {
  ACTIVE: "bg-[var(--signal-green-bg)] text-[var(--signal-green)] px-2 py-0.5 rounded-full text-xs font-medium",
  INACTIVE: "bg-[var(--signal-gray-bg)] text-[var(--signal-gray)] px-2 py-0.5 rounded-full text-xs font-medium",
  TERMINATED: "bg-[var(--signal-red-bg)] text-[var(--signal-red)] px-2 py-0.5 rounded-full text-xs font-medium",
};
```

- [ ] **Step 2: Update STATUS_STYLES in insurance-badge.tsx**

In `components/workers/insurance-badge.tsx`, replace lines 3-7:

```ts
const STATUS_STYLES: Record<string, string> = {
  의무: "bg-[var(--signal-blue-bg)] text-[var(--signal-blue)] hover:bg-[var(--signal-blue-bg)]",
  임의: "bg-[var(--signal-gray-bg)] text-[var(--signal-gray)] hover:bg-[var(--signal-gray-bg)]",
  면제: "bg-[var(--signal-green-bg)] text-[var(--signal-green)] hover:bg-[var(--signal-green-bg)]",
};
```

- [ ] **Step 3: Run existing tests**

Run: `npm run test -- __tests__/components/worker-table.test.tsx __tests__/components/insurance-badge.test.tsx`
Expected: All tests pass. Text rendering unaffected by CSS class changes.

- [ ] **Step 4: Commit**

```bash
git add components/workers/worker-table.tsx components/workers/insurance-badge.tsx
git commit -m "refactor: migrate worker and insurance badge colors to signal CSS variables

- WORKER_STATUS_COLORS: preserve layout classes, swap color classes
- STATUS_STYLES: swap color classes, preserve hover behavior"
```

---

### Task 7: Add Stat Card Color Lines

**Files:**
- Modify: `components/dashboard/stat-card.tsx:1-31`
- Modify: `app/(app)/page.tsx:24-44`

- [ ] **Step 1: Add className prop to StatCard**

Replace `components/dashboard/stat-card.tsx` content:

```tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  readonly title: string;
  readonly value: number | undefined;
  readonly icon: LucideIcon;
  readonly isLoading: boolean;
  readonly isError?: boolean;
  readonly className?: string;
}

export function StatCard({ title, value, icon: Icon, isLoading, isError, className }: StatCardProps) {
  return (
    <Card className={cn("border-t-[3px]", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-16" />
        ) : isError ? (
          <p className="text-2xl font-bold text-destructive">—</p>
        ) : (
          <p className="text-2xl font-bold">{value ?? 0}</p>
        )}
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 2: Add border colors to StatCard usage in page.tsx**

In `app/(app)/page.tsx`, update each `<StatCard>` to include `className`:

```tsx
<StatCard
  title="전체 근로자"
  value={workers.data?.length}
  icon={Users}
  isLoading={workers.isLoading}
  isError={workers.isError}
  className="border-t-[color:var(--accent-decorative)]"
/>
<StatCard
  title="기한초과"
  value={overdue.data?.length}
  icon={AlertTriangle}
  isLoading={overdue.isLoading}
  isError={overdue.isError}
  className="border-t-[color:var(--signal-red)]"
/>
<StatCard
  title="임박 (30일)"
  value={approachingCount}
  icon={Clock}
  isLoading={upcoming.isLoading}
  isError={upcoming.isError}
  className="border-t-[color:var(--signal-orange)]"
/>
```

- [ ] **Step 3: Verify build passes**

Run: `npm run build`
Expected: Build succeeds. No TypeScript errors.

- [ ] **Step 4: Commit**

```bash
git add components/dashboard/stat-card.tsx app/\(app\)/page.tsx
git commit -m "feat: add colored top borders to stat cards

- StatCard gains className prop for external styling
- Dashboard page applies gold/red/orange border colors via signal vars
- Uses border-t-[color:...] type hint for Tailwind v4 compatibility"
```

---

### Task 8: Run Full Test Suite and Visual Verification

- [ ] **Step 1: Run full test suite**

Run: `npm run test`
Expected: All tests pass. No regressions from CSS variable changes.

- [ ] **Step 2: Run lint**

Run: `npm run lint`
Expected: No lint errors.

- [ ] **Step 3: Run build**

Run: `npm run build`
Expected: Clean build with no warnings.

- [ ] **Step 4: Visual verification checklist**

Start dev server (`npm run dev`) and manually verify:

1. [ ] Font: Korean text renders in Pretendard (check devtools → Computed → font-family)
2. [ ] Light mode: Warm off-white background, navy text, gold stat-card borders visible
3. [ ] Dark mode: Deep navy background, cards differentiated, signal colors readable
4. [ ] Status badges: All 5 deadline statuses render with correct signal colors
5. [ ] Worker table: ACTIVE/INACTIVE/TERMINATED badges have correct signal colors and pill shape
6. [ ] Insurance badges: 의무/임의/면제 badges render correctly
7. [ ] Deadline chart: Bars show orange(URGENT)/yellow(APPROACHING)/green(PENDING)
8. [ ] Chart tooltip: Color dots match bar colors
9. [ ] Chart legend: Color dots match bar colors
10. [ ] Theme toggle: Smooth transition between light and dark modes

- [ ] **Step 5: Commit any fixes discovered during verification**

If visual issues found, fix and commit with descriptive message.
