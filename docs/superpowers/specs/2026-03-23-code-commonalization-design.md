# 코드 공통화 설계

> 날짜: 2026-03-23
> 상태: 승인됨

## 목표

프로젝트 전반에 걸쳐 3회 이상 반복되는 코드를 공통화한다. 과도한 추상화를 지양하고, 1단계 추상화만 적용한다.

## 공통화 원칙

- **Rule of Three**: 3회 이상 반복되는 코드만 추출 대상
- **1단계 추상화**: 팩토리 위의 팩토리, 래퍼 위의 래퍼 금지
- **1곳에서만 쓰이는 코드는 건드리지 않음** (예: `WORKER_STATUS_COLORS`, `STATUS_STYLES`)
- **기존 파일 구조/패턴 최대한 유지**

---

## 영역 1: API Route 에러 핸들링

### 현황

10개 Route Handler에 동일한 catch 블록, 3개에 JSON 파싱 블록, 2개에 스키마 검증 블록이 복붙되어 있다.

### 설계

`lib/api-route-utils.ts`에 3개의 독립 유틸 함수를 추출한다.

#### `handleRouteError(error: unknown, context: string): NextResponse`

```typescript
export function handleRouteError(error: unknown, context: string): NextResponse {
  if (error instanceof ApiError) {
    return NextResponse.json({ message: error.message }, { status: error.status });
  }
  console.error(`[${context}] Unexpected error:`, error);
  return NextResponse.json(
    { message: ERROR_MESSAGES.SERVER_ERROR },
    { status: 500 },
  );
}
```

- `context`: 로그에 출력할 엔드포인트 식별자 (예: `"GET /api/workers"`)
- 에러 메시지 상수는 영역 4에서 정의하는 `ERROR_MESSAGES`를 사용

#### `parseRequestBody(request: Request): Promise<{ data: unknown } | NextResponse>`

```typescript
export async function parseRequestBody(
  request: Request,
): Promise<{ data: unknown } | NextResponse> {
  try {
    const data: unknown = await request.json();
    return { data };
  } catch {
    return NextResponse.json(
      { message: ERROR_MESSAGES.INVALID_REQUEST_FORMAT },
      { status: 400 },
    );
  }
}
```

- 반환 타입이 `{ data }` 또는 `NextResponse`이므로, 호출부에서 `instanceof NextResponse`로 분기

#### `validateSchema<T>(schema: ZodSchema<T>, body: unknown): { data: T } | NextResponse`

```typescript
export function validateSchema<T>(
  schema: ZodSchema<T>,
  body: unknown,
): { data: T } | NextResponse {
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? ERROR_MESSAGES.INVALID_INPUT;
    return NextResponse.json({ message: firstError }, { status: 400 });
  }
  return { data: parsed.data };
}
```

#### 사용 예시 (Before → After)

```typescript
// Before (app/api/companies/route.ts POST)
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "잘못된 요청 형식입니다" }, { status: 400 });
  }
  const parsed = createCompanyRequestSchema.safeParse(body);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "입력값이 올바르지 않습니다";
    return NextResponse.json({ message: firstError }, { status: 400 });
  }
  try {
    const company = await apiClient.post("/api/companies", parsed.data);
    return NextResponse.json(company, { status: 201 });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }
    console.error("[POST /api/companies] Unexpected error:", error);
    return NextResponse.json({ message: "서버 오류가 발생했습니다" }, { status: 500 });
  }
}

// After
export async function POST(request: Request) {
  const bodyResult = await parseRequestBody(request);
  if (bodyResult instanceof NextResponse) return bodyResult;

  const validated = validateSchema(createCompanyRequestSchema, bodyResult.data);
  if (validated instanceof NextResponse) return validated;

  try {
    const company = await apiClient.post("/api/companies", validated.data);
    return NextResponse.json(company, { status: 201 });
  } catch (error) {
    return handleRouteError(error, "POST /api/companies");
  }
}
```

### 적용 대상 파일

