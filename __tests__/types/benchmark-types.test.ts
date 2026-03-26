import { describe, it, expect, expectTypeOf } from "vitest";
import type {
  BenchmarkResponse,
  BenchmarkScore,
  ScoreCategory,
  QuickActions,
  WageAnalysis,
  AttritionAnalysis,
  DependencyAnalysis,
  TrendAnalysis,
  RiskLevel,
  BenchmarkDataRow,
} from "@/types/benchmark";
import { mockBenchmarkResponse } from "@/mocks/benchmark-data";

describe("benchmark types", () => {
  it("RiskLevel은_4가지_리터럴_유니온이다", () => {
    expectTypeOf<RiskLevel>().toEqualTypeOf<"low" | "caution" | "moderate" | "high">();
  });

  it("BenchmarkDataRow는_DataRow를_확장하고_color를_가진다", () => {
    expectTypeOf<BenchmarkDataRow>().toMatchTypeOf<{
      readonly key: string;
      readonly value: string;
    }>();
  });

  it("mock_데이터가_BenchmarkResponse_타입에_부합한다", () => {
    expectTypeOf(mockBenchmarkResponse).toMatchTypeOf<BenchmarkResponse>();
  });

  it("mock_점수가_73이다", () => {
    expect(mockBenchmarkResponse.score.total).toBe(73);
  });

  it("mock_등급이_B+이다", () => {
    expect(mockBenchmarkResponse.score.grade).toBe("B+");
  });

  it("mock_카테고리가_3개이다", () => {
    expect(mockBenchmarkResponse.score.categories).toHaveLength(3);
  });

  it("mock_트렌드가_3개월이다", () => {
    expect(mockBenchmarkResponse.trend.months).toHaveLength(3);
  });
});
