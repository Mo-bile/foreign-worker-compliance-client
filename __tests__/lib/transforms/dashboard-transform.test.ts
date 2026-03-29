import { describe, it, expect } from "vitest";
import { transformDashboardResponse } from "@/lib/transforms/dashboard-transform";
import type { DashboardRawResponse } from "@/types/dashboard";

const baseRaw: DashboardRawResponse = {
  stats: {
    totalWorkers: 12,
    visaBreakdown: [
      { visaType: "E9", count: 8 },
      { visaType: "H2", count: 3 },
      { visaType: "E7", count: 1 },
    ],
    insuranceRate: 91.7,
    upcomingDeadlines: 5,
    deadlineBreakdown: { d7: 2, d30: 3 },
    urgentActions: 3,
    urgentBreakdown: { visa: 1, insurance: 2 },
  },
  alerts: [
    {
      deadlineId: 1,
      workerId: 3,
      workerName: "Nguyen Van A",
      deadlineType: "VISA_EXPIRY",
      status: "URGENT",
      dDay: -4,
      dueDate: "2026-04-02",
      description: "비자 갱신 필요",
    },
    {
      deadlineId: 2,
      workerId: 5,
      workerName: "Pham Thi B",
      deadlineType: "INSURANCE_ENROLLMENT",
      status: "OVERDUE",
      dDay: 3,
      dueDate: "2026-03-26",
      description: "건강보험 미가입",
    },
    {
      deadlineId: 3,
      workerId: 7,
      workerName: "Rahman C",
      deadlineType: "CONTRACT_RENEWAL",
      status: "APPROACHING",
      dDay: 21,
      dueDate: "2026-04-19",
      description: "근로계약 갱신 필요",
    },
  ],
  visaDistribution: [
    { visaType: "E9", count: 8, percentage: 66.7 },
    { visaType: "H2", count: 3, percentage: 25.0 },
    { visaType: "E7", count: 1, percentage: 8.3 },
  ],
  insuranceSummary: [
    { insuranceType: "NATIONAL_PENSION", mandatoryCount: 10, totalWorkers: 12 },
    { insuranceType: "HEALTH_INSURANCE", mandatoryCount: 12, totalWorkers: 12 },
    { insuranceType: "EMPLOYMENT_INSURANCE", mandatoryCount: 9, totalWorkers: 12 },
    { insuranceType: "INDUSTRIAL_ACCIDENT", mandatoryCount: 12, totalWorkers: 12 },
  ],
  complianceScore: {
    total: 73,
    breakdown: [
      { category: "INSURANCE", score: 92 },
      { category: "DEADLINE", score: 65 },
    ],
  },
  aiInsight: "AI 인사이트 텍스트",
  upcomingDeadlines: [
    {
      deadlineId: 1,
      workerId: 3,
      workerName: "Nguyen Van A",
      visaType: "E9",
      deadlineType: "VISA_EXPIRY",
      status: "URGENT",
      dDay: -4,
      dueDate: "2026-04-02",
    },
    {
      deadlineId: 4,
      workerId: 8,
      workerName: "Li Wei D",
      visaType: "E7",
      deadlineType: "CHANGE_REPORT",
      status: "PENDING",
      dDay: 45,
      dueDate: "2026-05-13",
    },
  ],
};

