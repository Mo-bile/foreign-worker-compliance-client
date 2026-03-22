# Company CRUD + Worker Breaking Change Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** BE Stage 1-1 전달 기반으로 Company CRUD 전체 (타입, API, UI)를 구현하고, Worker의 workplaceId → companyId breaking change를 적용한다.

**Architecture:** Bottom-Up 접근. types/api.ts 타입 → api-client.ts put 확장 → MSW 목 데이터 → Route Handler → React Query 훅 → Company Context → UI 페이지 → Worker 마이그레이션 순서. 모든 레이어가 아래에만 의존하므로 빌드 에러 없이 점진적 구현 가능.

**Tech Stack:** Next.js 16, React 19, TypeScript, Zod, React Hook Form, TanStack React Query, shadcn/ui (base-nova), Tailwind CSS v4, MSW, Vitest, Lucide Icons

**Spec:** `docs/superpowers/specs/2026-03-22-company-crud-design.md`

---

## File Structure

### 신규 파일

| 파일 | 책임 |
|------|------|
| `app/api/companies/route.ts` | Company 목록/등록 Route Handler (GET, POST) |
| `app/api/companies/[id]/route.ts` | Company 상세/수정 Route Handler (GET, PUT) |
| `lib/queries/use-companies.ts` | Company React Query 훅 (CRUD) |
| `lib/contexts/company-context.tsx` | 글로벌 사업장 선택 Context + Provider |
| `components/companies/company-form.tsx` | 사업장 등록/수정 공용 폼 |
| `components/companies/company-table.tsx` | 사업장 목록 테이블 + 필터 + 페이지네이션 |
| `components/companies/company-detail-card.tsx` | 사업장 상세 정보 카드 |
| `components/companies/company-selector.tsx` | 헤더 사업장 선택 드롭다운 |
| `app/(app)/companies/page.tsx` | 사업장 목록 페이지 |
| `app/(app)/companies/new/page.tsx` | 사업장 등록 페이지 |
| `app/(app)/companies/[id]/page.tsx` | 사업장 상세 페이지 |
| `app/(app)/companies/[id]/edit/page.tsx` | 사업장 수정 페이지 |
| `__tests__/types/company-schemas.test.ts` | Company Zod 스키마 테스트 |
| `__tests__/lib/api-client-put.test.ts` | apiClient.put 테스트 |
| `__tests__/lib/use-companies.test.tsx` | Company 훅 테스트 |
| `__tests__/components/company-form.test.tsx` | CompanyForm 컴포넌트 테스트 |
| `__tests__/components/company-table.test.tsx` | CompanyTable 컴포넌트 테스트 |
| `__tests__/components/company-selector.test.tsx` | CompanySelector 컴포넌트 테스트 |

### 수정 파일

| 파일 | 변경 내용 |
|------|----------|
| `types/api.ts` | Region/IndustryCategory enum, Company DTO, workplaceId→companyId |
| `lib/api-client.ts` | `put` 메서드 추가 |
| `mocks/data.ts` | mockCompanies 추가 |
| `mocks/handlers.ts` | Company 핸들러 + workers GET companyId 필터 |
| `lib/queries/use-workers.ts` | useWorkers(companyId?), usePaginatedWorkers 시그니처 변경 |
| `app/api/workers/route.ts` | GET에 companyId 쿼리 파라미터 전달 |
| `components/workers/worker-form.tsx` | workplaceId→companyId, Select 드롭다운 전환 |
| `components/layout/sidebar.tsx` | 사업장 관리 메뉴 추가 |
| `components/layout/header.tsx` | CompanySelector 추가 |
| `app/(app)/layout.tsx` | CompanyProvider 배치 |
| `app/(app)/workers/page.tsx` | CompanyContext 기반 companyId 전달 |
| `__tests__/types/schemas.test.ts` | workplaceId→companyId, enum 개수 테스트 추가 |
| `__tests__/components/worker-form.test.tsx` | "사업장" 레이블 변경 반영 |
| `__tests__/lib/use-paginated-workers.test.tsx` | companyId 파라미터 반영 |

---

## Task 1: Region / IndustryCategory Enum 추가 + Company Zod 스키마

**Files:**
- Modify: `types/api.ts`
- Create: `__tests__/types/company-schemas.test.ts`
- Modify: `__tests__/types/schemas.test.ts`

- [ ] **Step 1: types/api.ts에 Company enum 테스트 작성**

`__tests__/types/company-schemas.test.ts`:
```typescript
import { describe, it, expect } from "vitest";
import {
  REGIONS,
  REGION_LABELS,
  INDUSTRY_CATEGORIES,
  INDUSTRY_CATEGORY_LABELS,
  createCompanyRequestSchema,
  updateCompanyRequestSchema,
  type Region,
  type IndustryCategory,
} from "@/types/api";

describe("Region enum", () => {
  it("17개_지역을_가진다", () => {
    expect(REGIONS).toHaveLength(17);
  });

  it("모든_지역에_한글_라벨이_있다", () => {
    for (const region of REGIONS) {
      expect(REGION_LABELS[region]).toBeDefined();
      expect(typeof REGION_LABELS[region]).toBe("string");
    }
  });
});

describe("IndustryCategory enum", () => {
  it("8개_업종을_가진다", () => {
    expect(INDUSTRY_CATEGORIES).toHaveLength(8);
  });

  it("모든_업종에_한글_라벨이_있다", () => {
    for (const cat of INDUSTRY_CATEGORIES) {
      expect(INDUSTRY_CATEGORY_LABELS[cat]).toBeDefined();
    }
  });
});

describe("createCompanyRequestSchema", () => {
  const validRequest = {
    name: "테스트 회사",
    businessNumber: "123-45-67890",
    region: "SEOUL" as Region,
    industryCategory: "MANUFACTURING" as IndustryCategory,
    employeeCount: 50,
    foreignWorkerCount: 10,
    address: "서울시 강남구",
    contactPhone: "02-1234-5678",
  };

  it("유효한_요청을_통과시킨다", () => {
    const result = createCompanyRequestSchema.safeParse(validRequest);
    expect(result.success).toBe(true);
  });

  it("사업자번호_형식이_틀리면_실패한다", () => {
    const result = createCompanyRequestSchema.safeParse({
      ...validRequest,
      businessNumber: "12345678",
    });
    expect(result.success).toBe(false);
  });

  it("외국인근로자수가_총직원수를_초과하면_실패한다", () => {
    const result = createCompanyRequestSchema.safeParse({
      ...validRequest,
      employeeCount: 10,
      foreignWorkerCount: 20,
    });
    expect(result.success).toBe(false);
  });

  it("선택필드_없이도_통과한다", () => {
    const result = createCompanyRequestSchema.safeParse(validRequest);
    expect(result.success).toBe(true);
  });

  it("선택필드_포함시에도_통과한다", () => {
    const result = createCompanyRequestSchema.safeParse({
      ...validRequest,
      subRegion: "강남구",
      industrySubCategory: "전자부품",
    });
    expect(result.success).toBe(true);
  });
});

describe("updateCompanyRequestSchema", () => {
  it("businessNumber_없이_통과한다", () => {
    const result = updateCompanyRequestSchema.safeParse({
      name: "수정된 회사",
      region: "BUSAN",
      industryCategory: "CONSTRUCTION",
      employeeCount: 30,
      foreignWorkerCount: 5,
      address: "부산시 해운대구",
      contactPhone: "051-1234-5678",
    });
    expect(result.success).toBe(true);
  });
});
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

Run: `npx vitest run __tests__/types/company-schemas.test.ts`
Expected: FAIL — `REGIONS`, `createCompanyRequestSchema` 등 미정의

- [ ] **Step 3: types/api.ts에 Region, IndustryCategory enum 추가**

`types/api.ts`에 기존 `InsuranceStatus` 섹션 아래에 추가:

```typescript
// ─── Region ─────────────────────────────────────────────
export const REGIONS = [
  "SEOUL", "BUSAN", "DAEGU", "INCHEON", "GWANGJU", "DAEJEON", "ULSAN", "SEJONG",
  "GYEONGGI", "GANGWON", "CHUNGBUK", "CHUNGNAM", "JEONBUK", "JEONNAM",
  "GYEONGBUK", "GYEONGNAM", "JEJU",
] as const;
export type Region = (typeof REGIONS)[number];

