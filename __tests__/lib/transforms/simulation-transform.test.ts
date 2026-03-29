import { describe, it, expect } from "vitest";
import { transformSimulationResult } from "@/lib/transforms/simulation-transform";
import type { SimulationResultResponse } from "@/types/simulator";

const baseRaw: SimulationResultResponse = {
  id: 1,
  companyId: 1,
  desiredWorkers: 3,
  desiredTiming: "2026_H2",
  preferredNationality: "VIETNAM",
  quotaAnalysis: {
    industry: "MANUFACTURING",
    annualQuota: 4200,
    currentWorkerCount: 2856,
    exhaustionRate: 68.0,
    remainingQuota: 1344,
    quotaSufficient: true,
  },
  competitionAnalysis: {
    region: "GYEONGGI",
    industry: "MANUFACTURING",
    regionalWorkerCount: 15200,
    nationalWorkerCount: 48000,
    regionalShare: 0.317,
    competitionLevel: "MEDIUM",
  },
  nationalityAnalysis: {
    nationality: "VIETNAM",
    industry: "MANUFACTURING",
    totalCount: 12500,
    maleCount: 8200,
    femaleCount: 4300,
    industryShareRate: 32.4,
  },
  aiInsights: {
    overallVerdict: "현재 조건에서 E-9 근로자 배정 가능성이 높습니다.",
    quotaInsight: "현재 소진율 68%는 양호한 수준입니다.",
    competitionInsight: "해당 지역은 경쟁 강도가 보통 수준입니다.",
    nationalityInsight: "베트남 국적 근로자는 제조업 분야에서 높은 비중을 차지합니다.",
    actionItems: [
      "내국인 구인노력 의무기간 14일을 우선 이행하세요",
      "필요 서류를 미리 준비하세요",
    ],
    disclaimer: "본 서비스는 법률 자문이 아닌 관리 보조 도구입니다.",
  },
  createdAt: "2026-03-24T14:32:00Z",
};

