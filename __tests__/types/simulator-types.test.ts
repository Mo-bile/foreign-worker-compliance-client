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
  EmploymentLimitResponse,
  ScoringResponse,
  QuotaStatusResponse,
  TimelineResponse,
  AiInsightsResponse,
  AdditionalBonus,
  WhatIfScenario,
  ScoringBonusItem,
  RoundHistoryItem,
  TimelineStep,
  NationalityDuration,
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
      expect(
        simulationRequestSchema.safeParse({ ...validBase, desiredWorkers: 1 }).success
      ).toBe(true);
    });

    it("accepts boundary maximum: 50", () => {
      expect(
        simulationRequestSchema.safeParse({ ...validBase, desiredWorkers: 50 }).success
      ).toBe(true);
    });

    it("rejects below minimum: 0", () => {
      expect(
        simulationRequestSchema.safeParse({ ...validBase, desiredWorkers: 0 }).success
      ).toBe(false);
    });

    it("rejects above maximum: 51", () => {
      expect(
        simulationRequestSchema.safeParse({ ...validBase, desiredWorkers: 51 }).success
      ).toBe(false);
    });

    it("rejects float values: 1.5", () => {
      expect(
        simulationRequestSchema.safeParse({ ...validBase, desiredWorkers: 1.5 }).success
      ).toBe(false);
    });
  });

  describe("boundary values — domesticInsuredCount (int, min 1)", () => {
    it("accepts boundary minimum: 1", () => {
      expect(
        simulationRequestSchema.safeParse({ ...validBase, domesticInsuredCount: 1 }).success
      ).toBe(true);
    });

    it("rejects below minimum: 0", () => {
      expect(
        simulationRequestSchema.safeParse({ ...validBase, domesticInsuredCount: 0 }).success
      ).toBe(false);
    });

    it("rejects float values: 2.5", () => {
      expect(
        simulationRequestSchema.safeParse({ ...validBase, domesticInsuredCount: 2.5 }).success
      ).toBe(false);
    });
  });

  describe("boundary values — deductionScore (int, min 0)", () => {
    it("accepts zero (minimum boundary)", () => {
      expect(
        simulationRequestSchema.safeParse({ ...validBase, deductionScore: 0 }).success
      ).toBe(true);
    });

    it("accepts positive values", () => {
      expect(
        simulationRequestSchema.safeParse({ ...validBase, deductionScore: 100 }).success
      ).toBe(true);
    });

    it("rejects negative values: -1", () => {
      expect(
        simulationRequestSchema.safeParse({ ...validBase, deductionScore: -1 }).success
      ).toBe(false);
    });

    it("rejects float values: 1.5", () => {
      expect(
        simulationRequestSchema.safeParse({ ...validBase, deductionScore: 1.5 }).success
      ).toBe(false);
    });
  });

  describe("field type validation", () => {
    it("rejects a string for desiredWorkers", () => {
      expect(
        simulationRequestSchema.safeParse({ ...validBase, desiredWorkers: "5" }).success
      ).toBe(false);
    });

    it("rejects an invalid desiredTiming value", () => {
      expect(
        simulationRequestSchema.safeParse({ ...validBase, desiredTiming: "2026_Q1" }).success
      ).toBe(false);
    });

    it("rejects an invalid preferredNationality", () => {
      expect(
        simulationRequestSchema.safeParse({ ...validBase, preferredNationality: "FRANCE" }).success
      ).toBe(false);
    });

    it("rejects a non-array appliedScoringCodes", () => {
      expect(
        simulationRequestSchema.safeParse({ ...validBase, appliedScoringCodes: "CODE_A" }).success
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
  const mockAdditionalBonus: AdditionalBonus = {
    reason: "Priority industry bonus",
    additionalCount: 2,
  };

  const mockWhatIfScenario: WhatIfScenario = {
    domesticInsuredCount: 15,
    delta: 5,
    newLimit: 7,
    remainingCapacity: 3,
    feasibility: "POSSIBLE",
  };

  const mockEmploymentLimit: EmploymentLimitResponse = {
    domesticInsuredCount: 10,
    baseLimit: 5,
    additionalBonuses: [mockAdditionalBonus],
    totalLimit: 7,
    currentForeignWorkerCount: 3,
    remainingCapacity: 4,
    limitExceeded: false,
    whatIfScenarios: [mockWhatIfScenario],
  };

  const mockScoringBonusItem: ScoringBonusItem = {
    code: "PRIORITY_INDUSTRY",
    label: "우선 지원 업종",
    score: 5,
    applied: true,
  };

  const mockScoring: ScoringResponse = {
    appliedBonusItems: [mockScoringBonusItem],
    availableBonusItems: [],
    totalBonusScore: 5,
    estimatedScore: 72,
    maxPossibleScore: 100,
  };

  const mockRoundHistoryItem: RoundHistoryItem = {
    round: "2025_Q4",
    allocation: 5000,
    industryAllocation: 300,
    competitionRate: 2.5,
  };

  const mockQuotaStatus: QuotaStatusResponse = {
    industry: "제조업",
    currentRound: "2026_Q2",
    roundAllocation: 6000,
    industryAllocation: 350,
    roundHistory: [mockRoundHistoryItem],
    industryTrend: "STABLE",
  };

  const mockTimelineStep: TimelineStep = {
    step: 1,
    title: "구인 신청",
    description: "고용센터에 구인 신청서 제출",
    duration: "1~2주",
  };

  const mockNationalityDuration: NationalityDuration = {
    nationality: "VIETNAM",
    flag: "🇻🇳",
    avgMonths: 3,
    note: "평균 대기 3개월",
  };

  const mockTimeline: TimelineResponse = {
    preferredNationality: "VIETNAM",
    estimatedMonths: 4,
    steps: [mockTimelineStep],
    nationalityComparison: [mockNationalityDuration],
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
    employmentLimit: mockEmploymentLimit,
    scoring: mockScoring,
    quotaStatus: mockQuotaStatus,
    timeline: mockTimeline,
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

  it("allows preferredNationality to be null", () => {
    const withNull: SimulationResultResponse = { ...mockResult, preferredNationality: null };
    expect(withNull.preferredNationality).toBeNull();
  });

  describe("employmentLimit sub-object", () => {
    it("has required numeric fields", () => {
      const el = mockResult.employmentLimit;
      expect(typeof el.domesticInsuredCount).toBe("number");
      expect(typeof el.baseLimit).toBe("number");
      expect(typeof el.totalLimit).toBe("number");
      expect(typeof el.currentForeignWorkerCount).toBe("number");
      expect(typeof el.remainingCapacity).toBe("number");
    });

    it("has boolean limitExceeded field", () => {
      expect(typeof mockResult.employmentLimit.limitExceeded).toBe("boolean");
    });

    it("has additionalBonuses array with correct shape", () => {
      const bonus = mockResult.employmentLimit.additionalBonuses[0];
      expect(typeof bonus.reason).toBe("string");
      expect(typeof bonus.additionalCount).toBe("number");
    });

    it("has whatIfScenarios with all required fields", () => {
      const scenario = mockResult.employmentLimit.whatIfScenarios[0];
      expect(typeof scenario.domesticInsuredCount).toBe("number");
      expect(typeof scenario.delta).toBe("number");
      expect(typeof scenario.newLimit).toBe("number");
      expect(typeof scenario.remainingCapacity).toBe("number");
      expect(["IMPOSSIBLE", "INSUFFICIENT", "POSSIBLE", "SURPLUS"]).toContain(
        scenario.feasibility
      );
    });
  });

  describe("scoring sub-object", () => {
    it("has required numeric score fields", () => {
      const s = mockResult.scoring;
      expect(typeof s.totalBonusScore).toBe("number");
      expect(typeof s.estimatedScore).toBe("number");
      expect(typeof s.maxPossibleScore).toBe("number");
    });

    it("has appliedBonusItems and availableBonusItems as arrays", () => {
      expect(Array.isArray(mockResult.scoring.appliedBonusItems)).toBe(true);
      expect(Array.isArray(mockResult.scoring.availableBonusItems)).toBe(true);
    });

    it("bonus items have correct shape", () => {
      const item = mockResult.scoring.appliedBonusItems[0];
      expect(typeof item.code).toBe("string");
      expect(typeof item.label).toBe("string");
      expect(typeof item.score).toBe("number");
      expect(typeof item.applied).toBe("boolean");
    });
  });

  describe("quotaStatus sub-object", () => {
    it("has industry and currentRound as strings", () => {
      expect(typeof mockResult.quotaStatus.industry).toBe("string");
      expect(typeof mockResult.quotaStatus.currentRound).toBe("string");
    });

    it("has numeric allocation fields", () => {
      expect(typeof mockResult.quotaStatus.roundAllocation).toBe("number");
      expect(typeof mockResult.quotaStatus.industryAllocation).toBe("number");
    });

    it("roundHistory items allow null competitionRate", () => {
      const itemWithNull: RoundHistoryItem = { ...mockRoundHistoryItem, competitionRate: null };
      expect(itemWithNull.competitionRate).toBeNull();
    });
  });

  describe("timeline sub-object", () => {
    it("has estimatedMonths as a number", () => {
      expect(typeof mockResult.timeline.estimatedMonths).toBe("number");
    });

    it("allows preferredNationality to be null", () => {
      const tlWithNull: TimelineResponse = { ...mockTimeline, preferredNationality: null };
      expect(tlWithNull.preferredNationality).toBeNull();
    });

    it("steps array items have all required fields", () => {
      const step = mockResult.timeline.steps[0];
      expect(typeof step.step).toBe("number");
      expect(typeof step.title).toBe("string");
      expect(typeof step.description).toBe("string");
      expect(typeof step.duration).toBe("string");
    });

    it("nationalityComparison items have all required fields", () => {
      const nc = mockResult.timeline.nationalityComparison[0];
      expect(typeof nc.nationality).toBe("string");
      expect(typeof nc.flag).toBe("string");
      expect(typeof nc.avgMonths).toBe("number");
      expect(typeof nc.note).toBe("string");
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
