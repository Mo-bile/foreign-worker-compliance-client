"use client";

import { useState, useMemo, useEffect } from "react";
import { CheckCircle, Activity, Lightbulb, Loader2, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { E9_NATIONALITIES, DESIRED_TIMINGS, DESIRED_TIMING_LABELS } from "@/types/simulator";
import { cn } from "@/lib/utils";
import { INDUSTRY_CATEGORY_LABELS, NATIONALITY_LABELS, REGION_LABELS } from "@/types/api";
import type { SimulationRequest } from "@/types/simulator";
import type { CompanyResponse, IndustryCategory } from "@/types/api";
import type { ScoringPolicyItem } from "@/types/metadata";
import { useMetadata } from "@/lib/queries/use-metadata";

interface SimulationFormProps {
  readonly company: CompanyResponse | null;
  readonly onSubmit: (data: SimulationRequest) => void;
  readonly isPending: boolean;
}

const GROUP_LABELS: Record<string, string> = {
  LONG_TENURE: "장기근속",
};

export function SimulationForm({ company, onSubmit, isPending }: SimulationFormProps) {
  const [desiredWorkers, setDesiredWorkers] = useState<number>(1);
  const [preferredNationality, setPreferredNationality] = useState<string>("");
  const [desiredTiming, setDesiredTiming] = useState<(typeof DESIRED_TIMINGS)[number] | "">("");
  const [domesticInsuredCount, setDomesticInsuredCount] = useState<number>(
    company?.domesticInsuredCount ?? 0,
  );
  const [selectedScoringCodes, setSelectedScoringCodes] = useState<Set<string>>(new Set());
  const [selectedGroupChoices, setSelectedGroupChoices] = useState<Record<string, string>>({});
  const { data: metadata, isError: isMetadataError } = useMetadata();

  const nationalityLabelMap = metadata
    ? Object.fromEntries(metadata.nationalities.map((n) => [n.code, n.koreanName]))
    : (NATIONALITY_LABELS as Record<string, string>);

  const scoringPolicies = metadata?.scoringPolicies ?? [];
  const independentPolicies = useMemo(
    () => scoringPolicies.filter((policy) => policy.mutualExclusionGroup === null),
    [scoringPolicies],
  );
  const policyGroups = useMemo(() => {
    const groups = new Map<string, ScoringPolicyItem[]>();

    for (const policy of scoringPolicies) {
      if (policy.mutualExclusionGroup === null) continue;

      const groupPolicies = groups.get(policy.mutualExclusionGroup) ?? [];
      groups.set(policy.mutualExclusionGroup, [...groupPolicies, policy]);
    }

    return groups;
  }, [scoringPolicies]);
  const allSelectedCodes = useMemo(
    () => new Set([...selectedScoringCodes, ...Object.values(selectedGroupChoices)]),
    [selectedGroupChoices, selectedScoringCodes],
  );

  function isPolicyApplicable(policy: ScoringPolicyItem) {
    return (
      policy.applicableIndustry === null || policy.applicableIndustry === company?.industryCategory
    );
  }

  useEffect(() => {
    setSelectedScoringCodes((prev) => {
      const filtered = new Set(
        [...prev].filter((code) => {
          const policy = scoringPolicies.find((p) => p.code === code);
          return !policy || isPolicyApplicable(policy);
        }),
      );
      return filtered.size === prev.size ? prev : filtered;
    });

    setSelectedGroupChoices((prev) => {
      const filtered: Record<string, string> = {};
      let changed = false;
      for (const [group, code] of Object.entries(prev)) {
        const policy = scoringPolicies.find((p) => p.code === code);
        if (!policy || isPolicyApplicable(policy)) {
          filtered[group] = code;
        } else {
          changed = true;
        }
      }
      return changed ? filtered : prev;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [company?.industryCategory]);

  const deductionScore = useMemo(() => {
    let total = 0;
    for (const policy of scoringPolicies) {
      if (policy.type === "DEDUCTION" && allSelectedCodes.has(policy.code)) {
        total += policy.points;
      }
    }
    return total;
  }, [allSelectedCodes, scoringPolicies]);

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

  function handleGroupChange(group: string, code: string) {
    setSelectedGroupChoices((prev) => {
      if (prev[group] === code) {
        const { [group]: _removed, ...rest } = prev;
        return rest;
      }

      return { ...prev, [group]: code };
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
      appliedScoringCodes: [...allSelectedCodes],
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
                {REGION_LABELS[company.region] ?? company.region} ·{" "}
                {INDUSTRY_CATEGORY_LABELS[company.industryCategory] ?? company.industryCategory} · 상시근로자{" "}
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
                  value={company ? (REGION_LABELS[company.region] ?? company.region) : ""}
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
              {independentPolicies.map((policy) => {
                const isDeduction = policy.type === "DEDUCTION";
                const isApplicable = isPolicyApplicable(policy);
                const applicableIndustry = policy.applicableIndustry as IndustryCategory | null;

                return (
                  <label
                    key={policy.code}
                    className={cn(
                      "flex items-center gap-2 text-[13px]",
                      isApplicable ? "cursor-pointer" : "cursor-not-allowed opacity-70",
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={selectedScoringCodes.has(policy.code)}
                      disabled={!isApplicable}
                      onChange={() => handleScoringToggle(policy.code)}
                      className={cn(
                        "h-4 w-4",
                        isApplicable ? "cursor-pointer" : "cursor-not-allowed",
                      )}
                    />
                    <span className={isDeduction ? "text-signal-red" : undefined}>
                      {policy.displayName}{" "}
                      <span
                        className={
                          isDeduction
                            ? "font-semibold text-signal-red"
                            : "font-semibold text-signal-green"
                        }
                      >
                        ({isDeduction ? `-${policy.points}점` : `+${policy.points}점`})
                      </span>
                      {!isApplicable && applicableIndustry !== null && (
                        <span className="ml-1 text-[11px] text-muted-foreground">
                          ({INDUSTRY_CATEGORY_LABELS[applicableIndustry]} 사업장만 해당)
                        </span>
                      )}
                    </span>
                  </label>
                );
              })}
              {[...policyGroups.entries()].map(([group, policies]) => (
                <div key={group} className="rounded-md border border-border bg-background/70 p-3">
                  <p className="mb-2 text-xs font-semibold text-foreground">
                    {(GROUP_LABELS[group] ?? group) + " 가산점 (택1)"}
                  </p>
                  <div className="flex flex-col gap-2">
                    {policies.map((policy) => {
                      const isApplicable = isPolicyApplicable(policy);
                      const applicableIndustry =
                        policy.applicableIndustry as IndustryCategory | null;

                      return (
                        <label
                          key={policy.code}
                          className={cn(
                            "flex items-center gap-2 text-[13px]",
                            isApplicable ? "cursor-pointer" : "cursor-not-allowed opacity-70",
                          )}
                        >
                          <input
                            type="radio"
                            name={`policy-group-${group}`}
                            checked={selectedGroupChoices[group] === policy.code}
                            disabled={!isApplicable}
                            onClick={() => {
                              if (selectedGroupChoices[group] === policy.code) {
                                handleGroupChange(group, policy.code);
                              }
                            }}
                            onChange={() => {
                              if (selectedGroupChoices[group] !== policy.code) {
                                handleGroupChange(group, policy.code);
                              }
                            }}
                            className={cn(
                              "h-4 w-4",
                              isApplicable ? "cursor-pointer" : "cursor-not-allowed",
                            )}
                          />
                          <span>
                            {policy.displayName}{" "}
                            <span className="font-semibold text-signal-green">
                              (+{policy.points}점)
                            </span>
                            {!isApplicable && applicableIndustry !== null && (
                              <span className="ml-1 text-[11px] text-muted-foreground">
                                ({INDUSTRY_CATEGORY_LABELS[applicableIndustry]} 사업장만 해당)
                              </span>
                            )}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
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
