"use client";

import { useState, useMemo } from "react";
import { CheckCircle, Activity, Lightbulb, Loader2, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { E9_NATIONALITIES, DESIRED_TIMINGS, DESIRED_TIMING_LABELS } from "@/types/simulator";
import { NATIONALITY_LABELS } from "@/types/api";
import type { SimulationRequest } from "@/types/simulator";
import type { CompanyResponse } from "@/types/api";
import { useMetadata } from "@/lib/queries/use-metadata";

interface SimulationFormProps {
  readonly company: CompanyResponse | null;
  readonly onSubmit: (data: SimulationRequest) => void;
  readonly isPending: boolean;
}

export function SimulationForm({ company, onSubmit, isPending }: SimulationFormProps) {
  const [desiredWorkers, setDesiredWorkers] = useState<number>(1);
  const [preferredNationality, setPreferredNationality] = useState<string>("");
  const [desiredTiming, setDesiredTiming] = useState<(typeof DESIRED_TIMINGS)[number] | "">("");
  const [domesticInsuredCount, setDomesticInsuredCount] = useState<number>(
    company?.domesticInsuredCount ?? 0,
  );
  const [selectedScoringCodes, setSelectedScoringCodes] = useState<Set<string>>(new Set());
  const { data: metadata, isError: isMetadataError } = useMetadata();

  const nationalityLabelMap = metadata
    ? Object.fromEntries(metadata.nationalities.map((n) => [n.code, n.koreanName]))
    : (NATIONALITY_LABELS as Record<string, string>);

  const scoringPolicies = metadata?.scoringPolicies ?? [];

  const deductionScore = useMemo(() => {
    let total = 0;
    for (const policy of scoringPolicies) {
      if (policy.isDeduction && selectedScoringCodes.has(policy.code)) {
        total += policy.score;
      }
    }
    return total;
  }, [scoringPolicies, selectedScoringCodes]);

  const isSubmitDisabled =
    isPending ||
    !Number.isFinite(desiredWorkers) ||
    desiredWorkers < 1 ||
    desiredTiming === "" ||
    domesticInsuredCount < 1;

  function handleScoringToggle(code: string) {
    setSelectedScoringCodes((prev) => {
      const next = new Set(prev);
      if (next.has(code)) {
        next.delete(code);
      } else {
        next.add(code);
      }
      return next;
    });
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (desiredTiming === "") return;

    const request: SimulationRequest = {
      desiredWorkers,
      preferredNationality: preferredNationality === "" ? undefined : preferredNationality,
      desiredTiming,
      domesticInsuredCount,
      appliedScoringCodes: [...selectedScoringCodes],
      deductionScore,
    };

    onSubmit(request);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-[15px]">
          <Lightbulb className="h-[18px] w-[18px]" />
          시뮬레이션 조건
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Section 1: Auto-fill box */}
          {company !== null && (
            <div className="rounded-lg bg-signal-blue-bg p-3">
              <div className="mb-1 flex items-center gap-1.5">
                <CheckCircle className="h-3.5 w-3.5 text-signal-blue" />
                <span className="text-xs font-semibold text-signal-blue">
                  사업장 정보에서 자동 입력됨
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {company.regionName} · {company.industryCategoryName} · 상시근로자{" "}
                {company.employeeCount}명
              </p>
            </div>
          )}

          {/* Section 2: 고용 한도 계산용 */}
          <div className="rounded-lg border border-signal-blue/20 bg-signal-blue-bg p-4">
            <div className="mb-3 flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5 text-signal-blue" />
              <span className="text-xs font-semibold text-signal-blue">고용 한도 계산용</span>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label htmlFor="domesticInsuredCount" className="text-[13px] font-medium">
                  내국인 피보험자 수 <span className="text-signal-red">*</span>
                </label>
                <input
                  id="domesticInsuredCount"
                  type="number"
                  min={1}
                  required
                  value={domesticInsuredCount}
                  onChange={(e) => {
                    const parsed = Number(e.target.value);
                    setDomesticInsuredCount(Number.isFinite(parsed) ? parsed : 0);
                  }}
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <span className="text-[11px] text-muted-foreground">
                  고용보험 가입된 내국인 근로자 수
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[13px] font-medium">현재 고용 중인 외국인</label>
                <input
                  type="number"
                  value={company?.foreignWorkerCount ?? 0}
                  readOnly
                  className="rounded-md border border-input bg-secondary px-3 py-2 text-sm text-muted-foreground"
                />
                <span className="text-[11px] text-muted-foreground">
                  등록된 근로자 수에서 자동 입력
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[13px] font-medium">사업장 소재지</label>
                <input
                  type="text"
                  value={company?.regionName ?? ""}
                  readOnly
                  className="rounded-md border border-input bg-secondary px-3 py-2 text-sm text-muted-foreground"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Basic fields */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="desiredWorkers" className="text-[13px] font-medium">
              희망 채용 인원 <span className="text-signal-red">*</span>
            </label>
            <input
              id="desiredWorkers"
              type="number"
              min={1}
              max={50}
              required
              value={desiredWorkers}
              onChange={(e) => {
                const parsed = Number(e.target.value);
                setDesiredWorkers(Number.isFinite(parsed) ? parsed : 0);
              }}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="preferredNationality" className="text-[13px] font-medium">
              희망 국적
            </label>
            <select
              id="preferredNationality"
              value={preferredNationality}
              onChange={(e) => setPreferredNationality(e.target.value)}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">무관 (미지정)</option>
              {E9_NATIONALITIES.map((nat) => (
                <option key={nat} value={nat}>
                  {nationalityLabelMap[nat] ?? nat}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="desiredTiming" className="text-[13px] font-medium">
              희망 시기
            </label>
            <select
              id="desiredTiming"
              value={desiredTiming}
              onChange={(e) =>
                setDesiredTiming(e.target.value as (typeof DESIRED_TIMINGS)[number] | "")
              }
              required
              className="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="" disabled>
                선택해주세요
              </option>
              {DESIRED_TIMINGS.map((timing) => (
                <option key={timing} value={timing}>
                  {DESIRED_TIMING_LABELS[timing]}
                </option>
              ))}
            </select>
          </div>

          {/* Section 4: Scoring checkboxes */}
          <div className="rounded-lg border border-border bg-muted p-4">
            <div className="mb-2 flex items-center gap-1.5">
              <span className="text-xs font-semibold">✨ 배정 점수 시뮬레이션</span>
              <span title="고용허가제는 점수가 높은 사업장부터 순차 배정됩니다">
                <Info className="h-4 w-4 cursor-help text-muted-foreground" />
              </span>
            </div>
            {isMetadataError && (
              <p className="mb-2 text-xs text-destructive">
                배정 점수 항목을 불러오지 못했습니다. 페이지를 새로고침해주세요.
              </p>
            )}
            <div className="flex flex-col gap-2.5">
              {scoringPolicies.map((policy) => (
                <label
                  key={policy.code}
                  className="flex cursor-pointer items-center gap-2 text-[13px]"
                >
                  <input
                    type="checkbox"
                    checked={selectedScoringCodes.has(policy.code)}
                    onChange={() => handleScoringToggle(policy.code)}
                    className="h-4 w-4 cursor-pointer"
                  />
                  <span className={policy.isDeduction ? "text-signal-red" : undefined}>
                    {policy.label}{" "}
                    <span
                      className={
                        policy.isDeduction
                          ? "font-semibold text-signal-red"
                          : "font-semibold text-signal-green"
                      }
                    >
                      ({policy.isDeduction ? `-${policy.score}점` : `+${policy.score}점`})
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitDisabled}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
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

          <p className="text-center text-[10px] text-muted-foreground">
            시뮬레이션 결과는 공공데이터 기반 추정이며
            <br />
            실제 배정 결과와 다를 수 있습니다.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
