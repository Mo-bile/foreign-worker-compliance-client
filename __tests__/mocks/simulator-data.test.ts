import { describe, it, expect } from "vitest";
import { mockWithinQuotaResponse, mockExceededResponse } from "@/mocks/simulator-data";

describe("mockWithinQuotaResponse", () => {
  it("필수_최상위_필드를_모두_갖는다", () => {
    expect(mockWithinQuotaResponse).toHaveProperty("employmentLimitAnalysis");
    expect(mockWithinQuotaResponse).toHaveProperty("scoringAnalysis");
    expect(mockWithinQuotaResponse).toHaveProperty("quotaStatus");
    expect(mockWithinQuotaResponse).toHaveProperty("timelineEstimate");
    expect(mockWithinQuotaResponse).toHaveProperty("aiInsights");
    expect(mockWithinQuotaResponse).toHaveProperty("domesticInsuredCount");
  });

  it("한도_이내 조건: limitExceeded가_false이다", () => {
    expect(mockWithinQuotaResponse.employmentLimitAnalysis.limitExceeded).toBe(false);
  });

  it("한도_이내 조건: remainingCapacity가_0보다_크다", () => {
    expect(mockWithinQuotaResponse.employmentLimitAnalysis.remainingCapacity).toBeGreaterThan(0);
  });

  it("한도_이내 조건: whatIfScenarios가_빈_배열이다", () => {
    expect(mockWithinQuotaResponse.employmentLimitAnalysis.whatIfScenarios).toHaveLength(0);
  });

  it("scoringAnalysis_필드가_올바른_구조를_갖는다", () => {
    const { scoringAnalysis } = mockWithinQuotaResponse;
    expect(scoringAnalysis).toHaveProperty("appliedBonusItems");
    expect(scoringAnalysis).toHaveProperty("availableBonusItems");
    expect(scoringAnalysis).toHaveProperty("appliedDeductionItems");
    expect(scoringAnalysis).toHaveProperty("availableDeductionItems");
    expect(scoringAnalysis).toHaveProperty("autoSuggestedDeductions");
    expect(scoringAnalysis).toHaveProperty("totalBonusScore");
    expect(scoringAnalysis).toHaveProperty("totalDeductionScore");
    expect(scoringAnalysis).toHaveProperty("estimatedScore");
    expect(scoringAnalysis).toHaveProperty("maxPossibleScore");
  });

  it("scoringAnalysis_bonusItem이_displayName과_points를_사용한다", () => {
    const item = mockWithinQuotaResponse.scoringAnalysis.appliedBonusItems[0];
    expect(item).toHaveProperty("displayName");
    expect(item).toHaveProperty("points");
    expect(item).not.toHaveProperty("label");
    expect(item).not.toHaveProperty("score");
  });

  it("quotaStatus_필드가_연도별_구조를_갖는다", () => {
    const { quotaStatus } = mockWithinQuotaResponse;
    expect(quotaStatus).toHaveProperty("industry");
    expect(quotaStatus).toHaveProperty("currentYearQuota");
    expect(quotaStatus).toHaveProperty("recentHistory");
    expect(quotaStatus).not.toHaveProperty("currentRound");
    expect(quotaStatus).not.toHaveProperty("roundAllocation");
  });

  it("timelineEstimate_필드가_올바른_구조를_갖는다", () => {
    const { timelineEstimate } = mockWithinQuotaResponse;
    expect(timelineEstimate).toHaveProperty("preferredNationality");
    expect(timelineEstimate).toHaveProperty("estimatedMonths");
    expect(timelineEstimate).toHaveProperty("steps");
    expect(timelineEstimate).not.toHaveProperty("nationalityComparison");
  });

  it("timelineEstimate_step이_stepName과_estimatedDays를_사용한다", () => {
    const step = mockWithinQuotaResponse.timelineEstimate.steps[0];
    expect(step).toHaveProperty("stepName");
    expect(step).toHaveProperty("estimatedDays");
    expect(step).not.toHaveProperty("step");
    expect(step).not.toHaveProperty("duration");
  });

  it("employmentLimitAnalysis_새_필드를_갖는다", () => {
    const el = mockWithinQuotaResponse.employmentLimitAnalysis;
    expect(el).toHaveProperty("baseLimitAfterCap");
    expect(el).toHaveProperty("additionalCount");
    expect(el).toHaveProperty("cappedByDomesticCount");
  });

  it("additionalBonuses가_ratePercent를_사용한다", () => {
    const bonus = mockWithinQuotaResponse.employmentLimitAnalysis.additionalBonuses[0];
    expect(bonus).toHaveProperty("ratePercent");
    expect(bonus).toHaveProperty("cappedByDomesticCount");
    expect(bonus).not.toHaveProperty("additionalCount");
  });

  it("aiInsights_필드가_올바른_구조를_갖는다", () => {
    const { aiInsights } = mockWithinQuotaResponse;
    expect(aiInsights).toHaveProperty("overallVerdict");
    expect(aiInsights).toHaveProperty("limitInsight");
    expect(aiInsights).toHaveProperty("actionItems");
    expect(aiInsights).toHaveProperty("disclaimer");
  });
});

describe("mockExceededResponse", () => {
  it("한도_초과 조건: limitExceeded가_true이다", () => {
    expect(mockExceededResponse.employmentLimitAnalysis.limitExceeded).toBe(true);
  });

  it("한도_초과 조건: remainingCapacity가_0이다", () => {
    expect(mockExceededResponse.employmentLimitAnalysis.remainingCapacity).toBe(0);
  });

  it("한도_초과 조건: whatIfScenarios가_4개_항목을_갖는다", () => {
    expect(mockExceededResponse.employmentLimitAnalysis.whatIfScenarios).toHaveLength(4);
  });

  it("whatIfScenarios에_4가지_feasibility_값이_모두_존재한다", () => {
    const feasibilities = mockExceededResponse.employmentLimitAnalysis.whatIfScenarios.map(
      (s) => s.feasibility,
    );
    expect(feasibilities).toContain("IMPOSSIBLE");
    expect(feasibilities).toContain("INSUFFICIENT");
    expect(feasibilities).toContain("POSSIBLE");
    expect(feasibilities).toContain("SURPLUS");
  });

  it("whatIfScenarios가_새_필드명을_사용한다", () => {
    const scenario = mockExceededResponse.employmentLimitAnalysis.whatIfScenarios[0];
    expect(scenario).toHaveProperty("additionalDomesticCount");
    expect(scenario).toHaveProperty("newDomesticTotal");
    expect(scenario).toHaveProperty("newTotalLimit");
    expect(scenario).toHaveProperty("newRemainingCapacity");
    expect(scenario).not.toHaveProperty("delta");
    expect(scenario).not.toHaveProperty("newLimit");
  });
});
