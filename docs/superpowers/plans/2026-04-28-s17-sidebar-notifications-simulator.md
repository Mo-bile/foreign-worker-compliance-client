# S17-FE: 사이드바 IA 보강 + 알림 설정 + 시뮬레이터 라벨 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** 사이드바를 6개 카테고리로 확장하고, 알림 설정/내 사업장 정보 페이지를 신설하며, 시뮬레이터에 E-9 안내 박스를 추가한다.

**Architecture:** 기존 BFF 패턴(Next.js Route Handler → apiClient → Spring Boot)을 따르며, 알림 logs는 MSW 목업 우선 개발. 알림 시점 설정은 localStorage에 저장하고 P2에서 서버 API로 교체. 기존 컴포넌트(`CompanyDetailCard`, `useCompany`, `useUpdateCompany`)를 최대한 재사용.

**Tech Stack:** Next.js 16, React 19, TanStack Query v5, Zod v4, Tailwind CSS v4, shadcn/ui v4, react-hook-form v7, MSW v2, sonner (toast)

**중요 패턴 참조:**
- 컨텍스트 훅: `useCompanyContext()` (`lib/contexts/company-context.tsx`) — `selectedCompanyId`, `selectedCompany` 반환
- API 유틸: `fetchApi<T>(endpoint, errorMsg)`, `mutateApi<T>(endpoint, method, data, errorMsg)` (`lib/queries/query-utils.ts`)
- BFF 유틸: `apiClient.get<T>()`, `apiClient.post<T>()`, `apiClient.put<T>()` (`lib/api-client.ts`)
- 라우트 유틸: `handleRouteError()`, `parseRequestBody()`, `validateSchema()` (`lib/api-route-utils.ts`)
- MSW 이중 등록: `BACKEND` 경로 + `*` 와일드카드 경로
- 토스트: `toast.success(msg)`, `toast.error(msg)` from `sonner`
- 모달: `AlertDialog` 패턴 (`components/ui/alert-dialog.tsx`)

---

## File Structure

### 수정 파일 (4개)

| 파일 | 변경 내용 |
|------|----------|
| `components/layout/sidebar.tsx` | 6개 카테고리 재구성 + E-9 라벨 |
| `app/(app)/simulator/page.tsx` | E-9 안내 박스 추가 |
| `components/dashboard/deadline-timeline.tsx` | 알림 설정 딥링크 |
| `mocks/handlers.ts` | 알림 MSW 핸들러 추가 |

### 신규 파일 (11개)

| 파일 | 역할 |
|------|------|
| `types/notification.ts` | Zod 스키마 + 타입 |
| `mocks/notification-data.ts` | MSW 목업 데이터 |
| `app/api/notifications/trigger/route.ts` | BFF — trigger proxy |
| `app/api/notifications/logs/route.ts` | BFF — logs proxy |
| `lib/queries/use-notifications.ts` | React Query 훅 |
| `components/notifications/notification-log-table.tsx` | 발송 기록 테이블 |
| `components/notifications/notification-timing-toggles.tsx` | 알림 시점 토글 |
| `components/settings/company-edit-modal.tsx` | contactEmail 편집 모달 |
| `app/(app)/settings/company/page.tsx` | 내 사업장 정보 페이지 |
| `app/(app)/settings/notifications/page.tsx` | 알림 설정 페이지 |
| `__tests__/pages/s17-sidebar-notifications.test.tsx` | 통합 테스트 |

---

## Task 1: Notification 타입 + Zod 스키마

**Files:**
- Create: `types/notification.ts`

- [x] **Step 1: Create Zod schemas and types**

```typescript
// types/notification.ts
import { z } from "zod";

export const TEMPLATE_TYPES = ["D30", "D7", "OVERDUE"] as const;
export type TemplateType = (typeof TEMPLATE_TYPES)[number];

export const TEMPLATE_TYPE_LABELS: Record<TemplateType, string> = {
  D30: "D-30",
  D7: "D-7",
  OVERDUE: "기한 초과",
};

export const notificationLogSchema = z.object({
  id: z.number(),
  sentAt: z.string(),
  templateType: z.enum(TEMPLATE_TYPES),
  deadlineCount: z.number(),
  recipientEmail: z.string(),
});

export type NotificationLog = z.infer<typeof notificationLogSchema>;

export const notificationLogsResponseSchema = z.array(notificationLogSchema);

export const triggerResponseSchema = z.object({
  triggered: z.number(),
  skipped: z.number(),
  failedRecipients: z.array(z.string()),
});

export type TriggerResponse = z.infer<typeof triggerResponseSchema>;
```

- [x] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors related to `types/notification.ts`

- [x] **Step 3: Commit**

```bash
git add types/notification.ts
git commit -m "feat(S17): notification 타입 + Zod 스키마"
```

---

## Task 2: MSW 목업 데이터 + 핸들러

**Files:**
- Create: `mocks/notification-data.ts`
- Modify: `mocks/handlers.ts`

- [x] **Step 1: Create mock notification data**

```typescript
// mocks/notification-data.ts
import type { NotificationLog, TriggerResponse } from "@/types/notification";

export const mockNotificationLogs: readonly NotificationLog[] = [
  {
    id: 1,
    sentAt: "2026-04-25T14:30:00",
    templateType: "D7",
    deadlineCount: 3,
    recipientEmail: "owner1@demo.test",
  },
  {
    id: 2,
    sentAt: "2026-04-20T09:00:00",
    templateType: "D30",
    deadlineCount: 5,
    recipientEmail: "owner1@demo.test",
  },
  {
    id: 3,
    sentAt: "2026-04-15T11:15:00",
    templateType: "OVERDUE",
    deadlineCount: 2,
    recipientEmail: "owner1@demo.test",
  },
];

export const mockTriggerResponse: TriggerResponse = {
  triggered: 3,
  skipped: 0,
  failedRecipients: [],
};
```