export const REGION_LABELS: Record<Region, string> = {
  SEOUL: "서울", BUSAN: "부산", DAEGU: "대구", INCHEON: "인천",
  GWANGJU: "광주", DAEJEON: "대전", ULSAN: "울산", SEJONG: "세종",
  GYEONGGI: "경기", GANGWON: "강원", CHUNGBUK: "충북", CHUNGNAM: "충남",
  JEONBUK: "전북", JEONNAM: "전남", GYEONGBUK: "경북", GYEONGNAM: "경남",
  JEJU: "제주",
};

// ─── IndustryCategory ───────────────────────────────────
export const INDUSTRY_CATEGORIES = [
  "MANUFACTURING", "CONSTRUCTION", "AGRICULTURE", "FISHING",
  "SERVICE", "MINING", "ACCOMMODATION", "OTHER",
] as const;
export type IndustryCategory = (typeof INDUSTRY_CATEGORIES)[number];

export const INDUSTRY_CATEGORY_LABELS: Record<IndustryCategory, string> = {
  MANUFACTURING: "제조업", CONSTRUCTION: "건설업", AGRICULTURE: "농업",
  FISHING: "어업", SERVICE: "서비스업", MINING: "광업",
  ACCOMMODATION: "숙박업", OTHER: "기타",
};
```

- [ ] **Step 4: Company Zod 스키마 + 타입 추가**

`types/api.ts`에 기존 `registerWorkerRequestSchema` 위에 추가:

```typescript
// ─── Company Schemas ─────────────────────────────────────
export const createCompanyRequestSchema = z.object({
  name: z.string().min(1, "회사명을 입력해주세요"),
  businessNumber: z.string().regex(/^\d{3}-\d{2}-\d{5}$/, "사업자번호 형식: xxx-xx-xxxxx"),
  region: z.enum(REGIONS, { error: "지역을 선택해주세요" }),
  subRegion: z.string().optional(),
  industryCategory: z.enum(INDUSTRY_CATEGORIES, { error: "업종을 선택해주세요" }),
  industrySubCategory: z.string().optional(),
  employeeCount: z.number().int().min(1, "1명 이상이어야 합니다"),
  foreignWorkerCount: z.number().int().min(0, "0명 이상이어야 합니다"),
  address: z.string().min(1, "주소를 입력해주세요"),
  contactPhone: z.string().min(1, "연락처를 입력해주세요"),
}).refine((d) => d.foreignWorkerCount <= d.employeeCount, {
  message: "외국인 근로자 수는 총 직원 수를 초과할 수 없습니다",
  path: ["foreignWorkerCount"],
});

export type CreateCompanyRequest = z.infer<typeof createCompanyRequestSchema>;

export const updateCompanyRequestSchema = z.object({
  name: z.string().min(1, "회사명을 입력해주세요"),
  region: z.enum(REGIONS, { error: "지역을 선택해주세요" }),
  subRegion: z.string().optional(),
  industryCategory: z.enum(INDUSTRY_CATEGORIES, { error: "업종을 선택해주세요" }),
  industrySubCategory: z.string().optional(),
  employeeCount: z.number().int().min(1, "1명 이상이어야 합니다"),
  foreignWorkerCount: z.number().int().min(0, "0명 이상이어야 합니다"),
  address: z.string().min(1, "주소를 입력해주세요"),
  contactPhone: z.string().min(1, "연락처를 입력해주세요"),
}).refine((d) => d.foreignWorkerCount <= d.employeeCount, {
  message: "외국인 근로자 수는 총 직원 수를 초과할 수 없습니다",
  path: ["foreignWorkerCount"],
});

export type UpdateCompanyRequest = z.infer<typeof updateCompanyRequestSchema>;

export interface CompanyResponse {
  readonly id: number;
  readonly name: string;
  readonly businessNumber: string;
  readonly region: Region;
  readonly regionName: string;
  readonly subRegion: string | null;
  readonly industryCategory: IndustryCategory;
  readonly industryCategoryName: string;
  readonly industrySubCategory: string | null;
  readonly employeeCount: number;
  readonly foreignWorkerCount: number;
  readonly address: string;
  readonly contactPhone: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}
```

- [ ] **Step 5: 기존 enum 테스트에 Region/IndustryCategory 개수 테스트 추가**

`__tests__/types/schemas.test.ts`의 `"enum 상수"` describe 안에 추가:

```typescript
import { REGIONS, INDUSTRY_CATEGORIES } from "@/types/api";

it("REGIONS는_17개_값을_가진다", () => {
  expect(REGIONS).toHaveLength(17);
});

it("INDUSTRY_CATEGORIES는_8개_값을_가진다", () => {
  expect(INDUSTRY_CATEGORIES).toHaveLength(8);
});
```

- [ ] **Step 6: 전체 스키마 테스트 실행 — 통과 확인**

Run: `npx vitest run __tests__/types/`
Expected: ALL PASS

- [ ] **Step 7: 커밋**

```bash
git add types/api.ts __tests__/types/company-schemas.test.ts __tests__/types/schemas.test.ts
git commit -m "feat: add Region, IndustryCategory enums and Company Zod schemas"
```

---

## Task 2: apiClient.put 메서드 추가

**Files:**
- Modify: `lib/api-client.ts`
- Create: `__tests__/lib/api-client-put.test.ts`
- Modify: `mocks/handlers.ts`

- [ ] **Step 1: put 테스트 작성**

`__tests__/lib/api-client-put.test.ts`:
```typescript
import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import { server } from "@/mocks/server";
import { apiClient } from "@/lib/api-client";

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("apiClient.put", () => {
  it("PUT_요청으로_데이터를_전송한다", async () => {
    const result = await apiClient.put<{ id: number }>("/test/put", { name: "updated" });
    expect(result).toHaveProperty("id", 1);
  });
});
```

- [ ] **Step 2: MSW에 PUT 테스트 핸들러 추가**

`mocks/handlers.ts`의 test endpoints 섹션에 추가:

```typescript
http.put(`${BACKEND}/test/put`, () => HttpResponse.json({ id: 1 })),
```

- [ ] **Step 3: 테스트 실행 — 실패 확인**

Run: `npx vitest run __tests__/lib/api-client-put.test.ts`
Expected: FAIL — `apiClient.put is not a function`

- [ ] **Step 4: api-client.ts에 put 메서드 구현**

`lib/api-client.ts`에 `post` 함수 뒤에 `put` 함수 추가:

```typescript
async function put<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${getBaseUrl()}${path}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return handleResponse<T>(response);
}
```

그리고 기존 export 라인을 **교체** (추가가 아님):
```typescript
// 변경 전:
export const apiClient = { get, post } as const;
// 변경 후:
export const apiClient = { get, post, put } as const;
```

- [ ] **Step 5: 테스트 실행 — 통과 확인**

Run: `npx vitest run __tests__/lib/api-client-put.test.ts`
Expected: PASS

- [ ] **Step 6: 커밋**

```bash
git add lib/api-client.ts __tests__/lib/api-client-put.test.ts mocks/handlers.ts
git commit -m "feat: add put method to apiClient"
```

---

## Task 3: MSW 목 데이터 + Company 핸들러

**Files:**
- Modify: `mocks/data.ts`
- Modify: `mocks/handlers.ts`

- [ ] **Step 1: mockCompanies 데이터 추가**

`mocks/data.ts`에 import에 `CompanyResponse` 추가하고, 파일 상단(workers 데이터 전)에 추가:

```typescript
import type { WorkerResponse, ComplianceDeadlineResponse, CompanyResponse } from "@/types/api";

