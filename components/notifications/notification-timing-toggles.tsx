"use client";

import { useState, useCallback } from "react";

interface NotificationPrefs {
  readonly d30: boolean;
  readonly d7: boolean;
  readonly overdue: boolean;
}

const DEFAULT_PREFS: NotificationPrefs = { d30: true, d7: true, overdue: true };

function storageKey(companyId: number): string {
  return `fwc:notification-prefs:${companyId}`;
}

function readPrefs(companyId: number): NotificationPrefs {
  try {
    const stored = localStorage.getItem(storageKey(companyId));
    if (stored) return { ...DEFAULT_PREFS, ...JSON.parse(stored) };
  } catch {
    /* ignore parse errors */
  }
  return DEFAULT_PREFS;
}

function writePrefs(companyId: number, prefs: NotificationPrefs): void {
  try {
    localStorage.setItem(storageKey(companyId), JSON.stringify(prefs));
  } catch {
    /* ignore storage errors */
  }
}

const TOGGLE_ITEMS = [
  { key: "d30" as const, label: "D-30 (한 달 전)" },
  { key: "d7" as const, label: "D-7 (일주일 전)" },
  { key: "overdue" as const, label: "기한 초과" },
];

interface NotificationTimingTogglesProps {
  readonly companyId: number;
}

export function NotificationTimingToggles({ companyId }: NotificationTimingTogglesProps) {
  const [prefs, setPrefs] = useState<NotificationPrefs>(() => readPrefs(companyId));

  const handleToggle = useCallback(
    (key: keyof NotificationPrefs) => {
      const updated = { ...prefs, [key]: !prefs[key] };
      setPrefs(updated);
      writePrefs(companyId, updated);
    },
    [prefs, companyId],
  );

  return (
    <div className="space-y-3">
      {TOGGLE_ITEMS.map(({ key, label }) => (
        <label key={key} className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={prefs[key]}
            onChange={() => handleToggle(key)}
            className="h-4 w-4 rounded border-border"
          />
          {label}
        </label>
      ))}
      <p className="text-xs text-muted-foreground">
        ※ 자동 발송은 아직 준비 중입니다.
      </p>
    </div>
  );
}
