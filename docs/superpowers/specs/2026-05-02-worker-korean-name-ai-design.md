# Worker Korean Name AI Suggestion Design

## Overview

근로자 관리 화면에 `koreanName`을 추가한다. `name`은 기존처럼 근로자의 기본 이름이며, 화면 라벨도 `이름`으로 유지한다. `koreanName`은 `name`의 한글 발음 표기이며 선택값이다. 별명, 애칭, 한국식 이름 생성값이 아니다.

기능의 목적은 현장에서 외국인 근로자를 비인격적 호칭이나 국적명 대신 이름으로 부를 수 있도록 돕는 것이다. 이번 범위는 공식 성명의 한글 발음 표기 관리와 AI 추천 보조에 한정한다.

## References

- Planning brief: `/Users/mojaeyeong/Documents/ownProject/foreign-worker-compliance-project-management/prompts/2026-05-02-worker-korean-name-ai-brief.md`
- Integrated SPEC: `/Users/mojaeyeong/Documents/ownProject/foreign-worker-compliance-project-management/SPEC.md`
- Frontend SPEC: `/Users/mojaeyeong/Documents/ownProject/foreign-worker-compliance-project-management/SPEC-frontend.md`
- Decision log D20: `/Users/mojaeyeong/Documents/ownProject/foreign-worker-compliance-project-management/checklist.md`
- Reference article: `https://www.khan.co.kr/article/202604170600041`

## Product Rules

- Existing `name` remains the primary worker name.
- The existing `이름` label must not be changed to `공식 성명`.
- `koreanName` is the Korean phonetic spelling of `name`.
- `koreanName` is optional.
- Users can manually type and edit `koreanName`.
- Users can click `AI로 생성` to receive a suggested `koreanName`.
- AI suggestion fills only the `한글 이름` input.
- AI suggestion never auto-saves worker data.
- List and detail views keep `name` as primary text.
- `koreanName`, when present, appears only as secondary pronunciation text.
- Existing `name` sorting remains unchanged.

## Architecture

### Types and Schemas

Update `types/api.ts`.

- Add optional `koreanName` to `registerWorkerRequestSchema`.
- Add optional `koreanName` to `updateWorkerRequestSchema`, allowing the same empty-string form value pattern used by other optional text inputs.
- Add `readonly koreanName: string | null` to `WorkerResponse`.
- Add request and response types for Korean-name suggestion:

```typescript
export interface SuggestWorkerKoreanNameRequest {
  readonly name: string;
  readonly nationalityCode: Nationality;
}

export interface SuggestWorkerKoreanNameResponse {
  readonly koreanName: string;
}
```

Empty `koreanName` is allowed in forms. Submit sanitization should preserve manual non-empty values and convert blank values to `undefined` for create/update payloads, matching the existing optional text field pattern.

### BFF Route

Add `app/api/workers/korean-name/suggest/route.ts`.

Flow:

```text
POST /api/workers/korean-name/suggest
  -> parse request body
  -> validate { name, nationalityCode }
  -> apiClient.post("/api/workers/korean-name/suggest", body)
  -> return { koreanName }
```

The route forwards backend errors through `handleRouteError`, following the existing BFF pattern. The backend action endpoint may return `202 Accepted + body`; the BFF returns the JSON body to the client as a successful 2xx response and does not trigger any worker save mutation.

### Query Hook

Add a focused mutation in `lib/queries/use-workers.ts`:

```typescript
useSuggestWorkerKoreanName()
```

It calls `mutateApi<SuggestWorkerKoreanNameResponse>("/api/workers/korean-name/suggest", "POST", payload, "한글 이름 추천에 실패했습니다")`.

This mutation should not invalidate worker queries because it does not persist data.

## Form Design

Update `components/workers/worker-form.tsx`.

The `한글 이름` field is placed directly after the existing `이름` field. This makes the relationship between `name` and `koreanName` clear.

Layout:

```text
이름
[ name input ]

한글 이름 (선택)        [AI로 생성]
[ koreanName input ]
이름의 한글 발음 표기를 입력하세요. AI 추천 결과는 실제 발음과 다를 수 있으니 확인 후 저장하세요.
```

Behavior:

- Register `koreanName` in create and edit default values.
- In edit mode, default to `props.worker.koreanName ?? ""`.
- `AI로 생성` reads current form values via `getValues`.
- If `name` is blank, show guidance and do not call the API.
- If `nationality` is missing, show guidance and do not call the API.
- When calling the API, map frontend `nationality` to backend `nationalityCode`.
- Disable the button while the suggestion request is pending.
- On success, if `response.koreanName.trim()` is non-empty, call `setValue("koreanName", response.koreanName, { shouldDirty: true })`.
- On empty suggestion, show guidance telling the user to enter it manually.
- On failure, show the mutation error message.
- The user can edit the suggested value before saving.

Submit behavior:

- Create submit includes a non-empty `koreanName` only as part of the normal worker registration payload.
- Edit submit includes a non-empty `koreanName` only as part of the normal worker update payload.
- AI suggestion never calls `useRegisterWorker` or `useUpdateWorker`.

## Display Design

### Worker List

Update `components/workers/worker-table.tsx`.

The name cell keeps `name` as the primary text. If `koreanName` exists after trimming, show it below `name` in muted secondary text.

Example:

