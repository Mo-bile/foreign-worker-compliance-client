# S17-FE: 사이드바 IA 보강 + 알림 설정 페이지 + 시뮬레이터 라벨

> 근거: checklist.md P0 라운드 3 §S17
> 접근법: A (최소 변경, 기존 컴포넌트 최대 재사용)

## 결정 사항 요약

| 질문 | 결정 |
|------|------|
| 사이드바 카테고리명 | "고용 후" 유지 (퇴사자 조회 포함하므로) |
| contactEmail 편집 UI | 모달 방식 |
| 알림 시점 토글 저장 | localStorage (`fwc:notification-prefs:{companyId}`) |
| BE API 연동 전략 | trigger=실제 연동, logs=MSW 목업 우선 |
| 내 사업장 정보 근로자 표시 | 근로자 수 요약 + 근로자 관리 링크 |
| 데드라인 딥링크 (작업 5) | 포함 |

---

## 작업 1: 사이드바 카테고리 재구성

**변경 파일:** `components/layout/sidebar.tsx`

### 변경 전

```
메인 — 대시보드
고용 전 — 고용허가 시뮬레이터
고용 후 — 사업장 건강검진, 사업장 관리, 근로자 관리
지속 관리 — 법령·리포트
```

### 변경 후

```
메인 — 대시보드
고용 전 — E-9 고용허가 시뮬레이터          ← 라벨 변경
고용 후 — 사업장 건강검진, 근로자 관리       ← 사업장 관리 제거
지속 관리 — 법령·리포트
설정 (신규) — 내 사업장 정보, 알림 설정
관리자 (신규) — 사업장 관리 (이동)
```

### 아이콘

| 메뉴 | 아이콘 (lucide) |
|------|----------------|
| 설정 (카테고리) | — (카테고리는 아이콘 없음) |
| 내 사업장 정보 | `Building` |
| 알림 설정 | `Bell` |
| 관리자 (카테고리) | — |
| 사업장 관리 | `Building2` (기존 유지) |

### isActive 로직

기존 `pathname.startsWith(href)` 패턴 유지. `/settings/company`와 `/settings/notifications`는 각각 독립 경로이므로 충돌 없음.

### 관리자 카테고리 가드

P1 인증 도입 시 `role=OPERATOR` 가드 예정. 현재는 모두에게 노출. 코드 주석으로 TODO 표기.

---

## 작업 2: 내 사업장 정보 페이지

**신규 파일:** `app/(app)/settings/company/page.tsx`

### 페이지 레이아웃

```
┌──────────────────────────────────────────┐
│ PageHeader: "내 사업장 정보"    [정보 수정]  │
├──────────────────────────────────────────┤
│ CompanyDetailCard (기존 재사용, 읽기 전용)   │
│  사업자번호 | 지역 | 업종 | 직원 수 ...      │
├──────────────────────────────────────────┤
│ 근로자 요약                                │
│  "소속 근로자 N명"  [근로자 관리 →]           │
└──────────────────────────────────────────┘
```

### 데이터 흐름

1. `useCurrentCompany()` → `currentCompanyId`
2. `useCompany(currentCompanyId)` → 사업장 정보 → `CompanyDetailCard`에 전달
3. `useWorkers(currentCompanyId)` → `workers.length`로 근로자 수 표시
4. 사이드바 드롭다운 변경 시 `currentCompanyId` 변경 → 자동 갱신

### 편집 모달

**신규 파일:** `components/settings/company-edit-modal.tsx`

- 트리거: "정보 수정" 버튼
- 편집 가능 필드: `contactEmail`
- 읽기 전용 표시: 사업자번호, 지역, 업종 등 (참고용)
- 폼: react-hook-form + Zod (`UpdateCompanyRequest` 스키마 재사용)
- 저장: `useUpdateCompany()` 뮤테이션 호출
- 성공 시: 모달 닫힘 + React Query invalidate로 카드 갱신

---

## 작업 3: 알림 설정 페이지

**신규 파일:** `app/(app)/settings/notifications/page.tsx`

### 페이지 레이아웃

```
┌─────────────────────────────────────────────┐
│ PageHeader: "알림 설정"                       │
├─────────────────────────────────────────────┤
│ § 수신 이메일                                 │
│  현재: owner1@demo.test (Company.contactEmail)│
│  [이메일 변경 →] /settings/company 링크        │
├─────────────────────────────────────────────┤
│ § 알림 시점                                   │
│  ☑ D-30 (한 달 전)                            │
│  ☑ D-7  (일주일 전)                           │
│  ☑ OVERDUE (기한 초과)                        │
├─────────────────────────────────────────────┤
│ § 수동 발송                                   │
│  [지금 알림 보내기]                             │
├─────────────────────────────────────────────┤
│ § 최근 발송 기록                               │
│  | 발송 시각 | 시점 | 건수 | 수신자 |           │
├─────────────────────────────────────────────┤
│ ⚠️ 자동 스케줄러는 P2 단계에서 구현 예정입니다.   │
│    현재는 "지금 알림 보내기" 버튼으로 수동 발송.   │
└─────────────────────────────────────────────┘
```

### 섹션별 데이터 소스

| 섹션 | 데이터 소스 | 비고 |
|------|-----------|------|
| 수신 이메일 | `useCompany()` → `contactEmail` | 읽기 전용 |
| 알림 시점 | localStorage `fwc:notification-prefs:{companyId}` | 기본값 전부 true, P2에서 서버 API 교체 |
| 수동 발송 | `POST /api/notifications/trigger?companyId={id}` | BE 실제 연동 |
| 발송 기록 | `GET /api/notifications/logs?companyId={id}&limit=10` | MSW 목업 우선 |

