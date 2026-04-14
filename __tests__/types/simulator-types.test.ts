import { describe, it, expect } from "vitest";
import {
  simulationRequestSchema,
  DESIRED_TIMINGS,
  DESIRED_TIMING_LABELS,
  E9_NATIONALITIES,
} from "@/types/simulator";
import type {
  SimulationVerdict,
  SimulationResultResponse,
  EmploymentLimitAnalysis,
  ScoringAnalysis,
  QuotaStatusResponseBE,
  TimelineEstimateBE,
  AiInsightsResponse,
  AdditionalBonusBE,
  WhatIfScenarioBE,
  ScoringBonusItemBE,
  QuotaHistoryItem,
  TimelineStepBE,
} from "@/types/simulator";

// ─── simulationRequestSchema ─────────────────────────────────────────────────

describe("simulationRequestSchema", () => {
  const validBase = {
    desiredWorkers: 5,
    desiredTiming: "2026_Q2" as const,
    domesticInsuredCount: 10,
    appliedScoringCodes: ["CODE_A"],
    deductionScore: 0,
  };

  describe("valid parse", () => {
    it("parses a fully valid request without optional nationality", () => {
      const result = simulationRequestSchema.safeParse(validBase);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.desiredWorkers).toBe(5);
        expect(result.data.desiredTiming).toBe("2026_Q2");
        expect(result.data.domesticInsuredCount).toBe(10);
        expect(result.data.appliedScoringCodes).toEqual(["CODE_A"]);
        expect(result.data.deductionScore).toBe(0);
        expect(result.data.preferredNationality).toBeUndefined();
      }
    });

    it("parses a valid request with an optional preferredNationality", () => {
      const result = simulationRequestSchema.safeParse({
        ...validBase,
        preferredNationality: "VIETNAM",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.preferredNationality).toBe("VIETNAM");
      }
    });

    it("accepts an empty appliedScoringCodes array", () => {
      const result = simulationRequestSchema.safeParse({
        ...validBase,
        appliedScoringCodes: [],
      });
      expect(result.success).toBe(true);
    });

    it("accepts all valid desiredTiming values", () => {
      for (const timing of DESIRED_TIMINGS) {
        const result = simulationRequestSchema.safeParse({
          ...validBase,
          desiredTiming: timing,
        });
        expect(result.success).toBe(true);
      }
    });

    it("accepts all E9_NATIONALITIES for preferredNationality", () => {
      for (const nationality of E9_NATIONALITIES) {
        const result = simulationRequestSchema.safeParse({
          ...validBase,
          preferredNationality: nationality,
        });
        expect(result.success).toBe(true);
      }
    });
  });

  describe("missing required fields", () => {
    it("fails when desiredWorkers is missing", () => {
      const { desiredWorkers: _, ...rest } = validBase;
      const result = simulationRequestSchema.safeParse(rest);
      expect(result.success).toBe(false);
    });

    it("fails when desiredTiming is missing", () => {
      const { desiredTiming: _, ...rest } = validBase;
      const result = simulationRequestSchema.safeParse(rest);
      expect(result.success).toBe(false);
    });

    it("fails when domesticInsuredCount is missing", () => {
      const { domesticInsuredCount: _, ...rest } = validBase;
      const result = simulationRequestSchema.safeParse(rest);
      expect(result.success).toBe(false);
    });

    it("fails when appliedScoringCodes is missing", () => {
      const { appliedScoringCodes: _, ...rest } = validBase;
      const result = simulationRequestSchema.safeParse(rest);
      expect(result.success).toBe(false);
    });

    it("fails when deductionScore is missing", () => {
      const { deductionScore: _, ...rest } = validBase;
      const result = simulationRequestSchema.safeParse(rest);
      expect(result.success).toBe(false);
    });
  });

  describe("boundary values — desiredWorkers (int, 1..50)", () => {
    it("accepts boundary minimum: 1", () => {
      expect(simulationRequestSchema.safeParse({ ...validBase, desiredWorkers: 1 }).success).toBe(
        true,
      );
    });

    it("accepts boundary maximum: 50", () => {
      expect(simulationRequestSchema.safeParse({ ...validBase, desiredWorkers: 50 }).success).toBe(
        true,
      );
    });

    it("rejects below minimum: 0", () => {
      expect(simulationRequestSchema.safeParse({ ...validBase, desiredWorkers: 0 }).success).toBe(
        false,
      );
    });

    it("rejects above maximum: 51", () => {
      expect(simulationRequestSchema.safeParse({ ...validBase, desiredWorkers: 51 }).success).toBe(
        false,
      );
    });

    it("rejects float values: 1.5", () => {
      expect(simulationRequestSchema.safeParse({ ...validBase, desiredWorkers: 1.5 }).success).toBe(
        false,
      );
    });
  });

  describe("boundary values — domesticInsuredCount (int, min 1)", () => {
    it("accepts boundary minimum: 1", () => {
      expect(
        simulationRequestSchema.safeParse({ ...validBase, domesticInsuredCount: 1 }).success,
      ).toBe(true);
    });

    it("rejects below minimum: 0", () => {
      expect(
        simulationRequestSchema.safeParse({ ...validBase, domesticInsuredCount: 0 }).success,
      ).toBe(false);
    });

    it("rejects float values: 2.5", () => {
      expect(
        simulationRequestSchema.safeParse({ ...validBase, domesticInsuredCount: 2.5 }).success,
      ).toBe(false);
    });
  });

  describe("boundary values — deductionScore (int, min 0)", () => {
    it("accepts zero (minimum boundary)", () => {
      expect(simulationRequestSchema.safeParse({ ...validBase, deductionScore: 0 }).success).toBe(
        true,
      );
    });

    it("accepts positive values", () => {
      expect(simulationRequestSchema.safeParse({ ...validBase, deductionScore: 100 }).success).toBe(
        true,
      );
    });

    it("rejects negative values: -1", () => {
      expect(simulationRequestSchema.safeParse({ ...validBase, deductionScore: -1 }).success).toBe(
        false,
      );
    });

    it("rejects float values: 1.5", () => {
      expect(simulationRequestSchema.safeParse({ ...validBase, deductionScore: 1.5 }).success).toBe(
        false,
      );
    });
  });

  describe("field type validation", () => {
    it("rejects a string for desiredWorkers", () => {
      expect(simulationRequestSchema.safeParse({ ...validBase, desiredWorkers: "5" }).success).toBe(
        false,
      );
    });

    it("rejects an invalid desiredTiming value", () => {
      expect(
        simulationRequestSchema.safeParse({ ...validBase, desiredTiming: "2026_Q1" }).success,
      ).toBe(false);
    });

    it("rejects an invalid preferredNationality", () => {
      expect(
        simulationRequestSchema.safeParse({ ...validBase, preferredNationality: "FRANCE" }).success,
      ).toBe(false);
    });

    it("rejects a non-array appliedScoringCodes", () => {
      expect(
        simulationRequestSchema.safeParse({ ...validBase, appliedScoringCodes: "CODE_A" }).success,
      ).toBe(false);
    });
  });
});

