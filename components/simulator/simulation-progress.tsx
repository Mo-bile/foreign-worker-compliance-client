"use client";

import { useEffect, useState } from "react";
import { Database, Brain, FileCheck } from "lucide-react";

const STEPS = [
  { label: "데이터 수집 중...", icon: Database, duration: 2000 },
  { label: "AI 분석 중...", icon: Brain, duration: 6000 },
  { label: "결과 생성 중...", icon: FileCheck, duration: 2000 },
] as const;

const TOTAL_DURATION = STEPS.reduce((sum, s) => sum + s.duration, 0);

function getStepAndProgress(elapsed: number): { stepIndex: number; percent: number } {
  let cumulative = 0;
  for (let i = 0; i < STEPS.length; i++) {
    cumulative += STEPS[i]!.duration;
    if (elapsed < cumulative) {
      return {
        stepIndex: i,
        percent: Math.min(Math.round((elapsed / TOTAL_DURATION) * 90), 90),
      };
    }
  }
  return { stepIndex: STEPS.length - 1, percent: 90 };
}

interface SimulationProgressProps {
  readonly isPending: boolean;
}

export function SimulationProgress({ isPending }: SimulationProgressProps) {
  const [elapsed, setElapsed] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!isPending) {
      if (elapsed > 0) {
        setDone(true);
        const timeout = setTimeout(() => {
          setElapsed(0);
          setDone(false);
        }, 600);
        return () => clearTimeout(timeout);
      }
      return;
    }

    setDone(false);
    setElapsed(0);
    const interval = setInterval(() => {
      setElapsed((prev) => prev + 100);
    }, 100);
    return () => clearInterval(interval);
  }, [isPending]);

  if (!isPending && !done) return null;

  const { stepIndex, percent } = done
    ? { stepIndex: STEPS.length - 1, percent: 100 }
    : getStepAndProgress(elapsed);

  const currentStep = STEPS[stepIndex]!;
  const StepIcon = currentStep.icon;

  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          <StepIcon className="h-5 w-5 animate-pulse text-primary" />
        </div>
        <div>
          <p className="text-sm font-medium">{done ? "분석 완료!" : currentStep.label}</p>
          <p className="text-xs text-muted-foreground">
            {done
              ? "결과를 표시합니다"
              : `${stepIndex + 1} / ${STEPS.length} 단계`}
          </p>
        </div>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all duration-300 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="mt-3 flex justify-between">
        {STEPS.map((step, i) => {
          const isActive = i === stepIndex && !done;
          const isCompleted = i < stepIndex || done;
          return (
            <div key={step.label} className="flex items-center gap-1.5">
              <div
                className={`h-2 w-2 rounded-full ${
                  isCompleted
                    ? "bg-primary"
                    : isActive
                      ? "animate-pulse bg-primary"
                      : "bg-muted-foreground/30"
                }`}
              />
              <span
                className={`text-xs ${
                  isCompleted || isActive
                    ? "text-foreground"
                    : "text-muted-foreground/50"
                }`}
              >
                {step.label.replace("...", "")}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