| 파일 | `handleRouteError` | `parseRequestBody` | `validateSchema` |
|------|:--:|:--:|:--:|
| `app/api/workers/route.ts` (GET, POST) | O | O | - |
| `app/api/workers/[id]/route.ts` (GET) | O | - | - |
| `app/api/companies/route.ts` (GET, POST) | O | O | O |
| `app/api/companies/[id]/route.ts` (GET, PUT) | O | O | O |
| `app/api/compliance/overdue/route.ts` | O | - | - |
| `app/api/compliance/upcoming/route.ts` | O | - | - |
| `app/api/compliance/worker/[id]/route.ts` | O | - | - |

---

## 영역 2: React Query 공통 fetch 유틸

### 현황

`lib/queries/` 내 3개 파일에서 GET 훅 6개, Mutation 훅 3개가 `fetch → 에러 처리 → res.json()` 동일 패턴을 반복한다.

### 설계 변경 사유

당초 팩토리 함수를 검토했으나, 실제 코드 확인 결과:
- `useWorkers(companyId)`: 동적 query string + `enabled` 옵션
- `useOverdueDeadlines()`: `refetchInterval: 30_000`
- `useUpcomingDeadlines(days)`: 동적 파라미터 + `refetchInterval`
- `useUpdateCompany()`: 동적 endpoint (`/api/companies/${id}`)

단순 정적 GET 훅은 `useCompanies()` 1개뿐 → **Rule of Three 미달로 팩토리 폐기**.
대신 `queryFn`/`mutationFn` 내부의 공통 fetch 로직만 추출한다. 훅 구조는 그대로 유지.

### 설계

기존 `lib/queries/query-utils.ts`(`throwResponseError` 정의 파일)에 2개 함수를 추가한다.

#### `fetchApi<T>(endpoint: string, errorMessage: string): Promise<T>`

```typescript
export async function fetchApi<T>(endpoint: string, errorMessage: string): Promise<T> {
  const res = await fetch(endpoint);
  if (!res.ok) return throwResponseError(res, errorMessage);
  return res.json();
}
```

#### `mutateApi<T>(endpoint: string, method: string, data: unknown, errorMessage: string): Promise<T>`

```typescript
export async function mutateApi<T>(
  endpoint: string,
  method: string,
  data: unknown,
  errorMessage: string,
): Promise<T> {
  const res = await fetch(endpoint, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) return throwResponseError(res, errorMessage);
  return res.json();
}
```

#### 사용 예시 (Before → After)

```typescript
// Before (lib/queries/use-companies.ts)
export function useCompanies() {
  return useQuery<readonly CompanyResponse[]>({
    queryKey: ["companies"],
    queryFn: async () => {
      const res = await fetch("/api/companies");
      if (!res.ok) await throwResponseError(res, "사업장 목록을 불러올 수 없습니다");
      return res.json();
    },
  });
}

// After — 훅 구조는 유지, queryFn 내부만 간결해짐
export function useCompanies() {
  return useQuery<readonly CompanyResponse[]>({
    queryKey: ["companies"],
    queryFn: () => fetchApi<readonly CompanyResponse[]>(
      "/api/companies", "사업장 목록을 불러올 수 없습니다",
    ),
  });
}

// 동적 파라미터 훅도 동일하게 적용 가능
export function useWorkers(companyId?: number | null) {
  const params = companyId ? `?companyId=${companyId}` : "";
  return useQuery<readonly WorkerResponse[]>({
    queryKey: ["workers", { companyId }],
    queryFn: () => fetchApi<readonly WorkerResponse[]>(
      `/api/workers${params}`, "근로자 목록을 불러올 수 없습니다",
    ),
    enabled: companyId != null && companyId > 0,
  });
}

// Mutation도 동일
export function useCreateCompany() {
  const queryClient = useQueryClient();
  return useMutation<CompanyResponse, Error, CreateCompanyRequest>({
    mutationFn: (data) => mutateApi<CompanyResponse>(
      "/api/companies", "POST", data, "사업장 등록에 실패했습니다",
    ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
    },
  });
}
```

### 적용 대상