// ─── 사업장 목 데이터 ──────────────────────────────────
export const mockCompanies: readonly CompanyResponse[] = [
  {
    id: 1,
    name: "한국전자 주식회사",
    businessNumber: "123-45-67890",
    region: "SEOUL",
    regionName: "서울",
    subRegion: "강남구",
    industryCategory: "MANUFACTURING",
    industryCategoryName: "제조업",
    industrySubCategory: "전자부품",
    employeeCount: 150,
    foreignWorkerCount: 30,
    address: "서울시 강남구 테헤란로 123",
    contactPhone: "02-1234-5678",
    createdAt: "2025-01-15T09:00:00",
    updatedAt: "2025-06-20T14:30:00",
  },
  {
    id: 2,
    name: "부산건설 주식회사",
    businessNumber: "234-56-78901",
    region: "BUSAN",
    regionName: "부산",
    subRegion: "해운대구",
    industryCategory: "CONSTRUCTION",
    industryCategoryName: "건설업",
    industrySubCategory: null,
    employeeCount: 80,
    foreignWorkerCount: 25,
    address: "부산시 해운대구 센텀로 45",
    contactPhone: "051-9876-5432",
    createdAt: "2025-03-01T10:00:00",
    updatedAt: "2025-07-15T11:00:00",
  },
  {
    id: 3,
    name: "경기농업 영농조합",
    businessNumber: "345-67-89012",
    region: "GYEONGGI",
    regionName: "경기",
    subRegion: "이천시",
    industryCategory: "AGRICULTURE",
    industryCategoryName: "농업",
    industrySubCategory: "시설원예",
    employeeCount: 30,
    foreignWorkerCount: 15,
    address: "경기도 이천시 농업로 78",
    contactPhone: "031-5555-1234",
    createdAt: "2025-05-10T08:00:00",
    updatedAt: "2025-08-01T09:30:00",
  },
];
```

- [ ] **Step 2: Company CRUD 핸들러 + workers companyId 필터 추가**

`mocks/handlers.ts`에 `mockCompanies` import 추가하고, handlers 배열에 Company 핸들러 추가:

```typescript
import { mockWorkers, mockOverdueDeadlines, mockUpcomingDeadlines, mockCompanies } from "./data";

// Company handlers — BACKEND paths
http.get(`${BACKEND}/api/companies`, () => HttpResponse.json(mockCompanies)),
http.get(`${BACKEND}/api/companies/:id`, ({ params }) => {
  const company = mockCompanies.find((c) => c.id === Number(params.id));
  if (!company) {
    return HttpResponse.json(
      { status: 404, error: "Not Found", message: "사업장을 찾을 수 없습니다", timestamp: new Date().toISOString() },
      { status: 404 },
    );
  }
  return HttpResponse.json(company);
}),
http.post(`${BACKEND}/api/companies`, async ({ request }) => {
  const body = (await request.json()) as Record<string, unknown>;
  const newCompany: CompanyResponse = {
    ...mockCompanies[0],
    id: 99,
    name: body.name as string,
    businessNumber: body.businessNumber as string,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  return HttpResponse.json(newCompany, { status: 201 });
}),
http.put(`${BACKEND}/api/companies/:id`, async ({ params, request }) => {
  const company = mockCompanies.find((c) => c.id === Number(params.id));
  if (!company) {
    return HttpResponse.json(
      { status: 404, error: "Not Found", message: "사업장을 찾을 수 없습니다", timestamp: new Date().toISOString() },
      { status: 404 },
    );
  }
  const body = (await request.json()) as Record<string, unknown>;
  return HttpResponse.json({ ...company, ...body, updatedAt: new Date().toISOString() });
}),

// Company handlers — relative paths (jsdom tests)
http.get("*/api/companies/:id", ({ params }) => {
  const company = mockCompanies.find((c) => c.id === Number(params.id));
  if (!company) {
    return HttpResponse.json(
      { status: 404, error: "Not Found", message: "사업장을 찾을 수 없습니다", timestamp: new Date().toISOString() },
      { status: 404 },
    );
  }
  return HttpResponse.json(company);
}),
http.get("*/api/companies", () => HttpResponse.json(mockCompanies)),
```

기존 workers GET 핸들러들을 companyId 필터링 지원하도록 수정:

```typescript
// 기존 BACKEND workers handler 수정
http.get(`${BACKEND}/api/workers`, ({ request }) => {
  const url = new URL(request.url);
  const companyId = url.searchParams.get("companyId");
  if (companyId) {
    // 목 데이터에서는 id 기반 간단 필터 (실제 BE는 companyId로 필터)
    return HttpResponse.json(mockWorkers.filter((w) => w.id % 3 === Number(companyId) % 3));
  }
  return HttpResponse.json(mockWorkers);
}),

// 기존 relative path workers handler 수정
http.get("*/api/workers", ({ request }) => {
  const url = new URL(request.url);
  const companyId = url.searchParams.get("companyId");
  if (companyId) {
    return HttpResponse.json(mockWorkers.filter((w) => w.id % 3 === Number(companyId) % 3));
  }
  return HttpResponse.json(mockWorkers);
}),
```

**중요 — 핸들러 등록 순서:**
기존 `handlers` 배열의 최종 순서는 반드시 다음을 지킬 것:
1. `BACKEND workers/:id` (기존 유지)
2. `BACKEND workers` (companyId 필터 추가)
3. `*/api/workers/:id` (기존 유지 — wildcard specific 먼저)
4. `*/api/workers` (companyId 필터 추가)
5. Company handlers (신규)
6. Compliance handlers (기존 유지)
7. Test endpoints (기존 유지)

workers/:id 핸들러가 workers 목록 핸들러보다 반드시 먼저 등록되어야 MSW가 올바르게 매칭한다. 기존 핸들러를 삭제하지 말고 수정만 할 것.

- [ ] **Step 3: MSW 타입 import 확인**

`mocks/handlers.ts` 상단 import에 `CompanyResponse` 타입 추가 (POST 핸들러에서 사용):

```typescript
import type { CompanyResponse } from "@/types/api";
```

- [ ] **Step 4: 기존 테스트 실행 — 깨지지 않았는지 확인**

Run: `npx vitest run`
Expected: ALL PASS (기존 테스트 깨지지 않음)

- [ ] **Step 5: 커밋**

```bash
git add mocks/data.ts mocks/handlers.ts
git commit -m "feat: add Company mock data and MSW handlers"
```

---

## Task 4: Company Route Handlers

**Files:**
- Create: `app/api/companies/route.ts`
- Create: `app/api/companies/[id]/route.ts`
- Modify: `app/api/workers/route.ts`

- [ ] **Step 1: companies/route.ts 생성**

`app/api/companies/route.ts`:
```typescript
import { NextResponse, type NextRequest } from "next/server";
import { apiClient, ApiError } from "@/lib/api-client";
import type { CompanyResponse } from "@/types/api";

export async function GET() {
  try {
    const companies = await apiClient.get<CompanyResponse[]>("/api/companies");
    return NextResponse.json(companies);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    return NextResponse.json({ message: "서버 오류가 발생했습니다" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const company = await apiClient.post<CompanyResponse>("/api/companies", body);
    return NextResponse.json(company, { status: 201 });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    return NextResponse.json({ message: "서버 오류가 발생했습니다" }, { status: 500 });
  }
}
```

- [ ] **Step 2: companies/[id]/route.ts 생성**

`app/api/companies/[id]/route.ts`:
```typescript
import { NextResponse, type NextRequest } from "next/server";
import { apiClient, ApiError } from "@/lib/api-client";
import type { CompanyResponse } from "@/types/api";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const company = await apiClient.get<CompanyResponse>(`/api/companies/${id}`);
    return NextResponse.json(company);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    return NextResponse.json({ message: "서버 오류가 발생했습니다" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const body = await request.json();
    const company = await apiClient.put<CompanyResponse>(`/api/companies/${id}`, body);
    return NextResponse.json(company);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    return NextResponse.json({ message: "서버 오류가 발생했습니다" }, { status: 500 });
  }
}
```

- [ ] **Step 3: workers/route.ts GET에 companyId 전달 추가**

`app/api/workers/route.ts`의 `GET` 함수 수정:

```typescript
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("companyId");
    const path = companyId ? `/api/workers?companyId=${companyId}` : "/api/workers";
    const workers = await apiClient.get<WorkerResponse[]>(path);
    return NextResponse.json(workers);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    return NextResponse.json({ message: "서버 오류가 발생했습니다" }, { status: 500 });
  }
}
```

- [ ] **Step 4: 빌드 확인**

Run: `npx tsc --noEmit`
Expected: 타입 에러 없음

- [ ] **Step 5: 커밋**

```bash
git add app/api/companies/ app/api/workers/route.ts
git commit -m "feat: add Company route handlers, add companyId to workers GET"
```

---

## Task 5: Company React Query 훅

**Files:**
- Create: `lib/queries/use-companies.ts`
- Create: `__tests__/lib/use-companies.test.tsx`

- [ ] **Step 1: use-companies 훅 테스트 작성**

`__tests__/lib/use-companies.test.tsx`:
```typescript
import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { server } from "@/mocks/server";
import { useCompanies, useCompany } from "@/lib/queries/use-companies";
import type { ReactNode } from "react";

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe("useCompanies", () => {
  it("사업장_목록을_반환한다", async () => {
    const { result } = renderHook(() => useCompanies(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeDefined();
    expect(result.current.data!.length).toBeGreaterThan(0);
  });
});

describe("useCompany", () => {
  it("사업장_상세를_반환한다", async () => {
    const { result } = renderHook(() => useCompany(1), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.id).toBe(1);
  });

  it("id가_0이면_쿼리를_비활성화한다", () => {
    const { result } = renderHook(() => useCompany(0), { wrapper: createWrapper() });
    expect(result.current.fetchStatus).toBe("idle");
  });
});
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

Run: `npx vitest run __tests__/lib/use-companies.test.tsx`
Expected: FAIL — 모듈 미존재

- [ ] **Step 3: use-companies.ts 구현**

`lib/queries/use-companies.ts`:
```typescript
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { CompanyResponse, CreateCompanyRequest, UpdateCompanyRequest } from "@/types/api";

export function useCompanies() {
  return useQuery<readonly CompanyResponse[]>({
    queryKey: ["companies"],
    queryFn: async () => {
      const res = await fetch("/api/companies");
      if (!res.ok) throw new Error("사업장 목록을 불러올 수 없습니다");
      return res.json();
    },
  });
}

export function useCompany(id: number) {
  return useQuery<CompanyResponse>({
    queryKey: ["companies", id],
    queryFn: async () => {
      const res = await fetch(`/api/companies/${id}`);
      if (!res.ok) throw new Error("사업장 정보를 불러올 수 없습니다");
      return res.json();
    },
    enabled: id > 0,
  });
}

export function useCreateCompany() {
  const queryClient = useQueryClient();

  return useMutation<CompanyResponse, Error, CreateCompanyRequest>({
    mutationFn: async (data) => {
      const res = await fetch("/api/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        let message = "사업장 등록에 실패했습니다";
        try {
          const body = await res.json();
          if (body.message) message = body.message;
        } catch {
          // non-JSON error
        }
        throw new Error(message);
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
    },
  });
}

export function useUpdateCompany() {
  const queryClient = useQueryClient();

  return useMutation<CompanyResponse, Error, { id: number; data: UpdateCompanyRequest }>({
    mutationFn: async ({ id, data }) => {
      const res = await fetch(`/api/companies/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        let message = "사업장 수정에 실패했습니다";
        try {
          const body = await res.json();
          if (body.message) message = body.message;
        } catch {
          // non-JSON error
        }
        throw new Error(message);
      }
      return res.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      queryClient.invalidateQueries({ queryKey: ["companies", variables.id] });
    },
  });
}
```

- [ ] **Step 4: 테스트 실행 — 통과 확인**

Run: `npx vitest run __tests__/lib/use-companies.test.tsx`
Expected: ALL PASS

- [ ] **Step 5: 커밋**

```bash
git add lib/queries/use-companies.ts __tests__/lib/use-companies.test.tsx
git commit -m "feat: add Company React Query hooks"
```

---

## Task 6: workplaceId → companyId Breaking Change + Worker Form 전환

**Files:**
- Modify: `types/api.ts`
- Modify: `__tests__/types/schemas.test.ts`
- Modify: `components/workers/worker-form.tsx`
- Modify: `__tests__/components/worker-form.test.tsx`

타입 변경과 UI 변경을 한 태스크에서 함께 처리하여 컴파일 에러 구간을 없앤다.

- [ ] **Step 1: types/api.ts의 registerWorkerRequestSchema 수정**

`types/api.ts`에서 `workplaceId` → `companyId`:

```typescript
// 변경 전:
workplaceId: z.number().int().positive("사업장 ID를 입력해주세요"),
// 변경 후:
companyId: z.number().int().positive("사업장을 선택해주세요"),
```

- [ ] **Step 2: 테스트 데이터 수정**

`__tests__/types/schemas.test.ts`에서 모든 `workplaceId` → `companyId`:

```typescript
// 모든 테스트 데이터에서
workplaceId: 1  →  companyId: 1
workplaceId: 2  →  companyId: 2
```

- [ ] **Step 3: worker-form.test.tsx 수정**

import에 추가:
```typescript
import { CompanyProvider } from "@/lib/contexts/company-context";
import { server } from "@/mocks/server";

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

