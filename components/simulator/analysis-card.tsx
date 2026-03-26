"use client";

import { useState } from "react";
import { BarChart3, Factory, Globe, ChevronDown, ChevronUp, type LucideIcon } from "lucide-react";
import DOMPurify from "isomorphic-dompurify";
import { Card, CardContent } from "@/components/ui/card";
import type { AnalysisSection, SignalColor, ProgressLevel } from "@/types/simulator";

// ─── Icon Mapping ─────────────────────────────────────────────────────────────

const iconMap: Record<string, LucideIcon> = { BarChart3, Factory, Globe };

// ─── Color Mappings ──────────────────────────────────────────────────────────

const sectionBgColors: Record<string, string> = {
  quota: "bg-signal-blue-bg text-signal-blue",
  competition: "bg-signal-orange-bg text-signal-orange",
  nationality: "bg-signal-green-bg text-signal-green",
};

const badgeColors: Record<SignalColor, string> = {
  green: "bg-signal-green-bg text-signal-green",
  orange: "bg-signal-orange-bg text-signal-orange",
  red: "bg-signal-red-bg text-signal-red",
  blue: "bg-signal-blue-bg text-signal-blue",
  yellow: "bg-signal-yellow-bg text-signal-yellow",
  gray: "bg-signal-gray-bg text-signal-gray",
};

const progressColors: Record<ProgressLevel, string> = {
  low: "bg-signal-green",
  mid: "bg-signal-orange",
  high: "bg-signal-red",
};

// ─── Props ───────────────────────────────────────────────────────────────────

interface AnalysisCardProps {
  readonly section: AnalysisSection;
  readonly defaultOpen?: boolean;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function AnalysisCard({ section, defaultOpen = false }: AnalysisCardProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const Icon = iconMap[section.icon] ?? BarChart3;
  const iconBgClass = sectionBgColors[section.id] ?? "bg-signal-gray-bg text-signal-gray";
  const badgeClass = badgeColors[section.badge.color];

  const sanitizedInsight = DOMPurify.sanitize(section.aiInsight, {
    ALLOWED_TAGS: ["strong", "em", "br"],
    ALLOWED_ATTR: [],
  });

  return (
    <Card>
      <CardContent className="p-0">
        {/* Header */}
        <button
          type="button"
          className="flex w-full items-center gap-3 px-4 py-3 text-left"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
        >
          {/* Icon */}
          <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${iconBgClass}`}>
            <Icon size={16} />
          </span>

          {/* Title */}
          <span className="flex-1 font-medium">{section.title}</span>

          {/* Badge */}
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${badgeClass}`}>
            {section.badge.text}
          </span>

          {/* Chevron */}
          {isOpen ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
        </button>

        {/* Body */}
        {isOpen && (
          <div data-slot="analysis-body" className="space-y-4 border-t px-4 pb-4 pt-3">
            {/* Data Rows */}
            {section.dataRows.length > 0 && (
              <div className="grid grid-cols-2 gap-y-2">
                {section.dataRows.map((row) => (
                  <div key={row.key} className="contents">
                    <span className="text-sm text-muted-foreground">{row.key}</span>
                    <span className="text-right text-sm font-medium">{row.value}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Progress Bar */}
            {section.progress !== null && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{section.progress.label}</span>
                </div>
                <div
                  role="progressbar"
                  aria-valuenow={section.progress.value}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${section.progress.label} ${section.progress.value}%`}
                  className="h-2 w-full rounded-full bg-muted"
                >
                  <div
                    className={`h-2 rounded-full ${progressColors[section.progress.level]}`}
                    style={{ width: `${section.progress.value}%` }}
                  />
                </div>
              </div>
            )}

            {/* Data Source Chips */}
            {section.dataSources.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {section.dataSources.map((src) => (
                  <span
                    key={src.dataId}
                    title={src.dataId}
                    className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground"
                  >
                    {src.name}
                  </span>
                ))}
              </div>
            )}

            {/* AI Insight - content sanitized with DOMPurify (ALLOWED_TAGS: strong/em/br, ALLOWED_ATTR: []) */}
            {sanitizedInsight && (
              <div
                className="text-sm text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: sanitizedInsight }}
              />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