### BFF 라우트

**`app/api/notifications/trigger/route.ts`** (신규)
- `POST` → `apiClient.post("/notifications/trigger", { companyId })`
- 응답: `{ triggered: number, skipped: number, failedRecipients: string[] }`

**`app/api/notifications/logs/route.ts`** (신규)
- `GET` → `apiClient.get("/notifications/logs", { companyId, limit })`
- 응답: `NotificationLog[]`

### 타입 정의

**`types/notification.ts`** (신규)

```typescript
// Zod 스키마 + 타입
NotificationLog: { id, sentAt, templateType, deadlineCount, recipientEmail }
TriggerResponse: { triggered, skipped, failedRecipients }
templateType: "D30" | "D7" | "OVERDUE"
```

### React Query 훅

**`lib/queries/use-notifications.ts`** (신규)

- `useNotificationLogs(companyId)` — `GET /api/notifications/logs`
- `useTriggerNotification()` — `POST /api/notifications/trigger` 뮤테이션, 성공 시 logs invalidate

### 컴포넌트

**`components/notifications/notification-log-table.tsx`** (신규)
- `NotificationLog[]`을 테이블로 렌더링
- `templateType` → 한글 라벨 매핑 (D30→"D-30", D7→"D-7", OVERDUE→"기한 초과")
- `sentAt` → `toLocaleString("ko-KR")` 포맷

**`components/notifications/notification-timing-toggles.tsx`** (신규)
- 3개 체크박스 (D-30, D-7, OVERDUE)
- localStorage에서 읽기/쓰기
- 키: `fwc:notification-prefs:{companyId}`
- 기본값: `{ d30: true, d7: true, overdue: true }`

### 토스트

- 성공: `"${triggered}건 발송 완료"`
- 실패: `"발송 실패: ${error.message}"`

### MSW 핸들러

**`mocks/handlers/notifications.ts`** (신규)

- `GET */api/notifications/logs` — 목업 로그 데이터 반환
- `POST */api/notifications/trigger` — 목업 성공 응답
- BACKEND 경로 + `*` 경로 이중 등록 (프로젝트 규약)

---

## 작업 4: 시뮬레이터 안내 박스

**변경 파일:** `app/(app)/simulator/page.tsx`

### 안내 박스

페이지 최상단 (폼/결과 레이아웃 위):

```
ℹ️ 본 시뮬레이터는 고용허가제 E-9 (일반 외국인) 비자 기준입니다.
   H-2 (방문취업) 비자는 2026-02-12부터 신규 발급이 중단되어
   본 시뮬레이션은 E-9 한정으로 작동합니다.
   E-7-4 (숙련기능인력) 전환은 별도 추천서 발급 절차이며 본 도구 범위 외입니다.
```

- 스타일: signal-info 톤 (`bg-blue-50 border-blue-200 text-blue-800`)
- 별도 컴포넌트 추출 없이 페이지 내 인라인
- 사이드바 라벨 변경은 작업 1에서 함께 처리

---

## 작업 5: 대시보드 데드라인 딥링크

**변경 파일:** `components/dashboard/deadline-timeline.tsx`

"30일 타임라인" 카드 하단에 텍스트 링크 추가:

```
알림 설정 →   (Link to /settings/notifications)
```

- 스타일: `text-sm text-muted-foreground hover:text-foreground`, 우측 정렬
- 카드 footer 영역에 배치

---

## 전체 변경 파일 목록

### 수정 (3개)

| 파일 | 변경 내용 |
|------|----------|
| `components/layout/sidebar.tsx` | 6개 카테고리 재구성 + 라벨 변경 |
| `app/(app)/simulator/page.tsx` | E-9 안내 박스 추가 |
| `components/dashboard/deadline-timeline.tsx` | 알림 설정 딥링크 |

### 신규 (10개)

| 파일 | 역할 |
|------|------|
| `app/(app)/settings/company/page.tsx` | 내 사업장 정보 페이지 |
| `app/(app)/settings/notifications/page.tsx` | 알림 설정 페이지 |
| `components/settings/company-edit-modal.tsx` | contactEmail 편집 모달 |
| `components/notifications/notification-log-table.tsx` | 발송 기록 테이블 |
| `components/notifications/notification-timing-toggles.tsx` | 알림 시점 토글 |
| `app/api/notifications/trigger/route.ts` | BFF — trigger proxy |
| `app/api/notifications/logs/route.ts` | BFF — logs proxy |
| `types/notification.ts` | Zod 스키마 + 타입 |
| `lib/queries/use-notifications.ts` | React Query 훅 |
| `mocks/handlers/notifications.ts` | MSW 핸들러 |

---

## DoD (완료 조건)

- [ ] 사이드바 6개 카테고리 + 메뉴 7개 정상 표시
- [ ] /settings/company → 사업장 선택 드롭다운 변경 시 자동 콘텐츠 갱신
- [ ] /settings/company → "정보 수정" 모달에서 contactEmail 편집 + 저장
- [ ] /settings/notifications → 알림 시점 토글 localStorage 저장/복원
- [ ] /settings/notifications → 수동 트리거 버튼 동작 + 토스트
- [ ] /settings/notifications → 발송 기록 테이블 표시 (MSW 목업)
- [ ] 시뮬레이터 라벨 "E-9 고용허가 시뮬레이터" + 안내 박스 표시
- [ ] 대시보드 타임라인 → 알림 설정 딥링크
- [ ] Vitest 통과
- [ ] 기존 페이지 regression 없음
