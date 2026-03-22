# Stage 1-1: Company CRUD + Worker Breaking Change — FE 설계

> BE 전달 기반 FE 변경. 시뮬레이터·컴플라이언스 API는 별도 전달 예정.

## 1. 타입 & Enum

### 1.1 새 Enum (types/api.ts)

```typescript
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

### 1.2 Company DTO

```typescript
// Zod 스키마
export const createCompanyRequestSchema = z.object({
  name: z.string().min(1),
  businessNumber: z.string().regex(/^\d{3}-\d{2}-\d{5}$/),
  region: z.enum(REGIONS),
  subRegion: z.string().optional(),
  industryCategory: z.enum(INDUSTRY_CATEGORIES),
  industrySubCategory: z.string().optional(),
  employeeCount: z.number().int().min(1),
  foreignWorkerCount: z.number().int().min(0),
  address: z.string().min(1),
  contactPhone: z.string().min(1),
}).refine(d => d.foreignWorkerCount <= d.employeeCount, {
  message: "외국인 근로자 수는 총 직원 수를 초과할 수 없습니다",
  path: ["foreignWorkerCount"],
});

export const updateCompanyRequestSchema = z.object({
  name: z.string().min(1),
  region: z.enum(REGIONS),
  subRegion: z.string().optional(),
  industryCategory: z.enum(INDUSTRY_CATEGORIES),
  industrySubCategory: z.string().optional(),
  employeeCount: z.number().int().min(1),
  foreignWorkerCount: z.number().int().min(0),
  address: z.string().min(1),
  contactPhone: z.string().min(1),
}).refine(d => d.foreignWorkerCount <= d.employeeCount, {
  message: "외국인 근로자 수는 총 직원 수를 초과할 수 없습니다",
  path: ["foreignWorkerCount"],
});

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

### 1.3 Breaking Change: workplaceId → companyId

`registerWorkerRequestSchema`에서 `workplaceId` → `companyId`로 필드명 변경.

영향 파일:
- `types/api.ts`
- `components/workers/worker-form.tsx`
- `__tests__/types/schemas.test.ts`

## 2. API 레이어

### 2.1 api-client.ts

`put` 메서드 추가:
```typescript
async function put<T>(path: string, body: unknown): Promise<T> { ... }
export const apiClient = { get, post, put } as const;
```

### 2.2 Route Handlers

| 파일 | 메서드 | 프록시 대상 |
|------|--------|------------|
| `app/api/companies/route.ts` | GET, POST | `{BACKEND_URL}/api/companies` |
| `app/api/companies/[id]/route.ts` | GET, PUT | `{BACKEND_URL}/api/companies/{id}` |

에러 처리: 기존 workers Route Handler 패턴과 동일 (ApiError catch → status 전달).

### 2.3 React Query 훅 (lib/queries/use-companies.ts)

```typescript
useCompanies()           // GET /api/companies
useCompany(id)           // GET /api/companies/{id}
useCreateCompany()       // POST /api/companies (mutation)
useUpdateCompany()       // PUT /api/companies/{id} (mutation)
```

Invalidation:
- 등록 성공 → `["companies"]` 무효화
- 수정 성공 → `["companies"]` + `["companies", id]` 무효화

### 2.4 MSW 목 데이터

- `mocks/data.ts`: `mockCompanies: CompanyResponse[]` 3~5건 추가
- `mocks/handlers.ts`: Company CRUD 핸들러 (BACKEND + relative path 이중 등록)

## 3. 글로벌 사업장 선택 (Company Context)

### 3.1 CompanyProvider

```
lib/contexts/company-context.tsx

CompanyContext {
  selectedCompanyId: number | null
  selectedCompany: CompanyResponse | null
  setSelectedCompanyId: (id: number) => void
}
```

- `useCompanies()`로 목록 로드, 선택 ID에 해당하는 회사를 `selectedCompany`로 제공
- 초기값: 회사 목록 로드 후 첫 번째 회사 자동 선택
- `localStorage`에 마지막 선택 ID 저장 → 새로고침 시 복원
- `app/(app)/layout.tsx`에 Provider 배치

### 3.2 헤더 사업장 선택기

- 기존 헤더에 `CompanySelector` 드롭다운 추가
- 회사명 + 사업자번호로 표시
- 회사 없을 시 "사업장을 등록해주세요" + `/companies/new` 링크

## 4. 페이지 UI

### 4.1 라우트 구조

```
(app)/companies/page.tsx            — 목록
(app)/companies/new/page.tsx        — 등록
(app)/companies/[id]/page.tsx       — 상세
(app)/companies/[id]/edit/page.tsx   — 수정
```

### 4.2 목록 (/companies)

- 검색: 회사명/사업자번호 텍스트 검색
- 필터: 지역(Region) Select + 업종(IndustryCategory) Select
- 테이블 컬럼: 회사명, 사업자번호, 지역(한글), 업종(한글), 총 직원수, 외국인 근로자수
- 페이지네이션: 기존 `lib/pagination.ts` 재사용
- 행 클릭 → `/companies/[id]`
- 우측 상단: "사업장 등록" 버튼

### 4.3 등록 (/companies/new)

- `CompanyForm` 컴포넌트 (등록/수정 공용)
- React Hook Form + Zod (`createCompanyRequestSchema`)
- 필드: 회사명, 사업자번호(xxx-xx-xxxxx), 지역 Select, 세부지역, 업종 Select, 세부업종, 총 직원수, 외국인 근로자수, 주소, 연락처
- `foreignWorkerCount ≤ employeeCount` 교차 검증
- 성공 시 `/companies/[id]` 이동 + 토스트

### 4.4 상세 (/companies/[id])

- 정보 카드: 전체 회사 정보 (regionName, industryCategoryName 한글)
- 소속 근로자 목록: `useWorkers(companyId)` 기반 테이블
- 액션 버튼: "수정" → `/companies/[id]/edit`, "근로자 등록" → `/workers/new`

### 4.5 수정 (/companies/[id]/edit)

- `CompanyForm` 재사용 (mode="edit")
- `useCompany(id)`로 기존 데이터 → defaultValues
- 사업자번호 disabled
- `updateCompanyRequestSchema` 사용
- 성공 시 `/companies/[id]` 이동 + 토스트

### 4.6 사이드바 변경

```
대시보드
사업장 관리    ← 추가 (Building 아이콘)
근로자 관리
컴플라이언스
```

## 5. Worker 마이그레이션

### 5.1 Worker Form 변경

기존 `<Input type="number" name="workplaceId" />` →
```
<Select name="companyId">
  — useCompanies()로 목록 로드
  — 옵션: "회사명 (사업자번호)"
  — CompanyContext의 selectedCompanyId로 초기값
  — 회사 없으면 안내 + /companies/new 링크
</Select>
```

### 5.2 근로자 목록 API 연동

- `useWorkers()` → `useWorkers(companyId?)` 시그니처 변경
- Route Handler: `GET /api/workers?companyId={id}` → `{BACKEND_URL}/api/workers?companyId={id}`
- CompanyContext의 `selectedCompanyId` 자동 전달
- `selectedCompanyId`가 null이면 빈 상태 ("사업장을 선택해주세요")

## 6. 범위 외 (별도 작업)

- 대시보드 사업장 연동 (대시보드 API 미전달)
- 시뮬레이터 API 연동 (별도 전달 예정)
- 컴플라이언스 API 연동 (별도 전달 예정)
- Company DELETE 엔드포인트 (BE 미구현)
