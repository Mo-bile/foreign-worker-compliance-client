# Dark Mode / Light Mode 테마 전환 설계

## 개요

외국인 근로자 고용 컴플라이언스 관리 시스템(고용지킴이)에 다크/라이트 테마 전환 기능을 추가한다. 기존에 설치된 `next-themes` 패키지와 globals.css의 `.dark` CSS 변수를 활용하되, 색감을 Slate(Blue-Gray) 톤으로 변경하여 자연스러운 다크/라이트 경험을 제공한다.

## 결정 사항

| 항목 | 결정 | 근거 |
|------|------|------|
| 기본 테마 | 라이트 | 사용자가 수동 전환 |
| 토글 방식 | 라이트 ↔ 다크 (2가지) | 시스템 모드 불필요, 심플하게 유지 |
| 토글 위치 | 헤더 우측, 아바타 왼쪽 | 항상 접근 가능, 기존 레이아웃과 조화 |
| 토글 UI | `Button(variant="ghost", size="icon")` + Sun/Moon Lucide 아이콘 | 기존 shadcn/ui 스타일과 일관성 |
| 라이트 색감 | Slate Light (Blue-White) | 미세한 블루 틴트로 눈 편안함 |
| 다크 색감 | Slate Dark (Blue-Gray) | 푸른빛 감도는 부드러운 다크, Notion/Linear 스타일 |
| 전환 효과 | CSS transition 0.2s (color, background-color) | 부드러운 전환 |
| 테마 저장 | localStorage | next-themes 기본 동작 |

## 아키텍처

### 데이터 흐름

```
ThemeProvider (providers.tsx)
  ├─ attribute="class"  →  <html class="dark">에 .dark 클래스 토글
  ├─ defaultTheme="light"
  ├─ enableSystem={false}
  └─ localStorage에 테마 저장/복원

ThemeToggle (theme-toggle.tsx)
  ├─ useTheme() 훅으로 현재 테마 읽기
  ├─ setTheme("light" | "dark") 호출
  └─ Sun ↔ Moon 아이콘 전환

globals.css
  ├─ :root → Slate Light 팔레트 (Blue-White)
  └─ .dark → Slate Dark 팔레트 (Blue-Gray)
```

### FOUC 방지

`next-themes`는 `<html>`에 인라인 스크립트를 삽입하여 localStorage에서 테마를 읽고 페이지 렌더링 전에 적용한다. 이를 위해 `<html>` 태그에 `suppressHydrationWarning` 속성이 필요하다.

## 변경 파일

### 1. `app/layout.tsx`

`<html>` 태그에 `suppressHydrationWarning` 속성 추가.

```tsx
// Before
<html lang="ko" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>

// After
<html lang="ko" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
```

### 2. `components/providers.tsx`

`next-themes`의 `ThemeProvider`를 최상위에 래핑.

```tsx
import { ThemeProvider } from "next-themes";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange={false}
    >
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
```

이 변경으로 기존 `components/ui/sonner.tsx`의 `useTheme()` 런타임 에러도 자동 해결된다.

### 3. `components/layout/theme-toggle.tsx` (신규)

```tsx
"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-transform dark:rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
      <span className="sr-only">테마 전환</span>
    </Button>
  );
}
```

**설계 포인트:**
- Sun/Moon 아이콘이 CSS transform으로 교차 전환 (rotate + scale)
- `sr-only`로 스크린 리더 접근성 확보
- `absolute` 포지셔닝으로 두 아이콘을 겹침 (Button에 `relative` 추가 필수)

### 4. `components/layout/header.tsx`

아바타 왼쪽에 `ThemeToggle` 삽입.

```tsx
import { ThemeToggle } from "@/components/layout/theme-toggle";

// header 내부 ml-auto 영역:
<div className="ml-auto flex items-center gap-2">
  <ThemeToggle />
  <Avatar className="h-8 w-8">
    <AvatarFallback>HR</AvatarFallback>
  </Avatar>
</div>
```

### 5. `app/globals.css`

#### 5-1. `:root` — Slate Light 팔레트

현재 무채색(chroma 0)에서 Slate 톤(미세한 블루 틴트)으로 변경:

| 변수 | Before (Neutral) | After (Slate Light) |
|------|-------------------|---------------------|
| `--background` | `oklch(1 0 0)` | `oklch(0.984 0.003 247)` |
| `--foreground` | `oklch(0.145 0 0)` | `oklch(0.129 0.042 264)` |
| `--card` | `oklch(1 0 0)` | `oklch(1 0 0)` |
| `--card-foreground` | `oklch(0.145 0 0)` | `oklch(0.129 0.042 264)` |
| `--popover` | `oklch(1 0 0)` | `oklch(1 0 0)` |
| `--popover-foreground` | `oklch(0.145 0 0)` | `oklch(0.129 0.042 264)` |
| `--primary` | `oklch(0.205 0 0)` | `oklch(0.208 0.042 265)` |
| `--primary-foreground` | `oklch(0.985 0 0)` | `oklch(0.984 0.003 247)` |
| `--secondary` | `oklch(0.97 0 0)` | `oklch(0.968 0.007 247)` |
| `--secondary-foreground` | `oklch(0.205 0 0)` | `oklch(0.208 0.042 265)` |
| `--muted` | `oklch(0.97 0 0)` | `oklch(0.968 0.007 247)` |
| `--muted-foreground` | `oklch(0.556 0 0)` | `oklch(0.554 0.022 257)` |
| `--accent` | `oklch(0.97 0 0)` | `oklch(0.968 0.007 247)` |
| `--accent-foreground` | `oklch(0.205 0 0)` | `oklch(0.208 0.042 265)` |
| `--border` | `oklch(0.922 0 0)` | `oklch(0.918 0.011 249)` |
| `--input` | `oklch(0.922 0 0)` | `oklch(0.918 0.011 249)` |
| `--ring` | `oklch(0.708 0 0)` | `oklch(0.704 0.022 261)` |
| `--sidebar` | `oklch(0.985 0 0)` | `oklch(0.968 0.007 247)` |
| `--sidebar-foreground` | `oklch(0.145 0 0)` | `oklch(0.129 0.042 264)` |
| `--sidebar-primary` | `oklch(0.205 0 0)` | `oklch(0.208 0.042 265)` |
| `--sidebar-primary-foreground` | `oklch(0.985 0 0)` | `oklch(0.984 0.003 247)` |
| `--sidebar-accent` | `oklch(0.97 0 0)` | `oklch(0.918 0.011 249)` |
| `--sidebar-accent-foreground` | `oklch(0.205 0 0)` | `oklch(0.208 0.042 265)` |
| `--sidebar-border` | `oklch(0.922 0 0)` | `oklch(0.918 0.011 249)` |
| `--sidebar-ring` | `oklch(0.708 0 0)` | `oklch(0.704 0.022 261)` |

