"use client";

import { useEffect, useMemo, useState } from "react";
import { Database, Brain, FileCheck } from "lucide-react";
import type { AiProgressVariant, ProgressStep } from "@/lib/constants/ai-progress-steps";
import {
  AI_PROGRESS_PRESETS,
  PHASE_RATIO,
  TOTAL_DURATION,
} from "@/lib/constants/ai-progress-steps";

interface TimedStep extends ProgressStep {
  readonly duration: number;
}

function buildTimedSteps(variant: AiProgressVariant): readonly TimedStep[] {
  const preset = AI_PROGRESS_PRESETS[variant];
  const total = TOTAL_DURATION[variant];

  const frontDur = (total * PHASE_RATIO.front) / preset.front.length;
  const middleDur = (total * PHASE_RATIO.middle) / preset.middle.length;
  const backDur = (total * PHASE_RATIO.back) / preset.back.length;

  return [
    ...preset.front.map((s) => ({ ...s, duration: frontDur })),
    ...preset.middle.map((s) => ({ ...s, duration: middleDur })),
    ...preset.back.map((s) => ({ ...s, duration: backDur })),
  ];
}

const ICON_MAP = {
  database: Database,
  brain: Brain,
  file: FileCheck,
} as const;

function getStepAndProgress(
  elapsed: number,
  steps: readonly TimedStep[],
  totalDuration: number,
): { stepIndex: number; percent: number } {
  let cumulative = 0;
  for (let i = 0; i < steps.length; i++) {
    cumulative += steps[i]!.duration;
    if (elapsed < cumulative) {
      return {
        stepIndex: i,
        percent: Math.min(Math.round((elapsed / totalDuration) * 90), 90),
      };
    }
  }
  return { stepIndex: steps.length - 1, percent: 90 };
}

interface AiAnalysisProgressProps {
  readonly variant: AiProgressVariant;
  readonly isPending: boolean;
}

export function AiAnalysisProgress({ variant, isPending }: AiAnalysisProgressProps) {
  const steps = useMemo(() => buildTimedSteps(variant), [variant]);
  const totalDuration = TOTAL_DURATION[variant];

  const [elapsed, setElapsed] = useState(0);
  const [wasPending, setWasPending] = useState(false);

  useEffect(() => {
    if (!isPending) return;

    const startTimeout = setTimeout(() => {
      setWasPending(true);
      setElapsed(0);
    }, 0);
    const interval = setInterval(() => {
      setElapsed((prev) => prev + 100);
    }, 100);
    return () => {
      clearTimeout(startTimeout);
      clearInterval(interval);
    };
  }, [isPending]);

  useEffect(() => {
    if (isPending || !wasPending) return;

    const timeout = setTimeout(() => {
      setElapsed(0);
      setWasPending(false);
    }, 600);
    return () => clearTimeout(timeout);
  }, [isPending, wasPending]);

  const done = !isPending && wasPending && elapsed > 0;
  const { stepIndex, percent } = done
    ? { stepIndex: steps.length - 1, percent: 100 }
    : getStepAndProgress(elapsed, steps, totalDuration);

  if (!isPending && !done) return null;

  const currentStep = steps[stepIndex] ?? steps[steps.length - 1]!;
  const StepIcon = ICON_MAP[currentStep.icon];

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[oklch(0.6_0.15_255)]/10">
          <StepIcon className="h-5 w-5 animate-pulse text-[oklch(0.5_0.12_260)]" />
        </div>
        <div key={stepIndex} className="animate-in fade-in duration-150">
          <p className="text-sm font-medium">{done ? "분석 완료!" : currentStep.label}</p>
          <p className="text-xs text-muted-foreground">
            {done ? "결과를 표시합니다" : currentStep.sub}
          </p>
        </div>
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-[oklch(0.9_0.02_260)]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[oklch(0.6_0.15_255)] to-[oklch(0.55_0.18_300)] transition-all duration-300 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="mt-2 flex justify-between">
        <span className="text-[10px] text-muted-foreground">
          {Math.floor(elapsed / 1000)}초 경과
        </span>
        <span className="text-[10px] text-muted-foreground">
          {done
            ? `${steps.length} / ${steps.length} 단계`
            : `${stepIndex + 1} / ${steps.length} 단계`}
        </span>
      </div>
    </div>
  );
}
