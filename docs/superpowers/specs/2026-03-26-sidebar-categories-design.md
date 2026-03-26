# 사이드바 카테고리 그룹 라벨 적용

> GitHub Issue: #14
> 작성일: 2026-03-26

## 목표

현재 플랫 리스트(8개 항목)인 사이드바 네비게이션에 카테고리별 그룹 라벨을 추가하여 디자인 목업과 일치시킨다.

## 변경 범위

**수정 파일:** `components/layout/sidebar.tsx` (1개)

## 데이터 구조

기존 `NAV_ITEMS` 플랫 배열을 `NAV_SECTIONS` 그룹 배열로 변경:

```typescript
interface NavItem {
  readonly href: string;
  readonly label: string;
  readonly icon: LucideIcon;
}

interface NavSection {
  readonly label: string;
  readonly items: readonly NavItem[];
}

const NAV_SECTIONS: readonly NavSection[] = [
  { label: "메인", items: [{ href: "/", label: "대시보드", icon: LayoutDashboard }] },
  { label: "고용 전", items: [{ href: "/simulator", label: "고용허가 시뮬레이터", icon: Lightbulb }] },
  { label: "고용 후", items: [
    { href: "/benchmark", label: "사업장 건강검진", icon: BarChart3 },
    { href: "/companies", label: "사업장 관리", icon: Building2 },
    { href: "/workers", label: "근로자 관리", icon: Users },
  ]},
  { label: "지속 관리", items: [
    { href: "/compliance", label: "데드라인 관리", icon: AlertTriangle },
    { href: "/legal-changes", label: "법령 변경 알림", icon: FileText },
    { href: "/reports", label: "컴플라이언스 리포트", icon: ClipboardList },
  ]},
];
```

## 섹션 타이틀 스타일링

목업 CSS와 1:1 대응:

| 목업 CSS | Tailwind |
|----------|----------|
| `font-size: 10px` | `text-[10px]` |
| `font-weight: 600` | `font-semibold` |
| `letter-spacing: 0.08em` | `tracking-[0.08em]` |
| `color: var(--sidebar-muted)` | `text-sidebar-muted` |

## 렌더링

`NAV_SECTIONS.map()` → 섹션별로 라벨 + `items.map()` 중첩. 기존 nav item 스타일과 active 판별 로직(`isActive`) 그대로 유지.

## 변경하지 않는 것

- nav item 스타일 (색상, 패딩, 라운딩)
- active 상태 판별 로직
- 반응형 처리 (`hidden md:flex`)
- 다른 파일