| 훅 | `fetchApi` | `mutateApi` |
|----|:----------:|:-----------:|
| `useWorkers(companyId)` | O | - |
| `useWorker(id)` | O | - |
| `useCompanies()` | O | - |
| `useCompany(id)` | O | - |
| `useOverdueDeadlines()` | O | - |
| `useUpcomingDeadlines(days)` | O | - |
| `useWorkerDeadlines(id)` | O | - |
| `useRegisterWorker()` | - | O |
| `useCreateCompany()` | - | O |
| `useUpdateCompany()` | - | O |

모든 훅에 적용 가능. 훅별 고유 옵션(`enabled`, `refetchInterval`, 동적 endpoint)은 그대로 유지.

---

## 영역 3-1: FormField 공통 컴포넌트

### 현황

`worker-form.tsx`와 `company-form.tsx`에서 `Label + Input + Error` 래퍼가 136회 이상 반복된다.

### 설계

`components/form/form-field.tsx`에 공통 컴포넌트를 만든다.

```typescript
import type { FieldError, FieldErrors, FieldValues, Path, UseFormRegister } from "react-hook-form";

interface FormFieldProps<T extends FieldValues> {
  readonly label: string;
  readonly name: Path<T>;
  readonly register: UseFormRegister<T>;
  readonly errors: FieldErrors<T>;
  readonly type?: "text" | "number" | "date" | "tel" | "email";
  readonly placeholder?: string;
  readonly disabled?: boolean;
  readonly children?: React.ReactNode; // Select 등 커스텀 입력 시 사용
}

export function FormField<T extends FieldValues>({
  label, name, register, errors, type = "text", placeholder, disabled, children,
}: FormFieldProps<T>) {
  const error = errors[name];
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={name}>{label}</Label>
      {children ?? (
        <Input
          id={name}
          type={type}
          {...register(name)}
          aria-invalid={!!error}
          placeholder={placeholder}
          disabled={disabled}
        />
      )}
      {error && (
        <p className="text-sm text-destructive">
          {(error as FieldError).message}
        </p>
      )}
    </div>
  );
}
```

- **제네릭 `T extends FieldValues`**: `name` prop이 `Path<T>` 타입이므로 폼 스키마에 없는 필드명을 전달하면 컴파일 에러 발생
- `children`이 있으면 Input 대신 children을 렌더링 (Select, Textarea 등)
- `children` 사용 시에도 Label과 Error는 공통으로 렌더링
- Input 전용 prop(`type`, `placeholder`, `disabled`)은 children 사용 시 무시됨

### 사용 예시

```typescript
// Input 필드
<FormField label="이름" name="name" register={register} errors={errors} placeholder="홍길동" />

// Select 필드
<FormField label="국적" name="nationality" register={register} errors={errors}>
  <Select ...>...</Select>
</FormField>
```

---

## 영역 3-2: CompanyForm Create/Edit 통합

### 현황

`company-form.tsx` 내 `CreateCompanyForm`과 `EditCompanyForm`이 10개 필드에서 거의 동일한 JSX를 갖고 있다.

### 설계

하나의 `CompanyForm` 컴포넌트로 통합하고, `mode` prop으로 분기한다.

```typescript
interface CompanyFormProps {
  readonly mode: "create" | "edit";
  readonly defaultValues?: CompanyResponse; // edit 모드 시 기존 데이터
  readonly companyId?: number;              // edit 모드 시 ID
}

export function CompanyForm({ mode, defaultValues, companyId }: CompanyFormProps) {
  // mode에 따라 mutation 선택
  const createMutation = useCreateCompany();
  const updateMutation = useUpdateCompany();

  // mode에 따라 분기하는 부분:
  // 1. form defaultValues 설정
  // 2. onSubmit에서 create vs update mutation 호출
  // 3. 사업자번호 필드 disabled 여부
  // 4. 제출 버튼 텍스트 ("등록" vs "수정")
  // 5. 성공 시 리다이렉트 경로

  // JSX는 한 벌만 작성
}
```

### 분기 포인트 (mode별 차이)

