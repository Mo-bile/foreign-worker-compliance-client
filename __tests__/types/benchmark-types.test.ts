import { describe, it, expect } from "vitest";
import { benchmarkResponseSchema, createBenchmarkRequestSchema } from "@/types/benchmark";

describe("benchmarkResponseSchema", () => {
  it("정상 데이터를 파싱한다", () => {
    const data = {
      id: 1,
      companyId: 1,
      analyzedAt: "2026-04-11T09:00:00Z",
      managementScore: 50,
      managementGrade: "CAUTION",
      aiReport: "**테스트** 리포트",
      wageAnalysis: {
        companyAvgWage: 260,
        visaType: "E-9",
        distribution: { under100: 0, from100to200: 2, from200to300: 221, over300: 98 },
        companyBracket: "200~300만",
      },
      stabilityAnalysis: {
        turnoverRate: 12.5,
        terminationCount: 3,
        foreignWorkerCount: 24,
        terminationReasons: {
          lowWage: 24.5,
          companyIssue: 23.1,
          dangerous: 13.9,
          betterJob: 10.2,
          environment: 6.4,
          wageDelay: 5.4,
          friend: 3.8,
          other: 12.7,
        },
      },
      managementCheck: {
        totalItems: 2,
        passedItems: 1,
        score: 50,
        items: [
          { category: "보험", label: "4대보험", passed: true, required: true },
          { category: "계약", label: "근로계약 갱신", passed: false, required: true },
        ],
      },
      positioningAnalysis: {
        region: "경기도",
        industryCategory: "식료품제조업",
        regionalTotal: 245000,
        industryTotal: 92386,
        companyForeignWorkerCount: 12,
        companyShare: 0.013,
        sizeCategory: "소규모",
      },
    };

    const result = benchmarkResponseSchema.parse(data);
    expect(result.managementScore).toBe(50);
    expect(result.wageAnalysis?.companyAvgWage).toBe(260);
    expect(result.stabilityAnalysis?.terminationCount).toBe(3);
  });

  it("nullable 축(wage, stability)이 null이면 파싱 성공", () => {
    const data = {
      id: 2,
      companyId: 1,
      analyzedAt: "2026-04-11T09:00:00Z",
      managementScore: 50,
      managementGrade: "CAUTION",
      aiReport: "리포트",
      wageAnalysis: null,
      stabilityAnalysis: null,
      managementCheck: {
        totalItems: 2,
        passedItems: 1,
        score: 50,
        items: [
          { category: "보험", label: "4대보험", passed: true, required: true },
          { category: "계약", label: "근로계약 갱신", passed: false, required: true },
        ],
      },
      positioningAnalysis: {
        region: "경기도",
        industryCategory: "식료품제조업",
        regionalTotal: 245000,
        industryTotal: 92386,
        companyForeignWorkerCount: 12,
        companyShare: 0.013,
        sizeCategory: "소규모",
      },
    };

    const result = benchmarkResponseSchema.parse(data);
    expect(result.wageAnalysis).toBeNull();
    expect(result.stabilityAnalysis).toBeNull();
  });

  it("필수 필드 누락 시 파싱 실패", () => {
    expect(() => benchmarkResponseSchema.parse({})).toThrow();
    expect(() => benchmarkResponseSchema.parse({ id: 1 })).toThrow();
  });

  it("managementGrade와_managementScore_경계값이_일치하지_않으면_파싱_실패", () => {
    const base = {
      id: 1,
      companyId: 1,
      analyzedAt: "2026-04-11T09:00:00Z",
      managementScore: 89,
      managementGrade: "EXCELLENT",
      aiReport: "리포트",
      wageAnalysis: null,
      stabilityAnalysis: null,
      managementCheck: {
        totalItems: 10,
        passedItems: 9,
        score: 89,
        items: Array.from({ length: 10 }, (_, i) => ({
          category: "테스트",
          label: `항목 ${i + 1}`,
          passed: i < 9,
          required: true,
        })),
      },
      positioningAnalysis: {
        region: "경기도",
        industryCategory: "식료품제조업",
        regionalTotal: 100,
        industryTotal: 50,
        companyForeignWorkerCount: 5,
        companyShare: 0.1,
        sizeCategory: "소규모",
      },
    };

    expect(() => benchmarkResponseSchema.parse(base)).toThrow();
  });

  it("managementGrade_EXCELLENT과_score_90_이상이면_파싱_성공", () => {
    const base = {
      id: 1,
      companyId: 1,
      analyzedAt: "2026-04-11T09:00:00Z",
      managementScore: 90,
      managementGrade: "EXCELLENT",
      aiReport: "리포트",
      wageAnalysis: null,
      stabilityAnalysis: null,
      managementCheck: {
        totalItems: 10,
        passedItems: 9,
        score: 90,
        items: Array.from({ length: 10 }, (_, i) => ({
          category: "테스트",
          label: `항목 ${i + 1}`,
          passed: i < 9,
          required: true,
        })),
      },
      positioningAnalysis: {
        region: "경기도",
        industryCategory: "식료품제조업",
        regionalTotal: 100,
        industryTotal: 50,
        companyForeignWorkerCount: 5,
        companyShare: 0.1,
        sizeCategory: "소규모",
      },
    };

    const result = benchmarkResponseSchema.parse(base);
    expect(result.managementGrade).toBe("EXCELLENT");
  });
});

describe("createBenchmarkRequestSchema", () => {
  it("유효한 companyId를 파싱한다", () => {
    expect(createBenchmarkRequestSchema.parse({ companyId: 1 })).toEqual({ companyId: 1 });
  });

  it("음수/0은 실패한다", () => {
    expect(() => createBenchmarkRequestSchema.parse({ companyId: 0 })).toThrow();
    expect(() => createBenchmarkRequestSchema.parse({ companyId: -1 })).toThrow();
  });
});
