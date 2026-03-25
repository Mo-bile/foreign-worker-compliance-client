import { describe, it, expect } from "vitest";
import type { DashboardResponse, AlertLevel, DeadlineUrgency } from "@/types/dashboard";

describe("Dashboard Types", () => {
  it("AlertLevel_유니온이_3가지_값을_허용한다", () => {
    const levels: AlertLevel[] = ["critical", "warning", "info"];
    expect(levels).toHaveLength(3);
  });

  it("DeadlineUrgency_유니온이_4가지_값을_허용한다", () => {
    const urgencies: DeadlineUrgency[] = ["overdue", "d7", "d30", "safe"];
    expect(urgencies).toHaveLength(4);
  });

  it("DashboardResponse_구조가_올바르다", () => {
    const response: DashboardResponse = {
      stats: {
        totalWorkers: 12,
        visaBreakdown: [{ type: "E-9", count: 8 }],
        insuranceRate: 91.7,
        insuranceRateChange: 4.2,
        upcomingDeadlines: 5,
        deadlineBreakdown: { d7: 2, d30: 3 },
        urgentActions: 3,
        urgentBreakdown: { visa: 1, insurance: 2 },
      },
      alerts: [],
      visaDistribution: [],
      insuranceSummary: [],
      complianceScore: { total: 73, breakdown: [] },
      aiInsight: "test",
      upcomingDeadlines: [],
    };
    expect(response.stats.totalWorkers).toBe(12);
    expect(response.complianceScore.total).toBe(73);
  });
});