| 항목 | create | edit |
|------|--------|------|
| `defaultValues` | 빈 객체 | `defaultValues` prop |
| 사업자번호 | 입력 가능 | `disabled` |
| 제출 핸들러 | `createMutation.mutate` | `updateMutation.mutate` |
| 버튼 텍스트 | "등록" | "수정" |
| 성공 리다이렉트 | `/companies` | `/companies/${companyId}` |

---

## 영역 4: 상수 파일 분리

### 현황

에러 메시지가 10+곳에 하드코딩, 상태 라벨이 2곳에서 각각 정의되어 있다.

### 설계

`lib/constants/` 디렉토리에 2개 파일을 생성한다.

#### `lib/constants/error-messages.ts`

```typescript
export const ERROR_MESSAGES = {
  SERVER_ERROR: "서버 오류가 발생했습니다",
  INVALID_REQUEST_FORMAT: "잘못된 요청 형식입니다",
  INVALID_INPUT: "입력값이 올바르지 않습니다",
  PAGE_REFRESH_SUFFIX: "페이지를 새로고침해 주세요.",
} as const;
```

- Route Handler와 UI 컴포넌트 양쪽에서 import
- `PAGE_REFRESH_SUFFIX`는 접미사로만 사용 — 전체 메시지는 각 컴포넌트에서 도메인별 접두사와 조합

#### `lib/constants/status.ts`

`DEADLINE_STATUS_LABELS`는 이미 `types/api.ts:147-153`에 정의되어 있으므로 **새로 만들지 않는다**.
단, `types/api.ts`의 OVERDUE 라벨이 "초과"로 되어 있으나, UI에서는 "기한초과"를 사용 중이므로 `types/api.ts`의 라벨을 "기한초과"로 수정한다.
`status-badge.tsx`와 `deadline-chart.tsx`에서 `types/api.ts`의 `DEADLINE_STATUS_LABELS`를 import하도록 통일한다.

새로 추출하는 것은 **스타일/색상 상수**뿐이다:

```typescript
import type { DeadlineStatus } from "@/types/api";

// 배지용 Tailwind 클래스 (status-badge.tsx에서 사용)
// 실제 코드 기준: PENDING=blue, COMPLETED=green
export const DEADLINE_STATUS_BADGE_STYLES: Record<DeadlineStatus, string> = {
  OVERDUE: "bg-red-100 text-red-800 hover:bg-red-200",
  URGENT: "bg-orange-100 text-orange-800 hover:bg-orange-200",
  APPROACHING: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
  PENDING: "bg-blue-100 text-blue-800 hover:bg-blue-200",
  COMPLETED: "bg-green-100 text-green-800 hover:bg-green-200",
} as const;

// 차트용 hex 색상 (deadline-chart.tsx에서 사용, OVERDUE/COMPLETED 제외)
type ChartableStatus = Exclude<DeadlineStatus, "OVERDUE" | "COMPLETED">;

export const DEADLINE_STATUS_CHART_COLORS: Record<ChartableStatus, string> = {
  URGENT: "#ef4444",
  APPROACHING: "#f59e0b",
  PENDING: "#22c55e",
} as const;
```

- **라벨**: `types/api.ts`의 `DEADLINE_STATUS_LABELS` 단일 소스 유지 (중복 생성 안 함)
- **배지 스타일**: `COMPLETED` 포함하여 모든 `DeadlineStatus` 커버
- **차트 색상**: `OVERDUE`와 `COMPLETED` 모두 제외 (차트에 표시하지 않는 상태)
- 1곳에서만 쓰이는 `WORKER_STATUS_COLORS`, `STATUS_STYLES`는 추출하지 않음

### 적용 대상

| 상수 | 사용처 |
|------|--------|
| `DEADLINE_STATUS_LABELS` | `status-badge.tsx`, `deadline-chart.tsx` |
| `DEADLINE_STATUS_BADGE_STYLES` | `status-badge.tsx` |
| `DEADLINE_STATUS_CHART_COLORS` | `deadline-chart.tsx` |
| `ERROR_MESSAGES.SERVER_ERROR` | 7개 Route Handler |
| `ERROR_MESSAGES.INVALID_REQUEST_FORMAT` | 3개 Route Handler |

---

## 영역 5-1: EmptyState 공통 컴포넌트

