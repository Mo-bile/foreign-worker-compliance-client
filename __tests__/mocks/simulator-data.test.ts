import { describe, it, expect } from "vitest";
import { mockWithinQuotaResponse, mockExceededResponse } from "@/mocks/simulator-data";

describe("mockWithinQuotaResponse", () => {
  it("필수_최상위_필드를_모두_갖는다", () => {
    expect(mockWithinQuotaResponse).toHaveProperty("employmentLimit");
    expect(mockWithinQuotaResponse).toHaveProperty("scoring");
    expect(mockWithinQuotaResponse).toHaveProperty("quotaStatus");
    expect(mockWithinQuotaResponse).toHaveProperty("timeline");
    expect(mockWithinQuotaResponse).toHaveProperty("aiInsights");
  });

  it("한도_이내 조건: limitExceeded가_false이다", () => {
    expect(mockWithinQuotaResponse.employmentLimit.limitExceeded).toBe(false);
  });

  it("한도_이내 조건: remainingCapacity가_0보다_크다", () => {
    expect(mockWithinQuotaResponse.employmentLimit.remainingCapacity).toBeGreaterThan(0);
  });

  it("한도_이내 조건: whatIfScenarios가_빈_배열이다", () => {
    expect(mockWithinQuotaResponse.employmentLimit.whatIfScenarios).toHaveLength(0);
  });

  it("scoring_필드가_올바른_구조를_갖는다", () => {
    const { scoring } = mockWithinQuotaResponse;
    expect(scoring).toHaveProperty("appliedBonusItems");
    expect(scoring).toHaveProperty("availableBonusItems");
    expect(scoring).toHaveProperty("totalBonusScore");
    expect(scoring).toHaveProperty("estimatedScore");
    expect(scoring).toHaveProperty("maxPossibleScore");
  });

  it("quotaStatus_필드가_올바른_구조를_갖는다", () => {
    const { quotaStatus } = mockWithinQuotaResponse;
    expect(quotaStatus).toHaveProperty("industry");
    expect(quotaStatus).toHaveProperty("currentRound");
    expect(quotaStatus).toHaveProperty("roundAllocation");
    expect(quotaStatus).toHaveProperty("industryAllocation");
    expect(quotaStatus).toHaveProperty("roundHistory");
    expect(quotaStatus).toHaveProperty("industryTrend");
  });

  it("timeline_필드가_올바른_구조를_갖는다", () => {
    const { timeline } = mockWithinQuotaResponse;
    expect(timeline).toHaveProperty("preferredNationality");
    expect(timeline).toHaveProperty("estimatedMonths");
    expect(timeline).toHaveProperty("steps");
    expect(timeline).toHaveProperty("nationalityComparison");
  });

  it("aiInsights_필드가_올바른_구조를_갖는다", () => {
    const { aiInsights } = mockWithinQuotaResponse;
    expect(aiInsights).toHaveProperty("overallVerdict");
    expect(aiInsights).toHaveProperty("limitInsight");
    expect(aiInsights).toHaveProperty("scoringInsight");
    expect(aiInsights).toHaveProperty("quotaInsight");
    expect(aiInsights).toHaveProperty("timelineInsight");
    expect(aiInsights).toHaveProperty("actionItems");
    expect(aiInsights).toHaveProperty("disclaimer");
  });
});

describe("mockExceededResponse", () => {
  it("한도_초과 조건: limitExceeded가_true이다", () => {
    expect(mockExceededResponse.employmentLimit.limitExceeded).toBe(true);
  });

  it("한도_초과 조건: remainingCapacity가_0이다", () => {
    expect(mockExceededResponse.employmentLimit.remainingCapacity).toBe(0);
  });

  it("한도_초과 조건: whatIfScenarios가_4개_항목을_갖는다", () => {
    expect(mockExceededResponse.employmentLimit.whatIfScenarios).toHaveLength(4);
  });

  it("whatIfScenarios에_4가지_feasibility_값이_모두_존재한다", () => {
    const feasibilities = mockExceededResponse.employmentLimit.whatIfScenarios.map(
      (s) => s.feasibility,
    );
    expect(feasibilities).toContain("IMPOSSIBLE");
    expect(feasibilities).toContain("INSUFFICIENT");
    expect(feasibilities).toContain("POSSIBLE");
    expect(feasibilities).toContain("SURPLUS");
  });
});