- [x] **Step 2: Add notification handlers to `mocks/handlers.ts`**

At the top of `mocks/handlers.ts`, add the import:

```typescript
import { mockNotificationLogs, mockTriggerResponse } from "./notification-data";
```

Before the `export const handlers = [` line, add the handler callbacks:

```typescript
// ─── Notifications ──────────────────────────────────────

const getNotificationLogs: Parameters<typeof http.get>[1] = ({ request }) => {
  const url = new URL(request.url);
  const limit = Number(url.searchParams.get("limit") ?? "10");
  return HttpResponse.json(mockNotificationLogs.slice(0, limit));
};

const postNotificationTrigger: Parameters<typeof http.post>[1] = () => {
  return HttpResponse.json(mockTriggerResponse);
};
```

Inside the `handlers` array, add (before the closing `]`):

```typescript
  // Notifications
  http.get(`${BACKEND}/api/notifications/logs`, getNotificationLogs),
  http.post(`${BACKEND}/api/notifications/trigger`, postNotificationTrigger),
  http.get("*/api/notifications/logs", getNotificationLogs),
  http.post("*/api/notifications/trigger", postNotificationTrigger),
```

- [x] **Step 3: Verify MSW compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors

- [x] **Step 4: Commit**

```bash
git add mocks/notification-data.ts mocks/handlers.ts
git commit -m "feat(S17): notification MSW 목업 데이터 + 핸들러"
```

---

## Task 3: BFF 라우트 — Notification Trigger + Logs

**Files:**
- Create: `app/api/notifications/trigger/route.ts`
- Create: `app/api/notifications/logs/route.ts`

- [x] **Step 1: Create trigger BFF route**

```typescript
// app/api/notifications/trigger/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { apiClient } from "@/lib/api-client";
import { parseId } from "@/lib/parse-id";
import { handleRouteError } from "@/lib/api-route-utils";
import type { TriggerResponse } from "@/types/notification";

export async function POST(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get("companyId");
  if (raw === null) {
    return NextResponse.json({ message: "companyId가 필요합니다" }, { status: 400 });
  }

  const companyId = parseId(raw);
  if (companyId === null) {
    return NextResponse.json({ message: "잘못된 사업장 ID입니다" }, { status: 400 });
  }

  try {
    const result = await apiClient.post<TriggerResponse>(
      `/api/notifications/trigger?companyId=${companyId}`,
      {},
    );
    return NextResponse.json(result);
  } catch (error) {
    return handleRouteError(error, "POST /api/notifications/trigger");
  }
}
```

- [x] **Step 2: Create logs BFF route**

```typescript
// app/api/notifications/logs/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { apiClient } from "@/lib/api-client";
import { parseId } from "@/lib/parse-id";
import { handleRouteError } from "@/lib/api-route-utils";
import type { NotificationLog } from "@/types/notification";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const raw = searchParams.get("companyId");
  if (raw === null) {
    return NextResponse.json({ message: "companyId가 필요합니다" }, { status: 400 });
  }

  const companyId = parseId(raw);
  if (companyId === null) {
    return NextResponse.json({ message: "잘못된 사업장 ID입니다" }, { status: 400 });
  }

  const limit = searchParams.get("limit") ?? "10";

  try {
    const logs = await apiClient.get<readonly NotificationLog[]>(
      `/api/notifications/logs?companyId=${companyId}&limit=${limit}`,
    );
    return NextResponse.json(logs);
  } catch (error) {
    return handleRouteError(error, "GET /api/notifications/logs");
  }
}
```

- [x] **Step 3: Verify TypeScript compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors

- [x] **Step 4: Commit**

```bash
git add app/api/notifications/trigger/route.ts app/api/notifications/logs/route.ts
git commit -m "feat(S17): notification BFF 라우트 (trigger + logs)"
```

---

## Task 4: React Query 훅 — Notifications

**Files:**
- Create: `lib/queries/use-notifications.ts`

- [x] **Step 1: Create notification query hooks**

```typescript
// lib/queries/use-notifications.ts
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { NotificationLog, TriggerResponse } from "@/types/notification";
import { fetchApi, mutateApi } from "./query-utils";

export function useNotificationLogs(companyId: number | null) {
  return useQuery<readonly NotificationLog[]>({
    queryKey: ["notification-logs", companyId],
    queryFn: () =>
      fetchApi<readonly NotificationLog[]>(
        `/api/notifications/logs?companyId=${companyId}&limit=10`,
        "발송 기록을 불러올 수 없습니다",
      ),
    enabled: companyId != null && companyId > 0,
  });
}

export function useTriggerNotification() {
  const queryClient = useQueryClient();

  return useMutation<TriggerResponse, Error, { companyId: number }>({
    mutationFn: ({ companyId }) =>
      mutateApi<TriggerResponse>(
        `/api/notifications/trigger?companyId=${companyId}`,
        "POST",
        {},
        "알림 발송에 실패했습니다",
      ),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["notification-logs", variables.companyId],
      });
    },
  });
}
```

- [x] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit --pretty 2>&1 | head -20`
Expected: No errors

- [x] **Step 3: Commit**

```bash
git add lib/queries/use-notifications.ts
git commit -m "feat(S17): notification React Query 훅"
```

---

## Task 5: 사이드바 카테고리 재구성

**Files:**
- Modify: `components/layout/sidebar.tsx`
- Test: `__tests__/pages/s17-sidebar-notifications.test.tsx` (시작)

- [x] **Step 1: Write sidebar test**

```typescript
// __tests__/pages/s17-sidebar-notifications.test.tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { Sidebar } from "@/components/layout/sidebar";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