// ─── DESIRED_TIMINGS ─────────────────────────────────────────────────────────

describe("DESIRED_TIMINGS", () => {
  it("contains exactly three quarterly timings", () => {
    expect(DESIRED_TIMINGS).toHaveLength(3);
  });

  it("contains Q2, Q3, Q4 — no Q1", () => {
    expect(DESIRED_TIMINGS).toContain("2026_Q2");
    expect(DESIRED_TIMINGS).toContain("2026_Q3");
    expect(DESIRED_TIMINGS).toContain("2026_Q4");
  });

  it("does not contain Q1", () => {
    expect(DESIRED_TIMINGS).not.toContain("2026_Q1");
  });

  it("is ordered Q2 → Q3 → Q4", () => {
    expect(DESIRED_TIMINGS[0]).toBe("2026_Q2");
    expect(DESIRED_TIMINGS[1]).toBe("2026_Q3");
    expect(DESIRED_TIMINGS[2]).toBe("2026_Q4");
  });

  it("has a label defined for every timing in DESIRED_TIMING_LABELS", () => {
    for (const timing of DESIRED_TIMINGS) {
      expect(DESIRED_TIMING_LABELS[timing]).toBeDefined();
      expect(typeof DESIRED_TIMING_LABELS[timing]).toBe("string");
      expect(DESIRED_TIMING_LABELS[timing].length).toBeGreaterThan(0);
    }
  });
});

// ─── SimulationVerdict ────────────────────────────────────────────────────────

describe("SimulationVerdict", () => {
  it("accepts WITHIN_QUOTA as a valid verdict", () => {
    const verdict: SimulationVerdict = "WITHIN_QUOTA";
    expect(verdict).toBe("WITHIN_QUOTA");
  });

  it("accepts EXCEEDED as a valid verdict", () => {
    const verdict: SimulationVerdict = "EXCEEDED";
    expect(verdict).toBe("EXCEEDED");
  });

  it("is one of exactly two values", () => {
    const validVerdicts: SimulationVerdict[] = ["WITHIN_QUOTA", "EXCEEDED"];
    expect(validVerdicts).toHaveLength(2);
  });
});

