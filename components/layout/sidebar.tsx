"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Users,
  Building,
  Lightbulb,
  BarChart3,
  FileText,
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
      { href: "/workers", label: "외국인 근로자 관리", icon: Users },
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