### 현황

dashed border + 메시지 패턴이 7회 반복된다. 일부는 CTA 버튼을 포함한다.

### 설계

`components/common/empty-state.tsx`

```typescript
interface EmptyStateProps {
  readonly message: string;
  readonly action?: React.ReactNode;
  readonly variant?: "default" | "error";
}

export function EmptyState({ message, action, variant = "default" }: EmptyStateProps) {
  return (
    <div className="flex h-40 flex-col items-center justify-center gap-2 rounded-lg border border-dashed text-sm text-muted-foreground">
      <p className={variant === "error" ? "text-destructive" : undefined}>
        {message}
      </p>
      {action}
    </div>
  );
}
```

- `variant="error"`: `text-destructive` 스타일 적용 (에러 상태용)
- `action`: 선택적 CTA 버튼

### 사용 예시

```typescript
<EmptyState message="등록된 근로자가 없습니다." />
<EmptyState
  message="사업장 목록을 불러오는 중 오류가 발생했습니다."
  variant="error"
  action={<Button onClick={retry}>다시 시도</Button>}
/>
```

---

## 영역 5-2: FilterSelect 공통 컴포넌트

### 현황

"전체" 옵션 + 배열 매핑 Select 패턴이 7+회 반복된다.

### 설계

`components/common/filter-select.tsx`

```typescript
interface FilterSelectProps<T extends string> {
  readonly value: T | "ALL";
  readonly onValueChange: (value: T | "ALL") => void;
  readonly placeholder: string;
  readonly options: readonly T[];
  readonly labelMap?: Readonly<Record<T, string>>; // 미제공 시 option value를 그대로 표시
  readonly className?: string;
}

export function FilterSelect<T extends string>({
  value, onValueChange, placeholder, options, labelMap, className = "w-48",
}: FilterSelectProps<T>) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={className} aria-label={placeholder}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="ALL">전체</SelectItem>
        {options.map((option) => (
          <SelectItem key={option} value={option}>
            {labelMap ? labelMap[option] : option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
```

- 제네릭 `T`로 타입 안전성 유지
- "전체" 옵션은 항상 첫 번째에 포함
- `className`으로 너비 커스터마이즈 가능 (기본 `w-48`)

### 사용 예시

```typescript
<FilterSelect
  value={visaFilter}
  onValueChange={setVisaFilter}
  placeholder="비자 유형"
  options={VISA_TYPES}
  labelMap={VISA_TYPE_LABELS}
/>
```

---

## 디렉토리 구조 변화

```
lib/
  ├── api-route-utils.ts          ← NEW (영역 1)
  ├── constants/
  │   ├── error-messages.ts       ← NEW (영역 4)
  │   └── status.ts               ← NEW (영역 4)
  └── queries/
      ├── query-utils.ts          ← EXTEND (fetchApi, mutateApi 추가) (영역 2)
      ├── use-workers.ts          ← SIMPLIFY
      ├── use-companies.ts        ← SIMPLIFY
      └── use-compliance.ts       ← SIMPLIFY

components/
  ├── form/
  │   └── form-field.tsx          ← NEW (영역 3-1)
  ├── common/
  │   ├── empty-state.tsx         ← NEW (영역 5-1)
  │   └── filter-select.tsx       ← NEW (영역 5-2)
  ├── companies/
  │   └── company-form.tsx        ← REFACTOR (영역 3-2)
  └── workers/
      └── worker-form.tsx         ← SIMPLIFY (영역 3-1)

app/api/
  └── (모든 route.ts)             ← SIMPLIFY (영역 1)
```

## 테스트 전략

- 새로 생성하는 유틸(`api-route-utils.ts`)과 확장하는 유틸(`query-utils.ts`의 `fetchApi`, `mutateApi`)에 단위 테스트 추가
- 공통 컴포넌트(`FormField`, `EmptyState`, `FilterSelect`)에 렌더링 테스트 추가
- 기존 테스트가 있는 파일은 리팩토링 후에도 기존 테스트가 통과해야 함
- CompanyForm 통합 시 기존 Create/Edit 테스트를 mode별 테스트로 전환
