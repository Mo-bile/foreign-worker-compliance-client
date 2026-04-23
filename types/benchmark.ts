import { z } from "zod";

// ─── Wage Analysis ──────────────────────────────────────────

/** 체류자격별 임금구간 분포. 모든 값은 천 명 단위 인원수 (KOSIS 원시값) */
export const wageDistributionSchema = z.object({
  under100: z.number(),
  from100to200: z.number(),
  from200to300: z.number(),
  over300: z.number(),
});
export type WageDistribution = z.infer<typeof wageDistributionSchema>;

export const wageAnalysisSchema = z.object({
  companyAvgWage: z.number().nullable(),
  visaType: z.string(),
  distribution: wageDistributionSchema,
  companyBracket: z.string().nullable(),
});
export type WageAnalysis = z.infer<typeof wageAnalysisSchema>;

// ─── Stability Analysis ─────────────────────────────────────

/** E-9 퇴사사유 분포. 모든 값은 퍼센트 단위 (24.5 = 24.5%). KOSIS 원시값 */
export const terminationReasonsSchema = z.object({
  lowWage: z.number(),
  companyIssue: z.number(),
  dangerous: z.number(),
  betterJob: z.number(),
  environment: z.number(),
  wageDelay: z.number(),
  friend: z.number(),
  other: z.number(),
});
export type TerminationReasons = z.infer<typeof terminationReasonsSchema>;

export const stabilityAnalysisSchema = z.object({
  turnoverRate: z.number().nullable(),
  terminationCount: z.number(),
  foreignWorkerCount: z.number(),
  terminationReasons: terminationReasonsSchema,
});
export type StabilityAnalysis = z.infer<typeof stabilityAnalysisSchema>;

// ─── Management Check ───────────────────────────────────────

export const managementCheckItemSchema = z.object({
  category: z.string(),
  label: z.string(),
  passed: z.boolean(),
  required: z.boolean(),
});
export type ManagementCheckItem = z.infer<typeof managementCheckItemSchema>;

export const managementCheckSchema = z
  .object({
    totalItems: z.number(),
    passedItems: z.number(),
    score: z.number(),
    items: z.array(managementCheckItemSchema),
  })
  .refine((d) => d.totalItems === d.items.length, {
    message: "totalItems must match items array length",
    path: ["totalItems"],
  })
  .refine((d) => d.passedItems === d.items.filter((i) => i.passed).length, {
    message: "passedItems must match actual passed count",
    path: ["passedItems"],
  });
export type ManagementCheck = z.infer<typeof managementCheckSchema>;

// ─── Positioning Analysis ───────────────────────────────────

export const positioningAnalysisSchema = z
  .object({
    region: z.string(),
    industryCategory: z.string(),
    regionName: z.string().optional(),
    industryCategoryName: z.string().optional(),
    regionalTotal: z.number(),
    industryTotal: z.number(),
    companyForeignWorkerCount: z.number(),
    companyShare: z.number(),
    sizeCategory: z.enum(["소규모", "중소규모", "중규모", "대규모"]),
  })
  .transform((data) => ({
    ...data,
    regionName: data.regionName ?? data.region,
    industryCategoryName: data.industryCategoryName ?? data.industryCategory,
  }));
export type PositioningAnalysis = z.infer<typeof positioningAnalysisSchema>;

// ─── Benchmark Response ─────────────────────────────────────

export const benchmarkResponseSchema = z
  .object({
    id: z.number(),
    companyId: z.number(),
    analyzedAt: z.string(),
    managementScore: z.number(),
    managementGrade: z.enum(["EXCELLENT", "GOOD", "CAUTION", "RISK"]),
    aiReport: z.string(),
    wageAnalysis: wageAnalysisSchema.nullable(),
    stabilityAnalysis: stabilityAnalysisSchema.nullable(),
    managementCheck: managementCheckSchema,
    positioningAnalysis: positioningAnalysisSchema,
  })
  .refine((d) => d.managementScore === d.managementCheck.score, {
    message: "managementScore must equal managementCheck.score",
    path: ["managementScore"],
  })
  .refine(
    (d) => {
      const score = d.managementScore;
      const grade = d.managementGrade;
      if (grade === "EXCELLENT") return score >= 90;
      if (grade === "GOOD") return score >= 70 && score < 90;
      if (grade === "CAUTION") return score >= 50 && score < 70;
      return score < 50;
    },
    {
      message: "managementGrade must match managementScore boundary (90/70/50)",
      path: ["managementGrade"],
    },
  );
export type BenchmarkResponse = z.infer<typeof benchmarkResponseSchema>;

// ─── Create Request ─────────────────────────────────────────

export const createBenchmarkRequestSchema = z.object({
  companyId: z.number().int().positive(),
});
export type CreateBenchmarkRequest = z.infer<typeof createBenchmarkRequestSchema>;