`renderWithProviders` 함수 수정:
```typescript
function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <CompanyProvider>{ui}</CompanyProvider>
    </QueryClientProvider>,
  );
}
```

"사업장 ID" 레이블 → "사업장" 으로 변경:
```typescript
// 변경 전:
expect(screen.getByLabelText("사업장 ID")).toBeDefined();
// 변경 후:
expect(screen.getByLabelText("사업장")).toBeDefined();
```

- [ ] **Step 4: worker-form.tsx — companyId Select 드롭다운 전환**

1. import 추가:
```typescript
import Link from "next/link";
import { useCompanies } from "@/lib/queries/use-companies";
```

2. 컴포넌트 최상단에서 `useCompanies()` 호출 (훅은 반드시 컴포넌트 최상위에서 호출 — render prop 내부 호출 금지):
```typescript
export function WorkerForm() {
  const router = useRouter();
  const { mutate: registerWorker, isPending } = useRegisterWorker();
  const { data: companies = [] } = useCompanies();
  // ... rest of component
```

3. defaultValues에서 `workplaceId` → `companyId`:
```typescript
// 변경 전:
workplaceId: undefined,
// 변경 후:
companyId: undefined,
```

4. JSX에서 사업장 ID Input을 Company Select로 교체:
```tsx
{/* 사업장 */}
<div className="flex flex-col gap-1.5">
  <Label htmlFor="companyId">사업장</Label>
  {companies.length === 0 ? (
    <p className="text-sm text-muted-foreground">
      등록된 사업장이 없습니다.{" "}
      <Link href="/companies/new" className="text-primary hover:underline">
        사업장을 먼저 등록해주세요
      </Link>
    </p>
  ) : (
    <Controller
      name="companyId"
      control={control}
      render={({ field }) => (
        <Select
          value={field.value != null ? String(field.value) : undefined}
          onValueChange={(val) => field.onChange(Number(val))}
        >
          <SelectTrigger id="companyId" aria-label="사업장" aria-invalid={!!errors.companyId} className="w-full">
            <SelectValue placeholder="사업장 선택" />
          </SelectTrigger>
          <SelectContent>
            {companies.map((c) => (
              <SelectItem key={c.id} value={String(c.id)}>
                {c.name} ({c.businessNumber})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    />
  )}
  {errors.companyId && <p className="text-sm text-destructive">{errors.companyId.message}</p>}
</div>
```

- [ ] **Step 5: 스키마 + worker-form 테스트 실행**

Run: `npx vitest run __tests__/types/schemas.test.ts __tests__/components/worker-form.test.tsx`
Expected: ALL PASS

- [ ] **Step 6: 타입 체크 — 컴파일 에러 없음 확인**

Run: `npx tsc --noEmit`
Expected: 에러 없음

- [ ] **Step 7: 커밋**

```bash
git add types/api.ts __tests__/types/schemas.test.ts components/workers/worker-form.tsx __tests__/components/worker-form.test.tsx
git commit -m "feat!: rename workplaceId to companyId, convert worker form to company dropdown

BREAKING CHANGE: workplaceId field renamed to companyId in RegisterWorkerRequest"
```

---

## Task 7: useWorkers companyId 파라미터 추가

**Files:**
- Modify: `lib/queries/use-workers.ts`
- Modify: `__tests__/lib/use-paginated-workers.test.tsx`

- [ ] **Step 1: use-workers.ts의 useWorkers 시그니처 변경**

