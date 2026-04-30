"use client";

import { useState } from "react";
import DOMPurify from "isomorphic-dompurify";

interface CollapsibleInsightProps {
  readonly content: string;
  readonly defaultOpen?: boolean;
}

const PURIFY_CONFIG = {
  ALLOWED_TAGS: ["strong", "em", "br", "p"] as string[],
  ALLOWED_ATTR: ["class"] as string[],
};

export function CollapsibleInsight({ content, defaultOpen = false }: CollapsibleInsightProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  // DOMPurify sanitizes with strict allowlist (strong, em, br, p only) — safe for dangerouslySetInnerHTML
  const sanitized = DOMPurify.sanitize(content, PURIFY_CONFIG);

  return (
    <div className="space-y-2">
      <button
        type="button"
        className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
      >
        {isOpen ? "✦ AI 안내 닫기" : "✦ AI 안내 보기"}
      </button>
      {isOpen && (
        <div
          className="rounded-md bg-secondary p-3 text-sm text-muted-foreground [&_strong]:text-foreground [&_strong]:font-semibold"
          dangerouslySetInnerHTML={{ __html: sanitized }}
        />
      )}
    </div>
  );
}