// ─── BE Response Type Shapes ──────────────────────────────────────────────────

describe("SimulationResultResponse shape", () => {
  const mockAdditionalBonus: AdditionalBonusBE = {
    reason: "Priority industry bonus",
    ratePercent: 10,
    cappedByDomesticCount: false,
  };

  const mockWhatIfScenario: WhatIfScenarioBE = {
    additionalDomesticCount: 5,
    newDomesticTotal: 15,
    newBaseLimit: 7,
    newBaseLimitAfterCap: 7,
    newTotalLimit: 8,
    newRemainingCapacity: 3,
    feasibility: "POSSIBLE",
  };

  const mockEmploymentLimit: EmploymentLimitAnalysis = {
    domesticInsuredCount: 10,
    baseLimit: 5,
    doubleCap: null,
    baseLimitAfterCap: 5,
    additionalBonuses: [mockAdditionalBonus],
    additionalCount: 2,
    totalLimit: 7,
    cappedByDomesticCount: false,
    currentForeignWorkerCount: 3,
    remainingCapacity: 4,
    limitExceeded: false,
    whatIfScenarios: [mockWhatIfScenario],
  };

  const mockScoringBonusItem: ScoringBonusItemBE = {
    code: "PRIORITY_INDUSTRY",
    displayName: "우선 지원 업종",
    points: 5,
    applied: true,
  };

  const mockScoring: ScoringAnalysis = {
    appliedBonusItems: [mockScoringBonusItem],
    availableBonusItems: [],
    totalBonusScore: 5,
    totalDeductionScore: 0,
    estimatedScore: 72,
    maxPossibleScore: 100,
  };

  const mockQuotaHistoryItem: QuotaHistoryItem = {
    year: 2025,
    quotaCount: 5000,
    source: "고용부 고시",
  };

  const mockQuotaStatus: QuotaStatusResponseBE = {
    industry: "제조업",
    currentYearQuota: 6000,
    recentHistory: [mockQuotaHistoryItem],
  };

  const mockTimelineStep: TimelineStepBE = {
    stepName: "구인 신청",
    estimatedDays: 10,
    description: "고용센터에 구인 신청서 제출",
  };

  const mockTimeline: TimelineEstimateBE = {
    preferredNationality: "VIETNAM",
    estimatedMonths: 4,
    steps: [mockTimelineStep],
  };

  const mockAiInsights: AiInsightsResponse = {
    overallVerdict: "허용 범위 내",
    limitInsight: "현재 고용 한도 내입니다.",
    scoringInsight: "점수가 상위 30%입니다.",
    quotaInsight: "쿼터 여유 있음.",
    timelineInsight: "약 4개월 소요 예상.",
    actionItems: ["서류 준비를 서두르세요."],
    disclaimer: "이 결과는 참고용입니다.",
  };

  const mockResult: SimulationResultResponse = {
    id: 1,
    companyId: 42,
    desiredWorkers: 5,
    desiredTiming: "2026_Q2",
    preferredNationality: "VIETNAM",
    domesticInsuredCount: 10,
    employmentLimitAnalysis: mockEmploymentLimit,
    scoringAnalysis: mockScoring,
    quotaStatus: mockQuotaStatus,
    timelineEstimate: mockTimeline,
    aiInsights: mockAiInsights,
    createdAt: "2026-03-30T00:00:00Z",
  };

  it("has numeric id and companyId", () => {
    expect(typeof mockResult.id).toBe("number");
    expect(typeof mockResult.companyId).toBe("number");
  });

  it("has string desiredTiming and createdAt", () => {
    expect(typeof mockResult.desiredTiming).toBe("string");
    expect(typeof mockResult.createdAt).toBe("string");
  });

  it("has top-level domesticInsuredCount", () => {
    expect(typeof mockResult.domesticInsuredCount).toBe("number");
  });

  it("allows preferredNationality to be null", () => {
    const withNull: SimulationResultResponse = { ...mockResult, preferredNationality: null };
    expect(withNull.preferredNationality).toBeNull();
  });

  describe("employmentLimitAnalysis sub-object", () => {
    it("has required numeric fields", () => {
      const el = mockResult.employmentLimitAnalysis;
      expect(typeof el.domesticInsuredCount).toBe("number");
      expect(typeof el.baseLimit).toBe("number");
      expect(typeof el.baseLimitAfterCap).toBe("number");
      expect(typeof el.additionalCount).toBe("number");
      expect(typeof el.totalLimit).toBe("number");
      expect(typeof el.currentForeignWorkerCount).toBe("number");
      expect(typeof el.remainingCapacity).toBe("number");
    });

    it("has boolean fields", () => {
      expect(typeof mockResult.employmentLimitAnalysis.limitExceeded).toBe("boolean");
      expect(typeof mockResult.employmentLimitAnalysis.cappedByDomesticCount).toBe("boolean");
    });

    it("allows doubleCap to be null", () => {
      expect(mockResult.employmentLimitAnalysis.doubleCap).toBeNull();
    });

    it("has additionalBonuses array with correct shape", () => {
      const bonus = mockResult.employmentLimitAnalysis.additionalBonuses[0];
      expect(typeof bonus.reason).toBe("string");
      expect(typeof bonus.ratePercent).toBe("number");
      expect(typeof bonus.cappedByDomesticCount).toBe("boolean");
    });

    it("has whatIfScenarios with all required fields", () => {
      const scenario = mockResult.employmentLimitAnalysis.whatIfScenarios[0];
      expect(typeof scenario.additionalDomesticCount).toBe("number");
      expect(typeof scenario.newDomesticTotal).toBe("number");
      expect(typeof scenario.newBaseLimit).toBe("number");
      expect(typeof scenario.newBaseLimitAfterCap).toBe("number");
      expect(typeof scenario.newTotalLimit).toBe("number");
      expect(typeof scenario.newRemainingCapacity).toBe("number");
      expect(["IMPOSSIBLE", "INSUFFICIENT", "POSSIBLE", "SURPLUS"]).toContain(scenario.feasibility);
    });
  });

  describe("scoringAnalysis sub-object", () => {
    it("has required numeric score fields", () => {
      const s = mockResult.scoringAnalysis;
      expect(typeof s.totalBonusScore).toBe("number");
      expect(typeof s.totalDeductionScore).toBe("number");
      expect(typeof s.estimatedScore).toBe("number");
      expect(typeof s.maxPossibleScore).toBe("number");
    });

    it("has appliedBonusItems and availableBonusItems as arrays", () => {
      expect(Array.isArray(mockResult.scoringAnalysis.appliedBonusItems)).toBe(true);
      expect(Array.isArray(mockResult.scoringAnalysis.availableBonusItems)).toBe(true);
    });

    it("bonus items have correct shape", () => {
      const item = mockResult.scoringAnalysis.appliedBonusItems[0];
      expect(typeof item.code).toBe("string");
      expect(typeof item.displayName).toBe("string");
      expect(typeof item.points).toBe("number");
      expect(typeof item.applied).toBe("boolean");
    });
  });

  describe("quotaStatus sub-object", () => {
    it("has industry and currentYearQuota fields", () => {
      expect(typeof mockResult.quotaStatus.industry).toBe("string");
      expect(typeof mockResult.quotaStatus.currentYearQuota).toBe("number");
    });

    it("has recentHistory as an array", () => {
      expect(Array.isArray(mockResult.quotaStatus.recentHistory)).toBe(true);
    });

    it("recentHistory items have year, quotaCount, and source", () => {
      const item = mockResult.quotaStatus.recentHistory[0];
      expect(typeof item.year).toBe("number");
      expect(typeof item.quotaCount).toBe("number");
      expect(typeof item.source).toBe("string");
    });
  });

  describe("timelineEstimate sub-object", () => {
    it("has estimatedMonths as a number", () => {
      expect(typeof mockResult.timelineEstimate.estimatedMonths).toBe("number");
    });

    it("allows preferredNationality to be null", () => {
      const tlWithNull: TimelineEstimateBE = { ...mockTimeline, preferredNationality: null };
      expect(tlWithNull.preferredNationality).toBeNull();
    });

    it("steps array items have all required fields", () => {
      const step = mockResult.timelineEstimate.steps[0];
      expect(typeof step.stepName).toBe("string");
      expect(typeof step.estimatedDays).toBe("number");
      expect(typeof step.description).toBe("string");
    });
  });

  describe("aiInsights sub-object", () => {
    it("has all required string insight fields", () => {
      const ai = mockResult.aiInsights;
      expect(typeof ai.overallVerdict).toBe("string");
      expect(typeof ai.limitInsight).toBe("string");
      expect(typeof ai.scoringInsight).toBe("string");
      expect(typeof ai.quotaInsight).toBe("string");
      expect(typeof ai.timelineInsight).toBe("string");
      expect(typeof ai.disclaimer).toBe("string");
    });

    it("has actionItems as an array of strings", () => {
      const { actionItems } = mockResult.aiInsights;
      expect(Array.isArray(actionItems)).toBe(true);
      for (const item of actionItems) {
        expect(typeof item).toBe("string");
      }
    });
  });
});
