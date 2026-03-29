import { describe, it, expect } from "vitest";
import {
  simulationRequestSchema,
  type SimulationRequest,
  type SimulationResponse,
  type SimulationVerdict,
  type SimulationResultResponse,
} from "@/types/simulator";

describe("Simulator Types", () => {
  it("유효한_시뮬레이션_요청을_파싱한다", () => {
    const input: SimulationRequest = {
      desiredWorkers: 3,
      preferredNationality: "VIETNAM",
      desiredTiming: "2026_H2",
    };
    const result = simulationRequestSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it("desiredWorkers가_0이면_실패한다", () => {
    const result = simulationRequestSchema.safeParse({
      desiredWorkers: 0,
      desiredTiming: "2026_H2",
    });
    expect(result.success).toBe(false);
  });

  it("SimulationVerdict_유니온이_3가지_값을_허용한다", () => {
    const verdicts: SimulationVerdict[] = ["HIGH", "MEDIUM", "LOW"];
    expect(verdicts).toHaveLength(3);
  });

  it("SimulationResponse_구조가_올바르다", () => {
    const response: SimulationResponse = {
      id: "sim-1",
      verdict: "HIGH",
      verdictText: "높음",
      summary: "배정 가능성이 양호합니다.",
      analyzedAt: "2026-03-24T14:32:00Z",
      dataSourceCount: 4,
      stats: {
        allocation: {
          label: "배정 가능성",
          value: "높음",
          subText: "쿼터 여유 충분",
          color: "green",
        },
        competition: {
          label: "지역 경쟁도",
          value: "보통",
          subText: "밀집도 상위 35%",
          color: "orange",
        },
        duration: {
          label: "예상 소요기간",
          value: "3~5개월",
          subText: "내국인 구인노력 포함",
          color: "blue",
        },
      },
      analyses: [
        {
          id: "quota",
          icon: "BarChart3",
          title: "쿼터 분석",
          badge: { text: "여유", color: "green" },
          dataRows: [{ key: "쿼터", value: "4,200명" }],
          progress: { label: "소진율", value: 68, level: "mid" },
          dataSources: [{ name: "고용노동부", dataId: "15002263" }],
          aiInsight: "현재 소진율 68%는 양호한 수준입니다.",
        },
      ],
      nationality: null,
      recommendations: [
        {
          text: "내국인 구인노력 의무기간 14일을 우선 이행하세요",
          linkText: "워크넷 바로가기",
          href: "https://www.work.go.kr",
        },
      ],
    };
    expect(response.verdict).toBe("HIGH");
    expect(response.analyses).toHaveLength(1);
  });

  it("SimulationResultResponse_BE_타입_구조가_올바르다", () => {
    const raw: SimulationResultResponse = {
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
      nationalityAnalysis: null,
      aiInsights: {
        overallVerdict: "종합 판정",
        quotaInsight: "쿼터 인사이트",
        competitionInsight: "경쟁 인사이트",
        nationalityInsight: "국적 인사이트",
        actionItems: ["서류 준비"],
        disclaimer: "법률 자문 아님",
      },
      createdAt: "2026-03-24T14:32:00Z",
    };
    expect(raw.quotaAnalysis.quotaSufficient).toBe(true);
    expect(raw.aiInsights.actionItems).toHaveLength(1);
  });
});
