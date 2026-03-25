import { describe, it, expect } from "vitest";
import { mockSimulationResponse } from "@/mocks/simulator-data";

describe("mockSimulationResponse", () => {
  it("필수_필드가_존재한다", () => {
    expect(mockSimulationResponse.id).toBeDefined();
    expect(mockSimulationResponse.verdict).toBe("HIGH");
    expect(mockSimulationResponse.stats.allocation).toBeDefined();
    expect(mockSimulationResponse.stats.competition).toBeDefined();
    expect(mockSimulationResponse.stats.duration).toBeDefined();
  });

  it("분석_섹션이_2개_이상이다", () => {
    expect(mockSimulationResponse.analyses.length).toBeGreaterThanOrEqual(2);
  });

  it("추천_항목이_존재한다", () => {
    expect(mockSimulationResponse.recommendations.length).toBeGreaterThan(0);
  });

  it("국적_분석이_포함되어_있다", () => {
    expect(mockSimulationResponse.nationality).not.toBeNull();
    expect(mockSimulationResponse.nationality?.nationality).toBe("VIETNAM");
  });
});