describe("Sidebar — S17 카테고리 재구성", () => {
  beforeEach(() => {
    render(<Sidebar />);
  });

  it("6개 카테고리가 모두 표시된다", () => {
    expect(screen.getByText("메인")).toBeInTheDocument();
    expect(screen.getByText("고용 전")).toBeInTheDocument();
    expect(screen.getByText("고용 후")).toBeInTheDocument();
    expect(screen.getByText("지속 관리")).toBeInTheDocument();
    expect(screen.getByText("설정")).toBeInTheDocument();
    expect(screen.getByText("관리자")).toBeInTheDocument();
  });

  it("시뮬레이터 라벨이 E-9 접두사를 포함한다", () => {
    expect(screen.getByText("E-9 고용허가 시뮬레이터")).toBeInTheDocument();
  });

  it("설정 카테고리에 내 사업장 정보, 알림 설정이 있다", () => {
    expect(screen.getByText("내 사업장 정보")).toBeInTheDocument();
    expect(screen.getByText("알림 설정")).toBeInTheDocument();
  });

  it("관리자 카테고리에 사업장 관리가 있다", () => {
    expect(screen.getByText("사업장 관리")).toBeInTheDocument();
  });

  it("고용 후 카테고리에 사업장 관리가 없다", () => {
    // 사업장 관리는 관리자 카테고리로 이동됨
    const items = screen.getAllByRole("link");
    const benchmarkLink = items.find((el) => el.textContent?.includes("사업장 건강검진"));
    const workerLink = items.find((el) => el.textContent?.includes("근로자 관리"));
    const companyLink = items.find((el) => el.textContent?.includes("사업장 관리"));

    // 사업장 건강검진과 근로자 관리는 고용 후에 있지만
    // 사업장 관리의 href는 /companies (관리자 카테고리)
    expect(benchmarkLink).toHaveAttribute("href", "/benchmark");
    expect(workerLink).toHaveAttribute("href", "/workers");
    expect(companyLink).toHaveAttribute("href", "/companies");
  });
});
```

- [x] **Step 2: Run test — should FAIL**

Run: `npx vitest run __tests__/pages/s17-sidebar-notifications.test.tsx 2>&1 | tail -20`
Expected: FAIL — "설정", "관리자" 카테고리 미존재

- [x] **Step 3: Update sidebar component**

Replace the entire content of `components/layout/sidebar.tsx`:

```typescript
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Users,
  Building2,
  Building,
  Lightbulb,
  BarChart3,
  FileText,
  Settings,
  Bell,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  readonly href: string;
  readonly label: string;
  readonly icon: LucideIcon;
}

interface NavSection {
  readonly label: string;
  readonly items: readonly [NavItem, ...NavItem[]];
}

