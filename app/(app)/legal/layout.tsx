"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
const TABS = [
  { href: "/legal/changes", label: "법령 변경" },
  { href: "/legal/reports", label: "리포트" },
] as const;
export default function LegalLayout({ children }: { readonly children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">법령·리포트</h1>
      <nav className="flex gap-4 border-b">
        {TABS.map(({ href, label }) => {
          const isActive = pathname.startsWith(href);
          return (
            <Link key={href} href={href} className={cn("border-b-2 px-1 pb-2 text-sm font-medium transition-colors", isActive ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground")}>{label}</Link>
          );
        })}
      </nav>
      {children}
    </div>
  );
}