```typescript
export function useWorkers(companyId?: number | null) {
  return useQuery<readonly WorkerResponse[]>({
    queryKey: ["workers", { companyId }],
    queryFn: async () => {
      const params = companyId ? `?companyId=${companyId}` : "";
      const res = await fetch(`/api/workers${params}`);
      if (!res.ok) throw new Error("근로자 목록을 불러올 수 없습니다");
      return res.json();
    },
    enabled: companyId != null && companyId > 0,
  });
}
```

- [ ] **Step 2: usePaginatedWorkers에 companyId 추가**

```typescript
export function usePaginatedWorkers(
  companyId: number | null | undefined,
  params: WorkerFilterParams,
): {
  workers: PaginatedResult<WorkerResponse> | undefined;
  isLoading: boolean;
  isError: boolean;
} {
  const query = useWorkers(companyId);

  const workers = query.data
    ? paginateItems(filterWorkers(query.data, params), params.page)
    : undefined;

  return { workers, isLoading: query.isLoading, isError: query.isError };
}
```

- [ ] **Step 2.5: 테스트 실행 — RED 확인**

Run: `npx vitest run __tests__/lib/use-paginated-workers.test.tsx`
Expected: FAIL — `usePaginatedWorkers` 시그니처 변경으로 6개 테스트 모두 인자 불일치

- [ ] **Step 3: usePaginatedWorkers 테스트 수정**

`__tests__/lib/use-paginated-workers.test.tsx`의 6개 호출을 모두 수정. 첫 번째 인자에 `1` (mockCompany ID)을 추가:

```typescript
// 변경 전 (6곳 모두):
usePaginatedWorkers({
  page: 1,
  search: "",
  visaType: "ALL",
  status: "ALL",
  insuranceStatus: "ALL",
})

// 변경 후:
usePaginatedWorkers(1, {
  page: 1,
  search: "",
  visaType: "ALL",
  status: "ALL",
  insuranceStatus: "ALL",
})
```

총 6개 테스트(`첫_페이지_20건`, `이름으로_검색`, `국적_레이블`, `비자_유형`, `상태`, `보험_상태`)의 `usePaginatedWorkers(` 호출에 첫 인자 `1,`을 추가.

- [ ] **Step 4: 테스트 실행**

Run: `npx vitest run __tests__/lib/use-paginated-workers.test.tsx`
Expected: ALL PASS

- [ ] **Step 5: 커밋**

```bash
git add lib/queries/use-workers.ts __tests__/lib/use-paginated-workers.test.tsx
git commit -m "feat: add companyId parameter to useWorkers and usePaginatedWorkers"
```

---

## Task 8: CompanyContext (글로벌 사업장 선택)

**Files:**
- Create: `lib/contexts/company-context.tsx`
- Modify: `app/(app)/layout.tsx`

- [ ] **Step 1: company-context.tsx 구현**

`lib/contexts/company-context.tsx`:
```typescript
"use client";

import { createContext, useContext, useState, useEffect, useMemo, type ReactNode } from "react";
import { useCompanies } from "@/lib/queries/use-companies";
import type { CompanyResponse } from "@/types/api";

const STORAGE_KEY = "fwc-selected-company-id";

interface CompanyContextValue {
  readonly selectedCompanyId: number | null;
  readonly selectedCompany: CompanyResponse | null;
  readonly companies: readonly CompanyResponse[];
  readonly isLoading: boolean;
  readonly setSelectedCompanyId: (id: number) => void;
}

const CompanyContext = createContext<CompanyContextValue | null>(null);

export function CompanyProvider({ children }: { readonly children: ReactNode }) {
  const { data: companies = [], isLoading } = useCompanies();
  const [selectedCompanyId, setSelectedCompanyIdState] = useState<number | null>(null);
  const [initialized, setInitialized] = useState(false);

  // localStorage에서 복원 (useEffect로 hydration 불일치 방지)
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = Number(stored);
      if (!Number.isNaN(parsed) && parsed > 0) {
        setSelectedCompanyIdState(parsed);
      }
    }
    setInitialized(true);
  }, []);

  // 회사 목록 로드 후 선택된 ID가 없으면 첫 번째 회사 자동 선택
  useEffect(() => {
    if (!initialized || companies.length === 0) return;
    if (selectedCompanyId !== null) {
      // 선택된 ID가 목록에 존재하는지 확인
      const exists = companies.some((c) => c.id === selectedCompanyId);
      if (exists) return;
    }
    // 첫 번째 회사 자동 선택
    setSelectedCompanyIdState(companies[0].id);
    localStorage.setItem(STORAGE_KEY, String(companies[0].id));
  }, [initialized, companies, selectedCompanyId]);

  const setSelectedCompanyId = (id: number) => {
    setSelectedCompanyIdState(id);
    localStorage.setItem(STORAGE_KEY, String(id));
  };

  const selectedCompany = useMemo(
    () => companies.find((c) => c.id === selectedCompanyId) ?? null,
    [companies, selectedCompanyId],
  );

  const value = useMemo<CompanyContextValue>(
    () => ({ selectedCompanyId, selectedCompany, companies, isLoading, setSelectedCompanyId }),
    [selectedCompanyId, selectedCompany, companies, isLoading],
  );

  return <CompanyContext.Provider value={value}>{children}</CompanyContext.Provider>;
}

export function useCompanyContext() {
  const ctx = useContext(CompanyContext);
  if (!ctx) throw new Error("useCompanyContext must be used within CompanyProvider");
  return ctx;
}
```

- [ ] **Step 2: layout.tsx에 CompanyProvider 추가**

`app/(app)/layout.tsx` 수정:

```typescript
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { CompanyProvider } from "@/lib/contexts/company-context";

export default function AppLayout({ children }: { readonly children: React.ReactNode }) {
  return (
    <CompanyProvider>
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </CompanyProvider>
  );
}
```

주의: `CompanyProvider`는 `"use client"` 컴포넌트. App Router에서 Server Component layout 내에 Client Component를 직접 import하면 해당 layout도 Client Component로 전환됨. 이 파일은 이미 순수 JSX이므로 Client boundary 전환이 무해.

- [ ] **Step 3: 빌드 확인**

Run: `npx tsc --noEmit` (worker-form.tsx 에러는 아직 예상됨 — Task 12에서 수정)
Expected: company-context 관련 새로운 에러 없음

- [ ] **Step 4: 커밋**

```bash
git add lib/contexts/company-context.tsx app/\(app\)/layout.tsx
git commit -m "feat: add CompanyProvider for global company selection"
```

---

## Task 9: 사이드바 + 헤더 CompanySelector

**Files:**
- Modify: `components/layout/sidebar.tsx`
- Create: `components/companies/company-selector.tsx`
- Modify: `components/layout/header.tsx`
- Create: `__tests__/components/company-selector.test.tsx`

- [ ] **Step 1: company-selector 테스트 작성**

`__tests__/components/company-selector.test.tsx`:
```typescript
import { describe, it, expect, vi, beforeAll, afterAll, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { CompanySelector } from "@/components/companies/company-selector";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CompanyProvider } from "@/lib/contexts/company-context";
import { server } from "@/mocks/server";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), back: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => "/",
}));

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <CompanyProvider>{ui}</CompanyProvider>
    </QueryClientProvider>,
  );
}

describe("CompanySelector", () => {
  it("사업장_선택_드롭다운을_렌더링한다", async () => {
    renderWithProviders(<CompanySelector />);
    expect(await screen.findByRole("combobox", { name: "사업장 선택" })).toBeDefined();
  });
});
```

- [ ] **Step 2: company-selector.tsx 구현**

`components/companies/company-selector.tsx`:
```typescript
"use client";

import { useCompanyContext } from "@/lib/contexts/company-context";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";

export function CompanySelector() {
  const { companies, selectedCompanyId, setSelectedCompanyId, isLoading } = useCompanyContext();

  if (isLoading) {
    return <div className="h-9 w-48 animate-pulse rounded-md bg-muted" />;
  }

  if (companies.length === 0) {
    return (
      <Link
        href="/companies/new"
        className="text-sm text-primary hover:underline"
      >
        사업장을 등록해주세요
      </Link>
    );
  }

  return (
    <Select
      value={selectedCompanyId != null ? String(selectedCompanyId) : undefined}
      onValueChange={(value) => setSelectedCompanyId(Number(value))}
    >
      <SelectTrigger className="w-52" aria-label="사업장 선택">
        <SelectValue placeholder="사업장 선택" />
      </SelectTrigger>
      <SelectContent>
        {companies.map((company) => (
          <SelectItem key={company.id} value={String(company.id)}>
            {company.name} ({company.businessNumber})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
```