const NAV_SECTIONS: readonly NavSection[] = [
  { label: "메인", items: [{ href: "/", label: "대시보드", icon: LayoutDashboard }] },
  {
    label: "고용 전",
    items: [{ href: "/simulator", label: "E-9 고용허가 시뮬레이터", icon: Lightbulb }],
  },
  {
    label: "고용 후",
    items: [
      { href: "/benchmark", label: "사업장 건강검진", icon: BarChart3 },
      { href: "/workers", label: "근로자 관리", icon: Users },
    ],
  },
  {
    label: "지속 관리",
    items: [{ href: "/legal", label: "법령·리포트", icon: FileText }],
  },
  {
    label: "설정",
    items: [
      { href: "/settings/company", label: "내 사업장 정보", icon: Building },
      { href: "/settings/notifications", label: "알림 설정", icon: Bell },
    ],
  },
  {
    // TODO: P1 인증 도입 시 role=OPERATOR 가드 추가
    label: "관리자",
    items: [{ href: "/companies", label: "사업장 관리", icon: ShieldCheck }],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-64 flex-col border-r bg-background p-4">
      <nav className="flex flex-col gap-4">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label} className="flex flex-col gap-1">
            <h3 className="px-3 text-[10px] font-semibold tracking-[0.08em] text-sidebar-muted">
              {section.label}
            </h3>
            {section.items.map(({ href, label, icon: Icon }) => {
              const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-secondary text-secondary-foreground"
                      : "text-muted-foreground hover:bg-secondary/50",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
}
```

- [x] **Step 4: Run test — should PASS**

Run: `npx vitest run __tests__/pages/s17-sidebar-notifications.test.tsx 2>&1 | tail -20`
Expected: PASS

- [x] **Step 5: Commit**

```bash
git add components/layout/sidebar.tsx __tests__/pages/s17-sidebar-notifications.test.tsx
git commit -m "feat(S17): 사이드바 6개 카테고리 재구성 + E-9 라벨"
```

---

## Task 6: 시뮬레이터 E-9 안내 박스

**Files:**
- Modify: `app/(app)/simulator/page.tsx`

- [x] **Step 1: Add test for simulator info box**

Append to `__tests__/pages/s17-sidebar-notifications.test.tsx`:

```typescript
import SimulatorPage from "@/app/(app)/simulator/page";

// Mock company context
vi.mock("@/lib/contexts/company-context", () => ({
  useCompanyContext: () => ({
    selectedCompanyId: 1,
    selectedCompany: { id: 1, name: "테스트 사업장" },
    companies: [],
    isLoading: false,
    isError: false,
    setSelectedCompanyId: vi.fn(),
  }),
}));

// Mock simulation hook
vi.mock("@/lib/queries/use-simulation", () => ({
  useSimulation: () => ({
    data: null,
    isPending: false,
    isError: false,
    mutate: vi.fn(),
    reset: vi.fn(),
  }),
}));

describe("SimulatorPage — E-9 안내 박스", () => {
  it("E-9 비자 기준 안내 문구가 표시된다", () => {
    render(<SimulatorPage />);
    expect(screen.getByText(/E-9 \(일반 외국인\) 비자 기준/)).toBeInTheDocument();
    expect(screen.getByText(/H-2 \(방문취업\)/)).toBeInTheDocument();
  });
});
```

- [x] **Step 2: Run test — should FAIL**

Run: `npx vitest run __tests__/pages/s17-sidebar-notifications.test.tsx 2>&1 | tail -20`
Expected: FAIL — E-9 안내 문구 미존재

- [x] **Step 3: Add info box to simulator page**

In `app/(app)/simulator/page.tsx`, add the `Info` icon import at the top:

```typescript
import { Info } from "lucide-react";
```

Then add the info box right after `export default function SimulatorPage() {` and the company null check block. Insert before the `const result = mutation.data;` line:

```typescript
  const infoBox = (
    <div className="mb-6 flex gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-200">
      <Info className="mt-0.5 h-4 w-4 shrink-0" />
      <div className="space-y-1">
        <p>본 시뮬레이터는 고용허가제 E-9 (일반 외국인) 비자 기준입니다.</p>
        <p>
          H-2 (방문취업) 비자는 2026-02-12부터 신규 발급이 중단되어 본 시뮬레이션은 E-9 한정으로
          작동합니다.
        </p>
        <p>
          E-7-4 (숙련기능인력) 전환은 별도 추천서 발급 절차이며 본 도구 범위 외입니다.
        </p>
      </div>
    </div>
  );
```

Then wrap the return statements. For the "Input mode" return, wrap with a fragment:

```typescript
  // ─── Input mode ───
  if (!result && !mutation.isPending && !mutation.isError) {
    return (
      <>
        {infoBox}
        <div className="grid grid-cols-[380px_1fr] gap-6">
          {/* ... existing content unchanged ... */}
        </div>
      </>
    );
  }

  // ─── Loading / Error / Result mode ───
  return (
    <>
      {infoBox}
      <div className="grid grid-cols-[380px_1fr] gap-6">
        {/* ... existing content unchanged ... */}
      </div>
    </>
  );
```

- [x] **Step 4: Run test — should PASS**

Run: `npx vitest run __tests__/pages/s17-sidebar-notifications.test.tsx 2>&1 | tail -20`
Expected: PASS

- [x] **Step 5: Commit**

```bash
git add app/(app)/simulator/page.tsx __tests__/pages/s17-sidebar-notifications.test.tsx
git commit -m "feat(S17): 시뮬레이터 E-9 비자 기준 안내 박스"
```

---

## Task 7: 알림 시점 토글 컴포넌트

**Files:**
- Create: `components/notifications/notification-timing-toggles.tsx`

- [x] **Step 1: Add test for timing toggles**

Append to `__tests__/pages/s17-sidebar-notifications.test.tsx`:

```typescript
import userEvent from "@testing-library/user-event";
import { NotificationTimingToggles } from "@/components/notifications/notification-timing-toggles";

describe("NotificationTimingToggles", () => {
  const STORAGE_KEY = "fwc:notification-prefs:1";

  beforeEach(() => {
    localStorage.clear();
  });

  it("기본값으로 3개 체크박스가 모두 체크된다", () => {
    render(<NotificationTimingToggles companyId={1} />);

    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes).toHaveLength(3);
    checkboxes.forEach((cb) => expect(cb).toBeChecked());
  });

  it("체크 해제 시 localStorage에 저장된다", async () => {
    const user = userEvent.setup();
    render(<NotificationTimingToggles companyId={1} />);

    const d30Checkbox = screen.getByLabelText("D-30 (한 달 전)");
    await user.click(d30Checkbox);

    expect(d30Checkbox).not.toBeChecked();
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(stored.d30).toBe(false);
  });

  it("localStorage에 저장된 값을 복원한다", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ d30: false, d7: true, overdue: false }));
    render(<NotificationTimingToggles companyId={1} />);

    expect(screen.getByLabelText("D-30 (한 달 전)")).not.toBeChecked();
    expect(screen.getByLabelText("D-7 (일주일 전)")).toBeChecked();
    expect(screen.getByLabelText("OVERDUE (기한 초과)")).not.toBeChecked();
  });
});
```

- [x] **Step 2: Run test — should FAIL**

Run: `npx vitest run __tests__/pages/s17-sidebar-notifications.test.tsx 2>&1 | tail -20`
Expected: FAIL — module not found

- [x] **Step 3: Implement NotificationTimingToggles**

```typescript
// components/notifications/notification-timing-toggles.tsx
"use client";

import { useState, useCallback } from "react";

interface NotificationPrefs {
  readonly d30: boolean;
  readonly d7: boolean;
  readonly overdue: boolean;
}

const DEFAULT_PREFS: NotificationPrefs = { d30: true, d7: true, overdue: true };

function storageKey(companyId: number): string {
  return `fwc:notification-prefs:${companyId}`;
}

function readPrefs(companyId: number): NotificationPrefs {
  try {
    const stored = localStorage.getItem(storageKey(companyId));
    if (stored) return { ...DEFAULT_PREFS, ...JSON.parse(stored) };
  } catch {
    /* ignore parse errors */
  }
  return DEFAULT_PREFS;
}

function writePrefs(companyId: number, prefs: NotificationPrefs): void {
  try {
    localStorage.setItem(storageKey(companyId), JSON.stringify(prefs));
  } catch {
    /* ignore storage errors */
  }
}

const TOGGLE_ITEMS = [
  { key: "d30" as const, label: "D-30 (한 달 전)" },
  { key: "d7" as const, label: "D-7 (일주일 전)" },
  { key: "overdue" as const, label: "OVERDUE (기한 초과)" },
];

