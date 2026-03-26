"use client";

import { toast } from "sonner";
import type { LegalAction } from "@/types/legal";
import { cn } from "@/lib/utils";

interface ActionRowProps {
  readonly actions: readonly LegalAction[];
}

export function ActionRow({ actions }: ActionRowProps) {
  return (
    <div className="flex gap-2 pt-2">
      {actions.map((action) => (
        <button
          key={action.label}
          type="button"
          onClick={() => toast("준비 중입니다")}
          className={cn(
            "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
            action.primary
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "border border-border text-foreground hover:bg-secondary",
          )}
        >
          {action.label}
        </button>
      ))}
    </div>
  );
}