```text
NGUYEN VAN AN
응우옌 반 안
```

If `koreanName` is missing or blank, render only `name`. Do not render `name` twice.

### Worker Detail

Update `app/(app)/workers/[id]/page.tsx`.

The page heading keeps `name` as the main heading. If `koreanName` exists after trimming, show it directly under the heading as secondary text.

The basic information card may also include a `한글 이름` row if `koreanName` exists. This row is secondary information and must not replace `name`.

## Search and Sorting

Update `components/workers/worker-table.tsx`.

- Add a dedicated search type option: `한글 이름`.
- `NAME` search matches only `worker.name`.
- `KOREAN_NAME` search matches only `worker.koreanName`.
- `ALL` search matches `worker.name` and `worker.koreanName`, plus the existing identifier fields.
- Phone, registration number, and passport number scoped searches remain unchanged.
- Existing name sorting continues to use only `worker.name`.

Update `lib/queries/use-workers.ts` for the older `usePaginatedWorkers` filter:

- Search should match `name`, `koreanName`, and the existing nationality code behavior.
- This hook is currently marked production-unused, but tests should stay aligned with the shared search policy.

## Error Handling

- Missing `name`: show `이름을 입력한 뒤 AI로 생성해 주세요.`
- Missing `nationality`: show `국적을 선택한 뒤 AI로 생성해 주세요.`
- Empty AI result: show `추천 결과가 비어 있습니다. 직접 입력해 주세요.`
- API failure: show `한글 이름 추천에 실패했습니다` or the backend-provided user-facing message.

These errors affect only the suggestion action. They must not block manual entry or normal worker save.

## Tests

### Type and Schema Tests

Update `__tests__/types/schemas.test.ts`.

- Register schema passes without `koreanName`.
- Register schema passes with `koreanName`.
- Update schema passes with `koreanName`.

### Form Tests

Update `__tests__/components/worker-form.test.tsx`.

- The existing `이름` label remains present.
- `한글 이름` and `AI로 생성` render.
- Clicking `AI로 생성` without `name` does not call the API and shows guidance.
- Clicking `AI로 생성` without `nationality` does not call the API and shows guidance.
- With `name` and `nationality`, the request payload is `{ name, nationalityCode }`.
- Successful suggestion fills the `한글 이름` input.
- Suggestion does not submit or save the worker.

### Table Tests

Update `__tests__/components/worker-table.test.tsx`.

- `name` is rendered as the primary name.
- `koreanName` renders as secondary text when present.
- Missing `koreanName` does not duplicate `name`.
- `NAME` search matches `name`.
- `KOREAN_NAME` search matches `koreanName`.
- `ALL` search matches `koreanName`.
- Name sorting remains based on `name`.

### Hook Tests

Update `__tests__/lib/use-paginated-workers.test.tsx`.

- Search matches `koreanName`.
- Existing name and nationality search behavior remains unchanged.

### API Route Tests

Add tests for `app/api/workers/korean-name/suggest/route.ts`.

- Valid body forwards `{ name, nationalityCode }` to the backend.
- Success returns `{ koreanName }`.
- Missing or invalid body returns `400`.
- Backend errors are forwarded through `handleRouteError`.

### Mock Data

Update MSW mock data and handlers.

- Add `koreanName` to relevant `mockWorkers`.
- Add `POST */api/workers/korean-name/suggest`.
- Add `${BACKEND}/api/workers/korean-name/suggest`.
- Ensure registration mock echoes `koreanName` when provided.

## Implementation Scope

Expected files:

| File | Change |
|------|--------|
| `types/api.ts` | Add `koreanName` fields and suggestion API types/schema |
| `lib/queries/use-workers.ts` | Add suggestion mutation and include `koreanName` in legacy search |
| `components/workers/worker-form.tsx` | Add field, AI button, suggestion behavior, submit payload |
| `components/workers/worker-table.tsx` | Add secondary display and search matching |
| `app/(app)/workers/[id]/page.tsx` | Add secondary detail display |
| `app/api/workers/korean-name/suggest/route.ts` | New BFF route |
| `mocks/data.ts` | Add sample `koreanName` values |
| `mocks/handlers.ts` | Add suggestion handlers and echo create payload |
| `__tests__/types/schemas.test.ts` | Schema coverage |
| `__tests__/components/worker-form.test.tsx` | Form and AI behavior coverage |
| `__tests__/components/worker-table.test.tsx` | Display/search/sort coverage |
| `__tests__/lib/use-paginated-workers.test.tsx` | Legacy hook search coverage |
| `__tests__/api/worker-korean-name-suggest-route.test.ts` | BFF route coverage |

## Definition of Done

- Existing `이름` label is not changed to `공식 성명`.
- Users can manually enter `koreanName`.
- Users can request an AI suggestion.
- AI suggestion fills only the input field and does not auto-save.
- Users can edit the suggested value before saving.
- After saving, list/detail views show `name` as primary and `koreanName` as secondary.
- Missing `koreanName` preserves the existing name-only display.
- Missing `koreanName` does not duplicate `name`.
- Search matches both `name` and `koreanName`.
- Worker list search type includes a separate `한글 이름` option.
- Sorting remains based on `name`.
- AI suggestion failures do not block manual entry or worker save.
- Unit tests cover schema, form, table, hook, and BFF route behavior.