#### 5-2. `.dark` — Slate Dark 팔레트

| 변수 | Before (Neutral) | After (Slate Dark) |
|------|-------------------|---------------------|
| `--background` | `oklch(0.145 0 0)` | `oklch(0.129 0.042 264)` |
| `--foreground` | `oklch(0.985 0 0)` | `oklch(0.966 0.007 264)` |
| `--card` | `oklch(0.205 0 0)` | `oklch(0.208 0.042 265)` |
| `--card-foreground` | `oklch(0.985 0 0)` | `oklch(0.966 0.007 264)` |
| `--popover` | `oklch(0.205 0 0)` | `oklch(0.208 0.042 265)` |
| `--popover-foreground` | `oklch(0.985 0 0)` | `oklch(0.966 0.007 264)` |
| `--primary` | `oklch(0.922 0 0)` | `oklch(0.918 0.011 249)` |
| `--primary-foreground` | `oklch(0.205 0 0)` | `oklch(0.208 0.042 265)` |
| `--secondary` | `oklch(0.269 0 0)` | `oklch(0.279 0.041 260)` |
| `--secondary-foreground` | `oklch(0.985 0 0)` | `oklch(0.966 0.007 264)` |
| `--muted` | `oklch(0.269 0 0)` | `oklch(0.279 0.041 260)` |
| `--muted-foreground` | `oklch(0.708 0 0)` | `oklch(0.704 0.022 261)` |
| `--accent` | `oklch(0.269 0 0)` | `oklch(0.279 0.041 260)` |
| `--accent-foreground` | `oklch(0.985 0 0)` | `oklch(0.966 0.007 264)` |
| `--border` | `oklch(1 0 0 / 10%)` | `oklch(0.918 0.011 249 / 12%)` |
| `--input` | `oklch(1 0 0 / 15%)` | `oklch(0.918 0.011 249 / 18%)` |
| `--ring` | `oklch(0.556 0 0)` | `oklch(0.554 0.022 257)` |
| `--sidebar` | `oklch(0.205 0 0)` | `oklch(0.160 0.042 264)` |
| `--sidebar-foreground` | `oklch(0.985 0 0)` | `oklch(0.966 0.007 264)` |
| `--sidebar-primary` | `oklch(0.488 0.243 264.376)` | `oklch(0.488 0.243 264.376)` |
| `--sidebar-primary-foreground` | `oklch(0.985 0 0)` | `oklch(0.966 0.007 264)` |
| `--sidebar-accent` | `oklch(0.269 0 0)` | `oklch(0.279 0.041 260)` |
| `--sidebar-accent-foreground` | `oklch(0.985 0 0)` | `oklch(0.966 0.007 264)` |
| `--sidebar-border` | `oklch(1 0 0 / 10%)` | `oklch(0.918 0.011 249 / 12%)` |
| `--sidebar-ring` | `oklch(0.556 0 0)` | `oklch(0.554 0.022 257)` |

#### 5-3. 변경하지 않는 변수

`--chart-1` ~ `--chart-5`와 `--destructive`는 의도적으로 변경하지 않는다. 차트 색상은 데이터 시각화의 가독성이 우선이고, destructive(빨간색)는 경고 의미가 색조와 무관하게 유지되어야 하기 때문이다.

#### 5-4. 전환 애니메이션

`@layer base` 블록의 `*` 셀렉터에 transition 추가:

```css
@layer base {
  * {
    @apply border-border outline-ring/50;
    transition: color 0.2s ease, background-color 0.2s ease, border-color 0.2s ease;
  }
}
```

## 테스트 전략

### 단위 테스트 (Vitest + Testing Library)
- **ThemeToggle**: 클릭 시 `setTheme` 호출 확인, 라이트→Moon / 다크→Sun 아이콘 렌더링 확인
- **Providers**: ThemeProvider 래핑 후 `useTheme()` 훅 정상 동작 확인

### 통합 테스트
- Sonner Toaster가 ThemeProvider 컨텍스트 내에서 `useTheme()` 에러 없이 동작하는지 확인

### E2E 테스트 (Playwright)
- 토글 클릭 → `<html>` 태그에 `.dark` 클래스 추가/제거 확인
- 페이지 새로고침 후 선택한 테마 유지 확인 (localStorage)
- 라이트/다크 전환 시 주요 컴포넌트(사이드바, 카드, 헤더)의 배경색 변경 확인

## 기존 문제 해결

- `components/ui/sonner.tsx`에서 `useTheme()`를 호출하는데 `ThemeProvider`가 없어서 런타임 에러 가능성이 있었음. ThemeProvider 추가로 자동 해결.
