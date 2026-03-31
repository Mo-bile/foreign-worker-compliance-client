"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface CollapsibleCardProps {
  readonly icon: ReactNode;
  readonly iconColorClass: string;
  readonly title: string;
  readonly badge?: ReactNode;
  readonly defaultOpen?: boolean;
  readonly muted?: boolean;
  readonly children: ReactNode;
}

export function CollapsibleCard({
  icon,
  iconColorClass,
  title,
  badge,
  defaultOpen = false,
  muted = false,
  children,
}: CollapsibleCardProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border bg-card",
        muted && "opacity-50",
      )}
    >
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center gap-2.5 border-b border-transparent px-5 py-4 text-left transition-colors duration-150 hover:bg-secondary"
        style={isOpen ? { borderBottomColor: "var(--border)" } : undefined}
        aria-expanded={isOpen}
      >
        <div
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-lg text-sm",
            iconColorClass,
          )}
        >
          {icon}
        </div>
        <span className="flex-1 text-sm font-semibold">{title}</span>
        {badge}
        <ChevronDown
          className={cn(
            "h-5 w-5 text-muted-foreground transition-transform duration-200 ease-in-out",
            !isOpen && "-rotate-90",
          )}
        />
      </button>

      {isOpen && <div className="p-5">{children}</div>}
    </div>
  );
}