interface NotificationTimingTogglesProps {
  readonly companyId: number;
}

export function NotificationTimingToggles({ companyId }: NotificationTimingTogglesProps) {
  const [prefs, setPrefs] = useState<NotificationPrefs>(() => readPrefs(companyId));

  const handleToggle = useCallback(
    (key: keyof NotificationPrefs) => {
      const updated = { ...prefs, [key]: !prefs[key] };
      setPrefs(updated);
      writePrefs(companyId, updated);
    },
    [prefs, companyId],
  );

  return (
    <div className="space-y-3">
      {TOGGLE_ITEMS.map(({ key, label }) => (
        <label key={key} className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={prefs[key]}
            onChange={() => handleToggle(key)}
            className="h-4 w-4 rounded border-border"
          />
          {label}
        </label>
      ))}
      <p className="text-xs text-muted-foreground">
        ※ 자동 스케줄러는 P2 단계에서 구현 예정입니다.
      </p>
    </div>
  );
}
```

- [x] **Step 4: Run test — should PASS**

Run: `npx vitest run __tests__/pages/s17-sidebar-notifications.test.tsx 2>&1 | tail -20`
Expected: PASS

- [x] **Step 5: Commit**

```bash
git add components/notifications/notification-timing-toggles.tsx __tests__/pages/s17-sidebar-notifications.test.tsx
git commit -m "feat(S17): 알림 시점 토글 컴포넌트 + localStorage 연동"
```

---

## Task 8: 발송 기록 테이블 컴포넌트

**Files:**
- Create: `components/notifications/notification-log-table.tsx`

- [x] **Step 1: Add test for log table**

Append to `__tests__/pages/s17-sidebar-notifications.test.tsx`:

```typescript
import { NotificationLogTable } from "@/components/notifications/notification-log-table";
import type { NotificationLog } from "@/types/notification";

const mockLogs: NotificationLog[] = [
  {
    id: 1,
    sentAt: "2026-04-25T14:30:00",
    templateType: "D7",
    deadlineCount: 3,
    recipientEmail: "owner1@demo.test",
  },
  {
    id: 2,
    sentAt: "2026-04-20T09:00:00",
    templateType: "OVERDUE",
    deadlineCount: 2,
    recipientEmail: "owner1@demo.test",
  },
];

describe("NotificationLogTable", () => {
  it("발송 기록을 테이블로 렌더링한다", () => {
    render(<NotificationLogTable logs={mockLogs} />);

    expect(screen.getByText("D-7")).toBeInTheDocument();
    expect(screen.getByText("기한 초과")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("owner1@demo.test")).toBeInTheDocument();
  });

  it("빈 배열이면 안내 메시지를 표시한다", () => {
    render(<NotificationLogTable logs={[]} />);
    expect(screen.getByText("발송 기록이 없습니다")).toBeInTheDocument();
  });
});
```

- [x] **Step 2: Run test — should FAIL**

Run: `npx vitest run __tests__/pages/s17-sidebar-notifications.test.tsx 2>&1 | tail -20`
Expected: FAIL — module not found

- [x] **Step 3: Implement NotificationLogTable**

```typescript
// components/notifications/notification-log-table.tsx
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TEMPLATE_TYPE_LABELS } from "@/types/notification";
import type { NotificationLog } from "@/types/notification";

