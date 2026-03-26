"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/legal-changes", label: "법령 변경 알림" },
  { href: "/reports", label: "컴플라이언스 리포트" },
] as const;

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="space-y-6">
      <div className="inline-flex rounded-lg bg-secondary p-1">
        {TABS.map(({ href, label }) => {
          const isActive = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "rounded-md px-4 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {label}
            </Link>
          );
        })}
      </div>
      {children}
    </div>
  );
}
