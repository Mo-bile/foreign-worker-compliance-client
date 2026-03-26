"use client";

import { useState } from "react";
import { CheckCircle, Lightbulb, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { E9_NATIONALITIES, PREFERRED_PERIODS, PREFERRED_PERIOD_LABELS } from "@/types/simulator";
import { NATIONALITY_LABELS } from "@/types/api";
import type { SimulationRequest } from "@/types/simulator";
import type { CompanyResponse } from "@/types/api";

interface SimulationFormProps {
  readonly company: CompanyResponse | null;
  readonly onSubmit: (data: SimulationRequest) => void;
  readonly isPending: boolean;
}

export function SimulationForm({ company, onSubmit, isPending }: SimulationFormProps) {
  const [desiredCount, setDesiredCount] = useState<number>(1);
  const [preferredNationality, setPreferredNationality] = useState<string>("");
  const [preferredPeriod, setPreferredPeriod] = useState<string>("");

  const isSubmitDisabled = isPending || desiredCount < 1 || preferredPeriod === "";

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const request: SimulationRequest = {
      desiredCount,
      preferredNationality: preferredNationality === "" ? undefined : preferredNationality,
      preferredPeriod: preferredPeriod as (typeof PREFERRED_PERIODS)[number],
    };

    onSubmit(request);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>고용 시뮬레이션</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {company !== null && (
            <div className="rounded-lg bg-[var(--signal-blue-bg)] p-4">
              <div className="mb-2 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-signal-blue" />
                <span className="text-sm font-medium text-signal-blue">자동 입력</span>
              </div>
              <p className="text-sm text-muted-foreground">
                지역: {company.regionName} | 업종: {company.industryCategoryName} | 직원:{" "}
                {company.employeeCount}명 | 외국인: {company.foreignWorkerCount}명
              </p>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label htmlFor="desiredCount" className="text-sm font-medium">
              희망 고용인원
            </label>
            <input
              id="desiredCount"
              type="number"
              min={1}
              max={50}
              required
              value={desiredCount}
              onChange={(e) => setDesiredCount(Number(e.target.value))}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="preferredNationality" className="text-sm font-medium">
              선호 국적
            </label>
            <select
              id="preferredNationality"
              value={preferredNationality}
              onChange={(e) => setPreferredNationality(e.target.value)}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">전체 (미지정)</option>
              {E9_NATIONALITIES.map((nat) => (
                <option key={nat} value={nat}>
                  {NATIONALITY_LABELS[nat]}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="preferredPeriod" className="text-sm font-medium">
              희망 시기
            </label>
            <select
              id="preferredPeriod"
              value={preferredPeriod}
              onChange={(e) => setPreferredPeriod(e.target.value)}
              required
              className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="" disabled>
                선택해주세요
              </option>
              {PREFERRED_PERIODS.map((period) => (
                <option key={period} value={period}>
                  {PREFERRED_PERIOD_LABELS[period]}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={isSubmitDisabled}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>분석 중...</span>
              </>
            ) : (
              <>
                <Lightbulb className="h-4 w-4" />
                <span>시뮬레이션 실행</span>
              </>
            )}
          </button>

          <p className="mt-3 text-xs text-muted-foreground">
            AI 기반 분석 결과이며, 실제 배정 결과와 다를 수 있습니다.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