describe("transformSimulationResult", () => {
  it("기본_구조를_올바르게_변환한다", () => {
    const result = transformSimulationResult(baseRaw);

    expect(result.id).toBe("1");
    expect(result.analyzedAt).toBe("2026-03-24T14:32:00Z");
    expect(result.verdict).toBeDefined();
    expect(result.verdictText).toBeDefined();
    expect(result.summary).toBe("현재 조건에서 E-9 근로자 배정 가능성이 높습니다.");
    expect(result.stats.allocation).toBeDefined();
    expect(result.stats.competition).toBeDefined();
    expect(result.stats.duration).toBeDefined();
    expect(result.analyses.length).toBeGreaterThanOrEqual(2);
    expect(result.recommendations.length).toBeGreaterThan(0);
  });

  describe("verdict 판정", () => {
    it("quotaSufficient_true_+_경쟁_LOW면_HIGH", () => {
      const raw: SimulationResultResponse = {
        ...baseRaw,
        quotaAnalysis: { ...baseRaw.quotaAnalysis, quotaSufficient: true },
        competitionAnalysis: { ...baseRaw.competitionAnalysis, competitionLevel: "LOW" },
      };
      expect(transformSimulationResult(raw).verdict).toBe("HIGH");
    });

    it("quotaSufficient_true_+_경쟁_MEDIUM이면_MEDIUM", () => {
      expect(transformSimulationResult(baseRaw).verdict).toBe("MEDIUM");
    });

    it("quotaSufficient_true_+_경쟁_HIGH면_MEDIUM", () => {
      const raw: SimulationResultResponse = {
        ...baseRaw,
        competitionAnalysis: { ...baseRaw.competitionAnalysis, competitionLevel: "HIGH" },
      };
      expect(transformSimulationResult(raw).verdict).toBe("MEDIUM");
    });

    it("quotaSufficient_false면_LOW", () => {
      const raw: SimulationResultResponse = {
        ...baseRaw,
        quotaAnalysis: { ...baseRaw.quotaAnalysis, quotaSufficient: false },
      };
      expect(transformSimulationResult(raw).verdict).toBe("LOW");
    });
  });

  describe("stats 변환", () => {
    it("allocation_stat을_올바르게_생성한다", () => {
      const { allocation } = transformSimulationResult(baseRaw).stats;
      expect(allocation.label).toBe("배정 가능성");
      expect(allocation.subText).toContain("쿼터");
    });

    it("competition_stat에_지역_점유율을_표시한다", () => {
      const { competition } = transformSimulationResult(baseRaw).stats;
      expect(competition.label).toBe("지역 경쟁도");
      expect(competition.subText).toContain("점유율");
    });

    it("duration_HIGH_경쟁_H1이면_5~7개월_orange", () => {
      const raw: SimulationResultResponse = {
        ...baseRaw,
        desiredTiming: "2026_H1",
        competitionAnalysis: { ...baseRaw.competitionAnalysis, competitionLevel: "HIGH" },
      };
      const { duration } = transformSimulationResult(raw).stats;
      expect(duration.value).toBe("5~7개월");
      expect(duration.color).toBe("orange");
    });

    it("duration_HIGH_경쟁_H2이면_4~6개월_orange", () => {
      const raw: SimulationResultResponse = {
        ...baseRaw,
        desiredTiming: "2026_H2",
        competitionAnalysis: { ...baseRaw.competitionAnalysis, competitionLevel: "HIGH" },
      };
      const { duration } = transformSimulationResult(raw).stats;
      expect(duration.value).toBe("4~6개월");
      expect(duration.color).toBe("orange");
    });

    it("duration_LOW_경쟁_H1이면_3~5개월_blue", () => {
      const raw: SimulationResultResponse = {
        ...baseRaw,
        desiredTiming: "2026_H1",
        competitionAnalysis: { ...baseRaw.competitionAnalysis, competitionLevel: "LOW" },
      };
      const { duration } = transformSimulationResult(raw).stats;
      expect(duration.value).toBe("3~5개월");
      expect(duration.color).toBe("blue");
    });

    it("duration_LOW_경쟁_H2이면_2~4개월_blue", () => {
      const raw: SimulationResultResponse = {
        ...baseRaw,
        desiredTiming: "2026_H2",
        competitionAnalysis: { ...baseRaw.competitionAnalysis, competitionLevel: "LOW" },
      };
      const { duration } = transformSimulationResult(raw).stats;
      expect(duration.value).toBe("2~4개월");
      expect(duration.color).toBe("blue");
    });
  });

  describe("analyses 변환", () => {
    it("quota_섹션에_aiInsight를_직접_사용한다", () => {
      const result = transformSimulationResult(baseRaw);
      const quota = result.analyses.find((a) => a.id === "quota");
      expect(quota!.aiInsight).toBe("현재 소진율 68%는 양호한 수준입니다.");
    });

    it("competition_섹션에_aiInsight를_직접_사용한다", () => {
      const result = transformSimulationResult(baseRaw);
      const comp = result.analyses.find((a) => a.id === "competition");
      expect(comp!.aiInsight).toBe("해당 지역은 경쟁 강도가 보통 수준입니다.");
    });
  });

  describe("nationality 변환", () => {
    it("nationalityAnalysis가_있으면_변환한다", () => {
      const result = transformSimulationResult(baseRaw);
      expect(result.nationality).not.toBeNull();
      expect(result.nationality!.nationality).toBe("VIETNAM");
      expect(result.nationality!.percentage).toBe(32.4);
    });

    it("nationalityAnalysis가_null이면_null을_반환한다", () => {
      const raw: SimulationResultResponse = { ...baseRaw, nationalityAnalysis: null };
      expect(transformSimulationResult(raw).nationality).toBeNull();
    });
  });

  describe("recommendations", () => {
    it("actionItems를_recommendations로_매핑한다", () => {
      const result = transformSimulationResult(baseRaw);
      expect(result.recommendations).toHaveLength(2);
      expect(result.recommendations[0]!.text).toBe("내국인 구인노력 의무기간 14일을 우선 이행하세요");
    });

    it("actionItems가_비어있으면_기본_추천을_제공한다", () => {
      const raw: SimulationResultResponse = {
        ...baseRaw,
        aiInsights: { ...baseRaw.aiInsights, actionItems: [] },
      };
      const result = transformSimulationResult(raw);
      expect(result.recommendations.length).toBeGreaterThanOrEqual(1);
    });
  });

  it("dataSourceCount를_고유_데이터소스_수로_계산한다", () => {
    expect(transformSimulationResult(baseRaw).dataSourceCount).toBe(2);
  });

  it("competitionLevel_문자열을_정규화한다", () => {
    const raw: SimulationResultResponse = {
      ...baseRaw,
      competitionAnalysis: { ...baseRaw.competitionAnalysis, competitionLevel: "high" },
    };
    expect(transformSimulationResult(raw).verdict).toBe("MEDIUM");
  });
});