- [ ] **Step 3: sidebar.tsx에 사업장 메뉴 추가**

`components/layout/sidebar.tsx`에서 NAV_ITEMS 수정:

```typescript
import { LayoutDashboard, Users, AlertTriangle, Building2 } from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "대시보드", icon: LayoutDashboard },
  { href: "/companies", label: "사업장 관리", icon: Building2 },
  { href: "/workers", label: "근로자 관리", icon: Users },
  { href: "/compliance", label: "컴플라이언스", icon: AlertTriangle },
] as const;
```

- [ ] **Step 4: header.tsx에 CompanySelector + NAV_ITEMS 동기화**

`components/layout/header.tsx` 수정:

import에 `Building2` 추가, NAV_ITEMS에 사업장 추가:

```typescript
import { Menu, LayoutDashboard, Users, AlertTriangle, Building2 } from "lucide-react";
import { CompanySelector } from "@/components/companies/company-selector";

const NAV_ITEMS = [
  { href: "/", label: "대시보드", icon: LayoutDashboard },
  { href: "/companies", label: "사업장 관리", icon: Building2 },
  { href: "/workers", label: "근로자 관리", icon: Users },
  { href: "/compliance", label: "컴플라이언스", icon: AlertTriangle },
] as const;
```

헤더의 `<span className="ml-2 text-lg font-bold md:ml-0">FWC</span>` 뒤에 CompanySelector 추가:

```tsx
<span className="ml-2 text-lg font-bold md:ml-0">FWC</span>
<div className="ml-4 hidden md:block">
  <CompanySelector />
</div>
```

- [ ] **Step 5: 테스트 실행**

Run: `npx vitest run __tests__/components/company-selector.test.tsx`
Expected: PASS

- [ ] **Step 6: 커밋**

```bash
git add components/companies/company-selector.tsx components/layout/sidebar.tsx components/layout/header.tsx __tests__/components/company-selector.test.tsx
git commit -m "feat: add company selector to header, add company nav to sidebar"
```

---

## Task 10: CompanyForm 컴포넌트

**Files:**
- Create: `components/companies/company-form.tsx`
- Create: `__tests__/components/company-form.test.tsx`

- [ ] **Step 1: CompanyForm 테스트 작성**

`__tests__/components/company-form.test.tsx`:
```typescript
import { describe, it, expect, vi, beforeAll, afterAll, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CompanyForm } from "@/components/companies/company-form";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { server } from "@/mocks/server";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), back: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
  usePathname: () => "/companies/new",
}));

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe("CompanyForm", () => {
  it("등록_모드에서_필수_필드를_렌더링한다", () => {
    renderWithProviders(<CompanyForm mode="create" />);

    expect(screen.getByLabelText("회사명")).toBeDefined();
    expect(screen.getByLabelText("사업자번호")).toBeDefined();
    expect(screen.getByLabelText("지역")).toBeDefined();
    expect(screen.getByLabelText("업종")).toBeDefined();
    expect(screen.getByLabelText("총 직원 수")).toBeDefined();
    expect(screen.getByLabelText("외국인 근로자 수")).toBeDefined();
    expect(screen.getByLabelText("주소")).toBeDefined();
    expect(screen.getByLabelText("연락처")).toBeDefined();
  });

  it("필수_필드가_비어있으면_에러를_표시한다", async () => {
    const user = userEvent.setup();
    renderWithProviders(<CompanyForm mode="create" />);

    await user.click(screen.getByRole("button", { name: "등록" }));
    expect(await screen.findByText("회사명을 입력해주세요")).toBeDefined();
  });

  it("수정_모드에서_사업자번호가_비활성화된다", () => {
    renderWithProviders(
      <CompanyForm
        mode="edit"
        defaultValues={{
          name: "테스트",
          region: "SEOUL",
          industryCategory: "MANUFACTURING",
          employeeCount: 10,
          foreignWorkerCount: 5,
          address: "서울",
          contactPhone: "02-1234",
        }}
        businessNumber="123-45-67890"
      />,
    );

    const bizInput = screen.getByLabelText("사업자번호");
    expect(bizInput).toHaveProperty("disabled", true);
  });
});
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

Run: `npx vitest run __tests__/components/company-form.test.tsx`
Expected: FAIL

- [ ] **Step 3: CompanyForm 구현**

`components/companies/company-form.tsx`:
```typescript
"use client";

import { useForm, Controller } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  createCompanyRequestSchema,
  updateCompanyRequestSchema,
  REGIONS,
  REGION_LABELS,
  INDUSTRY_CATEGORIES,
  INDUSTRY_CATEGORY_LABELS,
} from "@/types/api";
import type { CreateCompanyRequest, UpdateCompanyRequest } from "@/types/api";
import { useCreateCompany, useUpdateCompany } from "@/lib/queries/use-companies";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CompanyFormCreateProps {
  readonly mode: "create";
  readonly defaultValues?: undefined;
  readonly businessNumber?: undefined;
  readonly companyId?: undefined;
}

interface CompanyFormEditProps {
  readonly mode: "edit";
  readonly defaultValues: UpdateCompanyRequest;
  readonly businessNumber: string;
  readonly companyId: number;
}

type CompanyFormProps = CompanyFormCreateProps | CompanyFormEditProps;

