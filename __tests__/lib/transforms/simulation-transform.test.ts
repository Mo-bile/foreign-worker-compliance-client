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
  aiReport:
    "## 분석 요약\n현재 조건에서 E-9 근로자 배정 가능성이 높습니다.\n\n## 상세 분석\n해당 지역의 쿼터 여유분과 업종 수요를 고려할 때 신청 적기입니다.",
  createdAt: "2026-03-24T14:32:00Z",
};

describe("transformSimulationResult", () => {
  it("기본_구조를_올바르게_변환한다", () => {
    const result = transformSimulationResult(baseRaw);

    expect(result.id).toBe("1");
    expect(result.analyzedAt).toBe("2026-03-24T14:32:00Z");
    expect(result.verdict).toBeDefined();
    expect(result.verdictText).toBeDefined();
    expect(result.summary).toBeDefined();
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
      const raw: SimulationResultResponse = {
        ...baseRaw,
        quotaAnalysis: { ...baseRaw.quotaAnalysis, quotaSufficient: true },
        competitionAnalysis: { ...baseRaw.competitionAnalysis, competitionLevel: "MEDIUM" },
      };
      expect(transformSimulationResult(raw).verdict).toBe("MEDIUM");
    });

    it("quotaSufficient_true_+_경쟁_HIGH면_MEDIUM", () => {
      const raw: SimulationResultResponse = {
        ...baseRaw,
        quotaAnalysis: { ...baseRaw.quotaAnalysis, quotaSufficient: true },
        competitionAnalysis: { ...baseRaw.competitionAnalysis, competitionLevel: "HIGH" },
      };
      expect(transformSimulationResult(raw).verdict).toBe("MEDIUM");
    });

    it("quotaSufficient_false면_LOW", () => {
      const raw: SimulationResultResponse = {
        ...baseRaw,
        quotaAnalysis: { ...baseRaw.quotaAnalysis, quotaSufficient: false },
        competitionAnalysis: { ...baseRaw.competitionAnalysis, competitionLevel: "LOW" },
      };
      expect(transformSimulationResult(raw).verdict).toBe("LOW");
    });
  });

  describe("stats 변환", () => {
    it("allocation_stat을_올바르게_생성한다", () => {
      const result = transformSimulationResult(baseRaw);
      const { allocation } = result.stats;

      expect(allocation.label).toBe("배정 가능성");
      expect(allocation.subText).toContain("쿼터");
      expect(allocation.color).toBeDefined();
    });

    it("competition_stat에_지역_점유율을_표시한다", () => {
      const result = transformSimulationResult(baseRaw);
      const { competition } = result.stats;

      expect(competition.label).toBe("지역 경쟁도");
      expect(competition.subText).toContain("점유율");
      expect(competition.color).toBeDefined();
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
    it("quota_섹션을_포함한다", () => {
      const result = transformSimulationResult(baseRaw);
      const quota = result.analyses.find((a) => a.id === "quota");

      expect(quota).toBeDefined();
      expect(quota!.title).toBe("쿼터 분석");
      expect(quota!.dataRows.length).toBeGreaterThan(0);
      expect(quota!.progress).not.toBeNull();
    });

    it("competition_섹션을_포함한다", () => {
      const result = transformSimulationResult(baseRaw);
      const comp = result.analyses.find((a) => a.id === "competition");

      expect(comp).toBeDefined();
      expect(comp!.title).toBe("지역 경쟁도 분석");
      expect(comp!.dataRows.length).toBeGreaterThan(0);
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
      const result = transformSimulationResult(raw);

      expect(result.nationality).toBeNull();
    });
  });

  describe("aiReport 파싱", () => {
    it("마크다운_헤더에서_summary를_추출한다", () => {
      const result = transformSimulationResult(baseRaw);
      expect(result.summary).toContain("E-9 근로자 배정 가능성이 높습니다");
    });

    it("파싱_실패_시_전체를_summary와_insight로_사용한다", () => {
      const raw: SimulationResultResponse = {
        ...baseRaw,
        aiReport: "단순 텍스트 보고서입니다.",
      };
      const result = transformSimulationResult(raw);
      expect(result.summary).toBe("단순 텍스트 보고서입니다.");
      const quotaSection = result.analyses.find((a) => a.id === "quota");
      expect(quotaSection!.aiInsight).toBe("단순 텍스트 보고서입니다.");
    });

    it("빈_aiReport면_기본_메시지를_사용한다", () => {
      const raw: SimulationResultResponse = { ...baseRaw, aiReport: "" };
      const result = transformSimulationResult(raw);
      expect(result.summary).toBe("분석 요약을 불러올 수 없습니다");
    });
  });

  describe("recommendations 생성", () => {
    it("최소_1개_이상의_추천을_생성한다", () => {
      const result = transformSimulationResult(baseRaw);
      expect(result.recommendations.length).toBeGreaterThanOrEqual(1);
    });

    it("쿼터_부족_시_관련_추천을_포함한다", () => {
      const raw: SimulationResultResponse = {
        ...baseRaw,
        quotaAnalysis: { ...baseRaw.quotaAnalysis, quotaSufficient: false, exhaustionRate: 95 },
      };
      const result = transformSimulationResult(raw);
      const texts = result.recommendations.map((r) => r.text);
      expect(texts.some((t) => t.includes("쿼터") || t.includes("시기"))).toBe(true);
    });
  });

  it("dataSourceCount를_고유_데이터소스_수로_계산한다", () => {
    const result = transformSimulationResult(baseRaw);
    expect(result.dataSourceCount).toBe(2);
  });

  it("competitionLevel_문자열을_정규화한다", () => {
    const raw: SimulationResultResponse = {
      ...baseRaw,
      competitionAnalysis: { ...baseRaw.competitionAnalysis, competitionLevel: "high" },
    };
    const result = transformSimulationResult(raw);
    expect(result.verdict).toBe("MEDIUM");
  });
});
