# 에러 다이얼로그 — 설계 문서

> 작성일: 2026-04-22 | 관련: 글로벌 에러 표시 UX 개선

---

## 배경

현재 에러가 sonner 토스트로 우측 상단에 잠깐 표시되고 자동 소멸된다. 사용자가 에러를 인지하지 못하고 넘어갈 수 있다. 에러는 화면 중앙 다이얼로그로 표시하여 사용자가 반드시 확인하도록 변경한다.

---

## 설계

### 대상

- `toast.error` → 중앙 AlertDialog + 확인 버튼
- `toast.success` → 기존 토스트 유지 (변경 없음)

### 구현 방식

`providers.tsx` 내부에서 글로벌 에러 상태 관리:

```
QueryCache onError → setGlobalError(message) → ErrorDialog 표시
MutationCache onError → setGlobalError(message) → ErrorDialog 표시
"확인" 클릭 → setGlobalError(null) → 닫힘
```

별도 context 불필요. `providers.tsx`가 앱 전체를 감싸고 있으므로 내부 state + 형제 컴포넌트로 충분.

### ErrorDialog 컴포넌트

shadcn/ui `AlertDialog` 사용:

```tsx
// components/common/error-dialog.tsx
interface ErrorDialogProps {
  readonly message: string | null;
  readonly onClose: () => void;
}

export function ErrorDialog({ message, onClose }: ErrorDialogProps) {
  return (
    <AlertDialog open={message !== null}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>오류</AlertDialogTitle>
          <AlertDialogDescription>{message}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={onClose}>확인</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

### providers.tsx 변경

```tsx
const [globalError, setGlobalError] = useState<string | null>(null);

// QueryCache/MutationCache onError:
// toast.error(message) → setGlobalError(message)

// JSX에 ErrorDialog 추가:
<ErrorDialog message={globalError} onClose={() => setGlobalError(null)} />
```

---

## 변경 범위

| 파일 | 변경 |
|------|------|
| `components/common/error-dialog.tsx` | 신규 생성 — AlertDialog 기반 에러 다이얼로그 |
| `components/providers.tsx` | `toast.error` → `setGlobalError`, ErrorDialog 렌더링 |
| `__tests__/components/providers.test.tsx` | 에러 시 다이얼로그 표시 + 확인 클릭 시 닫힘 테스트 |

---

## 테스트

| 테스트 | 검증 |
|--------|------|
| ErrorDialog에 message 전달 시 다이얼로그 표시 | `screen.getByText("오류")` + message 텍스트 |
| 확인 클릭 시 onClose 호출 | `onClose` mock 확인 |
| message가 null이면 다이얼로그 미표시 | `queryByText("오류")` null |

---

## 범위 외

- 개별 컴포넌트의 `toast.success` — 변경 없음
- 개별 컴포넌트의 `toast.error` (worker-form 등) — 글로벌 캐시에서 이미 처리하므로 중복 토스트 제거는 이전 PR (#40 글로벌 에러 토스트 도입)에서 완료됨
- 에러 다이얼로그 "다시 시도" 버튼 — React Query 자동 재시도로 충분