export function CompanyForm({ mode, defaultValues, businessNumber, companyId }: CompanyFormProps) {
  const router = useRouter();
  const createMutation = useCreateCompany();
  const updateMutation = useUpdateCompany();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const schema = mode === "create" ? createCompanyRequestSchema : updateCompanyRequestSchema;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CreateCompanyRequest | UpdateCompanyRequest>({
    resolver: standardSchemaResolver(schema),
    defaultValues: mode === "edit"
      ? defaultValues
      : {
          name: "",
          businessNumber: "",
          region: undefined,
          subRegion: "",
          industryCategory: undefined,
          industrySubCategory: "",
          employeeCount: undefined,
          foreignWorkerCount: undefined,
          address: "",
          contactPhone: "",
        },
  });

  const onSubmit = (data: CreateCompanyRequest | UpdateCompanyRequest) => {
    if (mode === "create") {
      createMutation.mutate(data as CreateCompanyRequest, {
        onSuccess: (company) => {
          toast.success("사업장이 등록되었습니다");
          router.push(`/companies/${company.id}`);
        },
      });
    } else {
      updateMutation.mutate(
        { id: companyId, data: data as UpdateCompanyRequest },
        {
          onSuccess: () => {
            toast.success("사업장이 수정되었습니다");
            router.push(`/companies/${companyId}`);
          },
        },
      );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{mode === "create" ? "사업장 등록" : "사업장 수정"}</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* 회사명 */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">회사명</Label>
            <Input id="name" {...register("name")} aria-invalid={!!errors.name} placeholder="주식회사 OO" />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          {/* 사업자번호 */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="businessNumber">사업자번호</Label>
            {mode === "create" ? (
              <Input
                id="businessNumber"
                {...register("businessNumber" as "name")}
                aria-invalid={!!(errors as Record<string, unknown>).businessNumber}
                placeholder="xxx-xx-xxxxx"
              />
            ) : (
              <Input id="businessNumber" value={businessNumber} disabled />
            )}
            {(errors as Record<string, { message?: string }>).businessNumber && (
              <p className="text-sm text-destructive">
                {(errors as Record<string, { message?: string }>).businessNumber?.message}
              </p>
            )}
          </div>

          {/* 지역 */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="region">지역</Label>
            <Controller
              name="region"
              control={control}
              render={({ field }) => (
                <Select value={field.value ?? ""} onValueChange={field.onChange}>
                  <SelectTrigger id="region" aria-label="지역" aria-invalid={!!errors.region} className="w-full">
                    <SelectValue placeholder="지역 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {REGIONS.map((r) => (
                      <SelectItem key={r} value={r}>{REGION_LABELS[r]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.region && <p className="text-sm text-destructive">{errors.region.message}</p>}
          </div>

          {/* 세부 지역 */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="subRegion">세부 지역 (선택)</Label>
            <Input id="subRegion" {...register("subRegion")} placeholder="강남구" />
          </div>

          {/* 업종 */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="industryCategory">업종</Label>
            <Controller
              name="industryCategory"
              control={control}
              render={({ field }) => (
                <Select value={field.value ?? ""} onValueChange={field.onChange}>
                  <SelectTrigger id="industryCategory" aria-label="업종" aria-invalid={!!errors.industryCategory} className="w-full">
                    <SelectValue placeholder="업종 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDUSTRY_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>{INDUSTRY_CATEGORY_LABELS[cat]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.industryCategory && <p className="text-sm text-destructive">{errors.industryCategory.message}</p>}
          </div>

          {/* 세부 업종 */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="industrySubCategory">세부 업종 (선택)</Label>
            <Input id="industrySubCategory" {...register("industrySubCategory")} placeholder="전자부품" />
          </div>

          {/* 총 직원 수 */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="employeeCount">총 직원 수</Label>
            <Input
              id="employeeCount"
              type="number"
              {...register("employeeCount", { valueAsNumber: true })}
              aria-invalid={!!errors.employeeCount}
              placeholder="50"
            />
            {errors.employeeCount && <p className="text-sm text-destructive">{errors.employeeCount.message}</p>}
          </div>

          {/* 외국인 근로자 수 */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="foreignWorkerCount">외국인 근로자 수</Label>
            <Input
              id="foreignWorkerCount"
              type="number"
              {...register("foreignWorkerCount", { valueAsNumber: true })}
              aria-invalid={!!errors.foreignWorkerCount}
              placeholder="10"
            />
            {errors.foreignWorkerCount && <p className="text-sm text-destructive">{errors.foreignWorkerCount.message}</p>}
          </div>

          {/* 주소 */}
          <div className="flex flex-col gap-1.5 md:col-span-2">
            <Label htmlFor="address">주소</Label>
            <Input id="address" {...register("address")} aria-invalid={!!errors.address} placeholder="서울시 강남구 테헤란로 123" />
            {errors.address && <p className="text-sm text-destructive">{errors.address.message}</p>}
          </div>

          {/* 연락처 */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="contactPhone">연락처</Label>
            <Input
              id="contactPhone"
              type="tel"
              {...register("contactPhone")}
              aria-invalid={!!errors.contactPhone}
              placeholder="02-1234-5678"
            />
            {errors.contactPhone && <p className="text-sm text-destructive">{errors.contactPhone.message}</p>}
          </div>
        </CardContent>

        <CardFooter className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            취소
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? (mode === "create" ? "등록 중..." : "수정 중...") : mode === "create" ? "등록" : "수정"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
```

- [ ] **Step 4: 테스트 실행 — 통과 확인**

Run: `npx vitest run __tests__/components/company-form.test.tsx`
Expected: ALL PASS

- [ ] **Step 5: 커밋**

```bash
git add components/companies/company-form.tsx __tests__/components/company-form.test.tsx
git commit -m "feat: add CompanyForm component with create/edit modes"
```

---

## Task 11: CompanyTable + CompanyDetailCard 컴포넌트

**Files:**
- Create: `components/companies/company-table.tsx`
- Create: `components/companies/company-detail-card.tsx`
- Create: `__tests__/components/company-table.test.tsx`

- [ ] **Step 1: CompanyTable 테스트 작성**

`__tests__/components/company-table.test.tsx`:
```typescript
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { CompanyTable } from "@/components/companies/company-table";
import { mockCompanies } from "@/mocks/data";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/companies",
}));

describe("CompanyTable", () => {
  it("사업장_목록을_테이블로_렌더링한다", () => {
    render(<CompanyTable companies={mockCompanies} isLoading={false} />);
    expect(screen.getByText("한국전자 주식회사")).toBeDefined();
    expect(screen.getByText("부산건설 주식회사")).toBeDefined();
  });

  it("로딩_중이면_스켈레톤을_표시한다", () => {
    render(<CompanyTable companies={[]} isLoading={true} />);
    // Skeleton elements should be present
    expect(screen.queryByText("한국전자 주식회사")).toBeNull();
  });

  it("빈_상태에서_CTA를_표시한다", () => {
    render(<CompanyTable companies={[]} isLoading={false} />);
    expect(screen.getByText(/첫 사업장을 등록/)).toBeDefined();
  });
});
```

- [ ] **Step 2: 테스트 실행 — 실패 확인**

Run: `npx vitest run __tests__/components/company-table.test.tsx`
Expected: FAIL

- [ ] **Step 3: CompanyTable 구현**

`components/companies/company-table.tsx`:

```typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  REGIONS,
  REGION_LABELS,
  INDUSTRY_CATEGORIES,
  INDUSTRY_CATEGORY_LABELS,
} from "@/types/api";
import type { CompanyResponse, Region, IndustryCategory } from "@/types/api";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { paginateItems } from "@/lib/pagination";
import { PaginationControls } from "@/components/ui/pagination-controls";

interface CompanyTableProps {
  readonly companies: readonly CompanyResponse[];
  readonly isLoading: boolean;
}

export function CompanyTable({ companies, isLoading }: CompanyTableProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [regionFilter, setRegionFilter] = useState<Region | "ALL">("ALL");
  const [industryFilter, setIndustryFilter] = useState<IndustryCategory | "ALL">("ALL");
  const [page, setPage] = useState(1);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const filtered = companies.filter((c) => {
    if (search.trim() !== "") {
      const s = search.toLowerCase();
      if (!c.name.toLowerCase().includes(s) && !c.businessNumber.includes(s)) return false;
    }
    if (regionFilter !== "ALL" && c.region !== regionFilter) return false;
    if (industryFilter !== "ALL" && c.industryCategory !== industryFilter) return false;
    return true;
  });

  const paginated = paginateItems(filtered, page);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap">
        <Input
          type="text"
          placeholder="회사명 또는 사업자번호로 검색..."
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="sm:max-w-xs"
        />
        <Select value={regionFilter} onValueChange={(v) => { setRegionFilter(v as Region | "ALL"); setPage(1); }}>
          <SelectTrigger className="w-40" aria-label="지역 필터">
            <SelectValue placeholder="지역 전체" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">전체</SelectItem>
            {REGIONS.map((r) => (
              <SelectItem key={r} value={r}>{REGION_LABELS[r]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={industryFilter} onValueChange={(v) => { setIndustryFilter(v as IndustryCategory | "ALL"); setPage(1); }}>
          <SelectTrigger className="w-40" aria-label="업종 필터">
            <SelectValue placeholder="업종 전체" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">전체</SelectItem>
            {INDUSTRY_CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>{INDUSTRY_CATEGORY_LABELS[cat]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {companies.length === 0 ? (
        <div className="flex h-40 flex-col items-center justify-center gap-3 rounded-lg border border-dashed text-sm text-muted-foreground">
          <p>등록된 사업장이 없습니다</p>
          <Link href="/companies/new">
            <Button variant="outline" size="sm">첫 사업장을 등록해보세요</Button>
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex h-40 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
          조건에 맞는 사업장이 없습니다
        </div>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>회사명</TableHead>
                <TableHead>사업자번호</TableHead>
                <TableHead>지역</TableHead>
                <TableHead>업종</TableHead>
                <TableHead>총 직원</TableHead>
                <TableHead>외국인 근로자</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.items.map((c) => (
                <TableRow
                  key={c.id}
                  className="cursor-pointer"
                  onClick={() => router.push(`/companies/${c.id}`)}
                >
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="font-mono text-xs">{c.businessNumber}</TableCell>
                  <TableCell>{c.regionName}</TableCell>
                  <TableCell>{c.industryCategoryName}</TableCell>
                  <TableCell>{c.employeeCount}명</TableCell>
                  <TableCell>{c.foreignWorkerCount}명</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <PaginationControls
            currentPage={paginated.currentPage}
            totalPages={paginated.totalPages}
            totalItems={paginated.totalItems}
            pageSize={paginated.pageSize}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 4: CompanyDetailCard 구현**

`components/companies/company-detail-card.tsx`:

```typescript
import type { CompanyResponse } from "@/types/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CompanyDetailCardProps {
  readonly company: CompanyResponse;
}

export function CompanyDetailCard({ company }: CompanyDetailCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">사업장 정보</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="grid gap-4 md:grid-cols-2">
          <div>
            <dt className="text-sm text-muted-foreground">사업자번호</dt>
            <dd className="font-medium font-mono">{company.businessNumber}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">지역</dt>
            <dd className="font-medium">{company.regionName}{company.subRegion ? ` ${company.subRegion}` : ""}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">업종</dt>
            <dd className="font-medium">{company.industryCategoryName}{company.industrySubCategory ? ` (${company.industrySubCategory})` : ""}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">총 직원 수</dt>
            <dd className="font-medium">{company.employeeCount}명</dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">외국인 근로자 수</dt>
            <dd className="font-medium">{company.foreignWorkerCount}명</dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">주소</dt>
            <dd className="font-medium">{company.address}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">연락처</dt>
            <dd className="font-medium">{company.contactPhone}</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 5: 테스트 실행 — 통과 확인**

Run: `npx vitest run __tests__/components/company-table.test.tsx`
Expected: ALL PASS

- [ ] **Step 6: 커밋**

```bash
git add components/companies/company-table.tsx components/companies/company-detail-card.tsx __tests__/components/company-table.test.tsx
git commit -m "feat: add CompanyTable and CompanyDetailCard components"
```

---

## ~~Task 12: Worker Form — Task 6에 통합됨~~

Worker Form의 companyId Select 전환은 Task 6에서 타입 변경과 함께 처리되었다. 컴파일 에러 구간을 없애기 위함.

---

## Task 13: Company 페이지 (목록/등록/상세/수정)

**Files:**
- Create: `app/(app)/companies/page.tsx`
- Create: `app/(app)/companies/new/page.tsx`
- Create: `app/(app)/companies/[id]/page.tsx`
- Create: `app/(app)/companies/[id]/edit/page.tsx`

- [ ] **Step 1: 목록 페이지**

`app/(app)/companies/page.tsx`:
```typescript
"use client";

import Link from "next/link";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CompanyTable } from "@/components/companies/company-table";
import { useCompanies } from "@/lib/queries/use-companies";

export default function CompaniesPage() {
  const { data: companies = [], isLoading, isError } = useCompanies();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">사업장 목록</h1>
        <Link href="/companies/new">
          <Button>
            <PlusIcon />
            사업장 등록
          </Button>
        </Link>
      </div>

      {isError ? (
        <div className="flex h-40 items-center justify-center rounded-lg border border-dashed text-sm text-destructive">
          사업장 목록을 불러오는 중 오류가 발생했습니다. 페이지를 새로고침해 주세요.
        </div>
      ) : (
        <CompanyTable companies={companies} isLoading={isLoading} />
      )}
    </div>
  );
}
```

- [ ] **Step 2: 등록 페이지**

`app/(app)/companies/new/page.tsx`:
```typescript
import { CompanyForm } from "@/components/companies/company-form";

export default function NewCompanyPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">사업장 등록</h1>
      <CompanyForm mode="create" />
    </div>
  );
}
```

- [ ] **Step 3: 상세 페이지**

`app/(app)/companies/[id]/page.tsx`:
```typescript
"use client";

import { use } from "react";
import Link from "next/link";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CompanyDetailCard } from "@/components/companies/company-detail-card";
import { WorkerTable } from "@/components/workers/worker-table";
import { useCompany } from "@/lib/queries/use-companies";
import { useWorkers } from "@/lib/queries/use-workers";

export default function CompanyDetailPage({ params }: { readonly params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const companyId = Number(id);
  const company = useCompany(companyId);
  const workers = useWorkers(companyId);

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
        <p className="text-destructive">사업장을 찾을 수 없습니다</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{company.data.name}</h1>
        <div className="flex gap-2">
          <Link href={`/companies/${companyId}/edit`}>
            <Button variant="outline">
              <Pencil className="h-4 w-4" />
              수정
            </Button>
          </Link>
          <Link href="/workers/new">
            <Button>근로자 등록</Button>
          </Link>
        </div>
      </div>

      <CompanyDetailCard company={company.data} />

      {/* WorkerTable은 내부에 검색/필터/페이지네이션을 포함.
          이미 companyId로 필터된 목록이 전달되므로 해당 사업장 소속 근로자만 표시됨. */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">소속 근로자</h2>
        {workers.isError ? (
          <div className="flex h-40 items-center justify-center rounded-lg border border-dashed text-sm text-destructive">
            근로자 목록을 불러오는 중 오류가 발생했습니다.
          </div>
        ) : (
          <WorkerTable workers={[...(workers.data ?? [])]} isLoading={workers.isLoading} />
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: 수정 페이지**

`app/(app)/companies/[id]/edit/page.tsx`:
```typescript
"use client";

import { use } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { CompanyForm } from "@/components/companies/company-form";
import { useCompany } from "@/lib/queries/use-companies";

export default function EditCompanyPage({ params }: { readonly params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const companyId = Number(id);
  const { data: company, isLoading, error } = useCompany(companyId);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="py-12 text-center">
        <p className="text-destructive">사업장을 찾을 수 없습니다</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">사업장 수정</h1>
      <CompanyForm
        mode="edit"
        companyId={companyId}
        businessNumber={company.businessNumber}
        defaultValues={{
          name: company.name,
          region: company.region,
          subRegion: company.subRegion ?? undefined,
          industryCategory: company.industryCategory,
          industrySubCategory: company.industrySubCategory ?? undefined,
          employeeCount: company.employeeCount,
          foreignWorkerCount: company.foreignWorkerCount,
          address: company.address,
          contactPhone: company.contactPhone,
        }}
      />
    </div>
  );
}
```

- [ ] **Step 5: 빌드 확인**

Run: `npx tsc --noEmit`
Expected: 에러 없음

- [ ] **Step 6: 커밋**

```bash
git add app/\(app\)/companies/
git commit -m "feat: add Company CRUD pages (list, create, detail, edit)"
```

---

## Task 14: Workers 페이지 CompanyContext 연동

**Files:**
- Modify: `app/(app)/workers/page.tsx`

- [ ] **Step 1: workers/page.tsx에 companyId 전달**

```typescript
"use client";

import Link from "next/link";
import { PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WorkerTable } from "@/components/workers/worker-table";
import { useWorkers } from "@/lib/queries/use-workers";
import { useCompanyContext } from "@/lib/contexts/company-context";

export default function WorkersPage() {
  const { selectedCompanyId } = useCompanyContext();
  const { data: workers = [], isLoading, isError } = useWorkers(selectedCompanyId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">근로자 목록</h1>
        <Link href="/workers/new">
          <Button>
            <PlusIcon />
            신규 등록
          </Button>
        </Link>
      </div>

      {selectedCompanyId == null ? (
        <div className="flex h-40 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
          사업장을 선택해주세요
        </div>
      ) : isError ? (
        <div className="flex h-40 items-center justify-center rounded-lg border border-dashed text-sm text-destructive">
          근로자 목록을 불러오는 중 오류가 발생했습니다. 페이지를 새로고침해 주세요.
        </div>
      ) : (
        <WorkerTable workers={workers} isLoading={isLoading} />
      )}
    </div>
  );
}
```

- [ ] **Step 2: 빌드 확인**

Run: `npx tsc --noEmit`
Expected: 에러 없음

- [ ] **Step 3: 커밋**

```bash
git add app/\(app\)/workers/page.tsx
git commit -m "feat: integrate workers page with CompanyContext"
```

---

## Task 15: 전체 테스트 + 빌드 검증

- [ ] **Step 1: 전체 테스트 실행**

Run: `npx vitest run`
Expected: ALL PASS

- [ ] **Step 2: 빌드 확인**

Run: `npm run build`
Expected: 빌드 성공

- [ ] **Step 3: lint 확인**

Run: `npm run lint`
Expected: 에러 없음

- [ ] **Step 4: 최종 커밋 (필요 시)**

lint/build 수정이 필요하면 수정 후 커밋:
```bash
git commit -m "fix: resolve lint and build issues"
```