interface NotificationLogTableProps {
  readonly logs: readonly NotificationLog[];
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function NotificationLogTable({ logs }: NotificationLogTableProps) {
  if (logs.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">발송 기록이 없습니다</p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>발송 시각</TableHead>
          <TableHead>시점</TableHead>
          <TableHead className="text-right">건수</TableHead>
          <TableHead>수신자</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {logs.map((log) => (
          <TableRow key={log.id}>
            <TableCell className="font-mono text-sm">{formatDate(log.sentAt)}</TableCell>
            <TableCell>{TEMPLATE_TYPE_LABELS[log.templateType]}</TableCell>
            <TableCell className="text-right">{log.deadlineCount}</TableCell>
            <TableCell className="text-sm text-muted-foreground">{log.recipientEmail}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

- [x] **Step 4: Run test — should PASS**

Run: `npx vitest run __tests__/pages/s17-sidebar-notifications.test.tsx 2>&1 | tail -20`
Expected: PASS

- [x] **Step 5: Commit**

```bash
git add components/notifications/notification-log-table.tsx __tests__/pages/s17-sidebar-notifications.test.tsx
git commit -m "feat(S17): 발송 기록 테이블 컴포넌트"
```

---

## Task 9: contactEmail 편집 모달

**Files:**
- Create: `components/settings/company-edit-modal.tsx`

- [x] **Step 1: Add test for edit modal**

Append to `__tests__/pages/s17-sidebar-notifications.test.tsx`:

```typescript
import { CompanyEditModal } from "@/components/settings/company-edit-modal";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Helper for wrapping with QueryClient
function renderWithQuery(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe("CompanyEditModal", () => {
  it("open=true일 때 모달이 표시된다", () => {
    renderWithQuery(
      <CompanyEditModal
        open={true}
        onClose={vi.fn()}
        companyId={1}
        currentEmail="test@demo.test"
      />,
    );

    expect(screen.getByText("연락처 이메일 변경")).toBeInTheDocument();
    expect(screen.getByDisplayValue("test@demo.test")).toBeInTheDocument();
  });

  it("open=false일 때 모달이 표시되지 않는다", () => {
    renderWithQuery(
      <CompanyEditModal
        open={false}
        onClose={vi.fn()}
        companyId={1}
        currentEmail="test@demo.test"
      />,
    );

    expect(screen.queryByText("연락처 이메일 변경")).not.toBeInTheDocument();
  });
});
```

- [x] **Step 2: Run test — should FAIL**

Run: `npx vitest run __tests__/pages/s17-sidebar-notifications.test.tsx 2>&1 | tail -20`
Expected: FAIL — module not found

- [x] **Step 3: Implement CompanyEditModal**

```typescript
// components/settings/company-edit-modal.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUpdateCompany } from "@/lib/queries/use-companies";
import { toast } from "sonner";

const emailSchema = z.object({
  contactEmail: z.string().email("올바른 이메일 주소를 입력해주세요"),
});

type EmailFormData = z.infer<typeof emailSchema>;

interface CompanyEditModalProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly companyId: number;
  readonly currentEmail: string | null;
}

export function CompanyEditModal({ open, onClose, companyId, currentEmail }: CompanyEditModalProps) {
  const updateMutation = useUpdateCompany();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    values: { contactEmail: currentEmail ?? "" },
  });

  function onSubmit(data: EmailFormData) {
    updateMutation.mutate(
      {
        id: companyId,
        data: { contactEmail: data.contactEmail } as Parameters<
          typeof updateMutation.mutate
        >[0]["data"],
      },
      {
        onSuccess: () => {
          toast.success("이메일이 변경되었습니다");
          onClose();
        },
        onError: (error) => {
          toast.error(`변경 실패: ${error.message}`);
        },
      },
    );
  }

  return (
    <AlertDialog open={open}>
      <AlertDialogContent className="max-w-sm">
        <AlertDialogHeader>
          <AlertDialogTitle>연락처 이메일 변경</AlertDialogTitle>
        </AlertDialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="contactEmail">이메일</Label>
            <Input
              id="contactEmail"
              type="email"
              placeholder="example@company.com"
              {...register("contactEmail")}
            />
            {errors.contactEmail && (
              <p className="text-xs text-destructive">{errors.contactEmail.message}</p>
            )}
          </div>
          <AlertDialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              취소
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "저장 중..." : "저장"}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

- [x] **Step 4: Run test — should PASS**

Run: `npx vitest run __tests__/pages/s17-sidebar-notifications.test.tsx 2>&1 | tail -20`
Expected: PASS

- [x] **Step 5: Commit**

```bash
git add components/settings/company-edit-modal.tsx __tests__/pages/s17-sidebar-notifications.test.tsx
git commit -m "feat(S17): contactEmail 편집 모달"
```

---

## Task 10: 내 사업장 정보 페이지

**Files:**
- Create: `app/(app)/settings/company/page.tsx`

- [x] **Step 1: Add test for my company page**

Append to `__tests__/pages/s17-sidebar-notifications.test.tsx`:

```typescript
// Note: useCompanyContext mock is already set up from Task 6 tests
// We need to also mock use-companies and use-workers for this page

vi.mock("@/lib/queries/use-companies", () => ({
  useCompany: () => ({
    data: {
      id: 1,
      name: "테스트 사업장",
      businessNumber: "123-45-67890",
      region: "SEOUL",
      subRegion: null,
      industryCategory: "MANUFACTURING",
      industrySubCategory: null,
      employeeCount: 50,
      domesticInsuredCount: null,
      foreignWorkerCount: 10,
      address: "서울시 강남구",
      contactPhone: "02-1234-5678",
      contactEmail: "test@demo.test",
      averageForeignWorkerWage: null,
      recentYearTerminationCount: null,
      createdAt: "2026-01-01",
      updatedAt: "2026-01-01",
    },
    isLoading: false,
    isError: false,
    error: null,
  }),
  useUpdateCompany: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
  useCompanies: () => ({ data: [], isLoading: false, isError: false }),
}));

vi.mock("@/lib/queries/use-workers", () => ({
  useWorkers: () => ({
    data: [{ id: 1 }, { id: 2 }, { id: 3 }],
    isLoading: false,
    isError: false,
  }),
}));
```

Then add the test:

```typescript
import MyCompanyPage from "@/app/(app)/settings/company/page";

describe("MyCompanyPage — 내 사업장 정보", () => {
  it("사업장 정보와 근로자 수를 표시한다", () => {
    renderWithQuery(<MyCompanyPage />);

    expect(screen.getByText("내 사업장 정보")).toBeInTheDocument();
    expect(screen.getByText("123-45-67890")).toBeInTheDocument();
    expect(screen.getByText(/소속 근로자 3명/)).toBeInTheDocument();
  });

  it("정보 수정 버튼이 있다", () => {
    renderWithQuery(<MyCompanyPage />);
    expect(screen.getByRole("button", { name: "정보 수정" })).toBeInTheDocument();
  });

  it("근로자 관리 링크가 있다", () => {
    renderWithQuery(<MyCompanyPage />);
    const link = screen.getByText("근로자 관리 →");
    expect(link).toHaveAttribute("href", "/workers");
  });
});
```

- [x] **Step 2: Run test — should FAIL**

Run: `npx vitest run __tests__/pages/s17-sidebar-notifications.test.tsx 2>&1 | tail -20`
Expected: FAIL — module not found

- [x] **Step 3: Implement MyCompanyPage**

```typescript
// app/(app)/settings/company/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Pencil, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CompanyDetailCard } from "@/components/companies/company-detail-card";
import { CompanyEditModal } from "@/components/settings/company-edit-modal";
import { useCompanyContext } from "@/lib/contexts/company-context";
import { useCompany } from "@/lib/queries/use-companies";
import { useWorkers } from "@/lib/queries/use-workers";

export default function MyCompanyPage() {
  const { selectedCompanyId } = useCompanyContext();
  const company = useCompany(selectedCompanyId ?? 0);
  const workers = useWorkers(selectedCompanyId);
  const [editOpen, setEditOpen] = useState(false);

  if (selectedCompanyId == null) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">사업장을 선택해주세요</p>
      </div>
    );
  }

  if (company.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (company.error || !company.data) {
    return (
      <div className="py-12 text-center">
        <p className="text-destructive">사업장 정보를 불러올 수 없습니다</p>
      </div>
    );
  }

  const workerCount = workers.data?.length ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">내 사업장 정보</h1>
        <Button variant="outline" onClick={() => setEditOpen(true)}>
          <Pencil className="h-4 w-4" />
          정보 수정
        </Button>
      </div>

      <CompanyDetailCard company={company.data} />

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="h-4 w-4 text-muted-foreground" />
            근로자 요약
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <p className="text-sm">
            소속 근로자 <span className="font-semibold">{workerCount}명</span>
          </p>
          <Link
            href="/workers"
            className="text-sm text-primary hover:underline"
          >
            근로자 관리 →
          </Link>
        </CardContent>
      </Card>

      <CompanyEditModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        companyId={selectedCompanyId}
        currentEmail={company.data.contactEmail}
      />
    </div>
  );
}
```

- [x] **Step 4: Run test — should PASS**

Run: `npx vitest run __tests__/pages/s17-sidebar-notifications.test.tsx 2>&1 | tail -20`
Expected: PASS

- [x] **Step 5: Commit**

```bash
git add app/(app)/settings/company/page.tsx __tests__/pages/s17-sidebar-notifications.test.tsx
git commit -m "feat(S17): 내 사업장 정보 페이지 (/settings/company)"
```

---

## Task 11: 알림 설정 페이지

**Files:**
- Create: `app/(app)/settings/notifications/page.tsx`

- [x] **Step 1: Add test for notification settings page**

Append to `__tests__/pages/s17-sidebar-notifications.test.tsx`:

```typescript
import { server } from "@/mocks/server";
import { beforeAll, afterAll, afterEach } from "vitest";

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

Note: If `beforeAll`/`afterAll`/`afterEach` for MSW server are already declared at the file's top-level scope, skip this and just add the test below. If they conflict with earlier describe blocks, wrap the MSW-dependent tests in their own describe with the lifecycle hooks.

```typescript
import NotificationSettingsPage from "@/app/(app)/settings/notifications/page";

vi.mock("@/lib/queries/use-notifications", async () => {
  const actual = await vi.importActual("@/lib/queries/use-notifications");
  return actual;
});

describe("NotificationSettingsPage — 알림 설정", () => {
  it("수신 이메일과 알림 시점 섹션이 표시된다", () => {
    renderWithQuery(<NotificationSettingsPage />);

    expect(screen.getByText("알림 설정")).toBeInTheDocument();
    expect(screen.getByText("수신 이메일")).toBeInTheDocument();
    expect(screen.getByText("알림 시점")).toBeInTheDocument();
    expect(screen.getByText("수동 발송")).toBeInTheDocument();
    expect(screen.getByText("최근 발송 기록")).toBeInTheDocument();
  });

  it("contactEmail을 표시한다", () => {
    renderWithQuery(<NotificationSettingsPage />);
    expect(screen.getByText("test@demo.test")).toBeInTheDocument();
  });

  it("지금 알림 보내기 버튼이 있다", () => {
    renderWithQuery(<NotificationSettingsPage />);
    expect(screen.getByRole("button", { name: "지금 알림 보내기" })).toBeInTheDocument();
  });

  it("P2 스케줄러 안내가 표시된다", () => {
    renderWithQuery(<NotificationSettingsPage />);
    expect(screen.getByText(/자동 스케줄러는 P2 단계에서 구현 예정/)).toBeInTheDocument();
  });
});
```

- [x] **Step 2: Run test — should FAIL**

Run: `npx vitest run __tests__/pages/s17-sidebar-notifications.test.tsx 2>&1 | tail -20`
Expected: FAIL — module not found

- [x] **Step 3: Implement NotificationSettingsPage**

```typescript
// app/(app)/settings/notifications/page.tsx
"use client";

import Link from "next/link";
import { Mail, Bell, Send, Clock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { NotificationTimingToggles } from "@/components/notifications/notification-timing-toggles";
import { NotificationLogTable } from "@/components/notifications/notification-log-table";
import { useCompanyContext } from "@/lib/contexts/company-context";
import { useCompany } from "@/lib/queries/use-companies";
import { useNotificationLogs, useTriggerNotification } from "@/lib/queries/use-notifications";
import { toast } from "sonner";

export default function NotificationSettingsPage() {
  const { selectedCompanyId } = useCompanyContext();
  const company = useCompany(selectedCompanyId ?? 0);
  const logs = useNotificationLogs(selectedCompanyId);
  const triggerMutation = useTriggerNotification();

  if (selectedCompanyId == null) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">사업장을 선택해주세요</p>
      </div>
    );
  }

  function handleTrigger() {
    if (selectedCompanyId == null) return;
    triggerMutation.mutate(
      { companyId: selectedCompanyId },
      {
        onSuccess: (data) => {
          toast.success(`${data.triggered}건 발송 완료`);
        },
        onError: (error) => {
          toast.error(`발송 실패: ${error.message}`);
        },
      },
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">알림 설정</h1>

      {/* 수신 이메일 */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Mail className="h-4 w-4 text-muted-foreground" />
            수신 이메일
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <p className="text-sm">
            {company.isLoading ? (
              <Skeleton className="inline-block h-4 w-40" />
            ) : (
              company.data?.contactEmail ?? "등록된 이메일 없음"
            )}
          </p>
          <Link
            href="/settings/company"
            className="text-sm text-primary hover:underline"
          >
            이메일 변경 →
          </Link>
        </CardContent>
      </Card>

      {/* 알림 시점 */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-4 w-4 text-muted-foreground" />
            알림 시점
          </CardTitle>
        </CardHeader>
        <CardContent>
          <NotificationTimingToggles companyId={selectedCompanyId} />
        </CardContent>
      </Card>

      {/* 수동 발송 */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Send className="h-4 w-4 text-muted-foreground" />
            수동 발송
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={handleTrigger} disabled={triggerMutation.isPending}>
            <Bell className="h-4 w-4" />
            {triggerMutation.isPending ? "발송 중..." : "지금 알림 보내기"}
          </Button>
        </CardContent>
      </Card>

      {/* 최근 발송 기록 */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-4 w-4 text-muted-foreground" />
            최근 발송 기록
          </CardTitle>
        </CardHeader>
        <CardContent>
          {logs.isLoading ? (
            <Skeleton className="h-24 w-full" />
          ) : (
            <NotificationLogTable logs={logs.data ?? []} />
          )}
        </CardContent>
      </Card>

      {/* P2 스케줄러 안내 */}
      <div className="flex gap-3 rounded-lg border border-orange-200 bg-orange-50 p-4 text-sm text-orange-800 dark:border-orange-900 dark:bg-orange-950/30 dark:text-orange-200">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
        <div>
          <p>자동 스케줄러는 P2 단계에서 구현 예정입니다.</p>
          <p>현재는 위 "지금 알림 보내기" 버튼으로 수동 발송이 가능합니다.</p>
        </div>
      </div>
    </div>
  );
}
```

- [x] **Step 4: Run test — should PASS**

Run: `npx vitest run __tests__/pages/s17-sidebar-notifications.test.tsx 2>&1 | tail -20`
Expected: PASS

- [x] **Step 5: Commit**

```bash
git add app/(app)/settings/notifications/page.tsx __tests__/pages/s17-sidebar-notifications.test.tsx
git commit -m "feat(S17): 알림 설정 페이지 (/settings/notifications)"
```

---

## Task 12: 대시보드 데드라인 딥링크

**Files:**
- Modify: `components/dashboard/deadline-timeline.tsx`

- [x] **Step 1: Add test for deeplink**

Append to `__tests__/pages/s17-sidebar-notifications.test.tsx`:

```typescript
import { DeadlineTimeline } from "@/components/dashboard/deadline-timeline";

describe("DeadlineTimeline — 알림 설정 딥링크", () => {
  it("알림 설정 링크가 표시된다", () => {
    render(<DeadlineTimeline items={[]} />);
    const link = screen.getByText("알림 설정 →");
    expect(link).toHaveAttribute("href", "/settings/notifications");
  });
});
```

- [x] **Step 2: Run test — should FAIL**

Run: `npx vitest run __tests__/pages/s17-sidebar-notifications.test.tsx 2>&1 | tail -20`
Expected: FAIL — "알림 설정 →" 링크 미존재

- [x] **Step 3: Add deeplink to DeadlineTimeline**

In `components/dashboard/deadline-timeline.tsx`, add a footer link after the `</CardContent>` closing tag and before the closing `</Card>`:

```typescript
      <div className="border-t px-6 py-3 text-right">
        <Link
          href="/settings/notifications"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          알림 설정 →
        </Link>
      </div>
```

The full component structure becomes:

```typescript
  return (
    <Card>
      <CardHeader className="pb-2">
        {/* ... existing header unchanged ... */}
      </CardHeader>
      <CardContent className="space-y-1.5">
        {/* ... existing content unchanged ... */}
      </CardContent>
      <div className="border-t px-6 py-3 text-right">
        <Link
          href="/settings/notifications"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          알림 설정 →
        </Link>
      </div>
    </Card>
  );
```

- [x] **Step 4: Run test — should PASS**

Run: `npx vitest run __tests__/pages/s17-sidebar-notifications.test.tsx 2>&1 | tail -20`
Expected: PASS

- [x] **Step 5: Commit**

```bash
git add components/dashboard/deadline-timeline.tsx __tests__/pages/s17-sidebar-notifications.test.tsx
git commit -m "feat(S17): 대시보드 타임라인 → 알림 설정 딥링크"
```

---

## Task 13: 전체 테스트 검증 + Lint

**Files:**
- All modified/created files

- [x] **Step 1: Run full test suite**

Run: `npx vitest run 2>&1 | tail -30`
Expected: All tests PASS

- [x] **Step 2: Run lint**

Run: `npm run lint 2>&1 | tail -20`
Expected: No errors

- [x] **Step 3: Run type check**

Run: `npx tsc --noEmit --pretty 2>&1 | tail -20`
Expected: No errors

- [x] **Step 4: Fix any issues found in steps 1-3**

If tests fail, fix the failing tests/code and re-run. If lint errors, fix formatting. If type errors, fix types.

- [x] **Step 5: Run format**

Run: `npm run format`

- [x] **Step 6: Final commit**

```bash
git add -A
git commit -m "chore(S17): lint + format 정리"
```

---

## Regression Checklist

After all tasks are complete, verify manually with `npm run dev:mock`:

- [x] 사이드바: 6개 카테고리, 7개 메뉴 아이템 표시
- [x] `/` (대시보드): 30일 타임라인에 "알림 설정 →" 링크
- [x] `/simulator`: E-9 안내 박스 상단 표시
- [x] `/settings/company`: 사업장 정보 + 근로자 수 + 편집 모달
- [x] `/settings/notifications`: 수신 이메일 + 토글 + 수동 발송 + 기록 테이블
- [x] `/companies`: 관리자 카테고리에서 접근 가능
- [x] `/benchmark`, `/workers`, `/legal`: 기존 기능 정상 작동