describe("transformDashboardResponse", () => {
  it("기본_구조를_올바르게_변환한다", () => {
    const result = transformDashboardResponse(baseRaw);

    expect(result.stats).toBeDefined();
    expect(result.alerts).toBeDefined();
    expect(result.visaDistribution).toBeDefined();
    expect(result.insuranceSummary).toBeDefined();
    expect(result.complianceScore).toBeDefined();
    expect(result.aiInsight).toBe("AI 인사이트 텍스트");
    expect(result.upcomingDeadlines).toBeDefined();
  });

  describe("stats 변환", () => {
    it("visaBreakdown의_visaType을_type으로_변환한다", () => {
      const result = transformDashboardResponse(baseRaw);
      expect(result.stats.visaBreakdown[0]).toEqual({ type: "E9", count: 8 });
      expect(result.stats.visaBreakdown[1]).toEqual({ type: "H2", count: 3 });
    });

    it("insuranceRateChange를_null로_설정한다", () => {
      const result = transformDashboardResponse(baseRaw);
      expect(result.stats.insuranceRateChange).toBeNull();
    });

    it("나머지_stats_필드를_그대로_전달한다", () => {
      const result = transformDashboardResponse(baseRaw);
      expect(result.stats.totalWorkers).toBe(12);
      expect(result.stats.insuranceRate).toBe(91.7);
      expect(result.stats.upcomingDeadlines).toBe(5);
      expect(result.stats.deadlineBreakdown).toEqual({ d7: 2, d30: 3 });
      expect(result.stats.urgentActions).toBe(3);
      expect(result.stats.urgentBreakdown).toEqual({ visa: 1, insurance: 2 });
    });
  });

  describe("alerts 변환", () => {
    it("status를_level로_매핑한다_URGENT_→_warning", () => {
      const result = transformDashboardResponse(baseRaw);
      expect(result.alerts[0].level).toBe("warning");
    });

    it("status를_level로_매핑한다_OVERDUE_→_critical", () => {
      const result = transformDashboardResponse(baseRaw);
      expect(result.alerts[1].level).toBe("critical");
    });

    it("status를_level로_매핑한다_APPROACHING_→_info", () => {
      const result = transformDashboardResponse(baseRaw);
      expect(result.alerts[2].level).toBe("info");
    });

    it("id를_문자열로_변환한다", () => {
      const result = transformDashboardResponse(baseRaw);
      expect(result.alerts[0].id).toBe("1");
    });

    it("deadlineType과_workerName으로_title을_생성한다", () => {
      const result = transformDashboardResponse(baseRaw);
      expect(result.alerts[0].title).toBe("비자 만료 임박 — Nguyen Van A");
      expect(result.alerts[1].title).toBe("보험 가입 필요 — Pham Thi B");
      expect(result.alerts[2].title).toBe("근로계약 갱신 — Rahman C");
    });

    it("dDay로_badgeText를_생성한다", () => {
      const result = transformDashboardResponse(baseRaw);
      expect(result.alerts[0].badgeText).toBe("D-4");
      expect(result.alerts[1].badgeText).toBe("D+3");
      expect(result.alerts[2].badgeText).toBe("D+21");
    });

    it("dDay_0일때_badgeText가_D-0이다", () => {
      const raw: DashboardRawResponse = {
        ...baseRaw,
        alerts: [{ ...baseRaw.alerts[0], dDay: 0 }],
      };
      const result = transformDashboardResponse(raw);
      expect(result.alerts[0].badgeText).toBe("D-0");
    });

    it("workerId_기반으로_actions를_생성한다", () => {
      const result = transformDashboardResponse(baseRaw);
      expect(result.alerts[0].actions).toEqual(
        expect.arrayContaining([expect.objectContaining({ href: "/workers/3" })]),
      );
    });

    it("description을_그대로_전달한다", () => {
      const result = transformDashboardResponse(baseRaw);
      expect(result.alerts[0].description).toBe("비자 갱신 필요");
    });
  });

  describe("visaDistribution 변환", () => {
    it("visaType을_type으로_변환한다", () => {
      const result = transformDashboardResponse(baseRaw);
      expect(result.visaDistribution[0]).toEqual({ type: "E9", count: 8, percentage: 66.7 });
    });
  });

  describe("insuranceSummary 변환", () => {
    it("insuranceType을_한글_label로_변환한다", () => {
      const result = transformDashboardResponse(baseRaw);
      expect(result.insuranceSummary[0].label).toBe("국민연금");
      expect(result.insuranceSummary[1].label).toBe("건강보험");
      expect(result.insuranceSummary[2].label).toBe("고용보험");
      expect(result.insuranceSummary[3].label).toBe("산재보험");
    });

    it("enrolled에_mandatoryCount를_사용한다", () => {
      const result = transformDashboardResponse(baseRaw);
      expect(result.insuranceSummary[0].enrolled).toBe(10);
    });

    it("mandatoryCount_==_totalWorkers이면_status_ok", () => {
      const result = transformDashboardResponse(baseRaw);
      expect(result.insuranceSummary[1].status).toBe("ok");
      expect(result.insuranceSummary[1].statusText).toBe("✓ 전원");
    });

    it("mandatoryCount_<_totalWorkers이면_status_warn", () => {
      const result = transformDashboardResponse(baseRaw);
      expect(result.insuranceSummary[0].status).toBe("warn");
      expect(result.insuranceSummary[0].statusText).toBe("2 미가입");
    });

    it("type에_insuranceType을_그대로_전달한다", () => {
      const result = transformDashboardResponse(baseRaw);
      expect(result.insuranceSummary[0].type).toBe("NATIONAL_PENSION");
    });
  });

  describe("complianceScore 변환", () => {
    it("category를_한글_label로_변환한다", () => {
      const result = transformDashboardResponse(baseRaw);
      expect(result.complianceScore.breakdown[0].label).toBe("보험 가입");
      expect(result.complianceScore.breakdown[1].label).toBe("데드라인 준수");
    });

    it("total을_그대로_전달한다", () => {
      const result = transformDashboardResponse(baseRaw);
      expect(result.complianceScore.total).toBe(73);
    });

    it("알_수_없는_category는_매핑된_값을_사용한다", () => {
      const raw: DashboardRawResponse = {
        ...baseRaw,
        complianceScore: {
          total: 50,
          breakdown: [{ category: "WAGE", score: 50 }],
        },
      };
      const result = transformDashboardResponse(raw);
      expect(result.complianceScore.breakdown[0].label).toBe("임금 경쟁력");
    });
  });

  describe("upcomingDeadlines 변환", () => {
    it("id를_문자열로_변환한다", () => {
      const result = transformDashboardResponse(baseRaw);
      expect(result.upcomingDeadlines[0].id).toBe("1");
    });

    it("deadlineType을_한글_title로_변환한다", () => {
      const result = transformDashboardResponse(baseRaw);
      expect(result.upcomingDeadlines[0].title).toBe("비자 만료");
      expect(result.upcomingDeadlines[1].title).toBe("변경 신고");
    });

    it("status를_urgency로_매핑한다", () => {
      const result = transformDashboardResponse(baseRaw);
      expect(result.upcomingDeadlines[0].urgency).toBe("d7");
      expect(result.upcomingDeadlines[1].urgency).toBe("safe");
    });

    it("workerName과_visaType을_그대로_전달한다", () => {
      const result = transformDashboardResponse(baseRaw);
      expect(result.upcomingDeadlines[0].workerName).toBe("Nguyen Van A");
      expect(result.upcomingDeadlines[0].visaType).toBe("E9");
    });

    it("OVERDUE_status는_overdue_urgency로_매핑한다", () => {
      const raw: DashboardRawResponse = {
        ...baseRaw,
        upcomingDeadlines: [{ ...baseRaw.upcomingDeadlines[0], status: "OVERDUE" }],
      };
      const result = transformDashboardResponse(raw);
      expect(result.upcomingDeadlines[0].urgency).toBe("overdue");
    });

    it("APPROACHING_status는_d30_urgency로_매핑한다", () => {
      const raw: DashboardRawResponse = {
        ...baseRaw,
        upcomingDeadlines: [{ ...baseRaw.upcomingDeadlines[0], status: "APPROACHING" }],
      };
      const result = transformDashboardResponse(raw);
      expect(result.upcomingDeadlines[0].urgency).toBe("d30");
    });
  });
});
