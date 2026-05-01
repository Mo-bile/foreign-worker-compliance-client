import { describe, it, expect } from "vitest";
import type {
  DashboardResponse,
  DeadlineUrgency,
  AlertGroupUrgency,
  AlertGroupCategory,
  AlertGroupTiming,
  AlertGroup,
  TimelineItem,
} from "@/types/dashboard";

describe("Dashboard Types", () => {
  it("AlertGroupUrgency_유니온이_3가지_값을_허용한다", () => {
    const urgencies: AlertGroupUrgency[] = ["critical", "warning", "caution"];
    expect(urgencies).toHaveLength(3);
  });

  it("AlertGroupCategory_유니온이_3가지_값을_허용한다", () => {
    const categories: AlertGroupCategory[] = ["socialInsurance", "guaranteeInsurance", "other"];
    expect(categories).toHaveLength(3);
  });

  it("AlertGroupTiming_유니온이_2가지_값을_허용한다", () => {
    const timings: AlertGroupTiming[] = ["immediate", "scheduled"];
    expect(timings).toHaveLength(2);
  });

  it("DeadlineUrgency_유니온이_4가지_값을_허용한다", () => {
    const urgencies: DeadlineUrgency[] = ["overdue", "d7", "d30", "safe"];
    expect(urgencies).toHaveLength(4);
  });

  it("AlertGroup_구조가_올바르다", () => {
    const alertGroup: AlertGroup = {
      deadlineType: "VISA_EXPIRY",
      label: "비자 만료 임박",
      count: 3,
      urgency: "critical",
      category: "socialInsurance",
      timing: "immediate",
      href: "/alerts/visa",
    };
    expect(alertGroup.count).toBe(3);
    expect(alertGroup.urgency).toBe("critical");
    expect(alertGroup.category).toBe("socialInsurance");
    expect(alertGroup.timing).toBe("immediate");
  });

  it("TimelineItem_구조가_올바르다", () => {
    const timelineItem: TimelineItem = {
      id: "1",
      date: "2026-04-15",
      deadlineLabel: "비자 만료",
      workerName: "John Doe",
      urgency: "d7",
    };
    expect(timelineItem.workerName).toBe("John Doe");
    expect(timelineItem.urgency).toBe("d7");
  });

  it("DashboardResponse_구조가_올바르다", () => {
    const response: DashboardResponse = {
      stats: {
        totalWorkers: 12,
        visaBreakdown: [{ type: "E9", count: 8 }],
        insuranceRate: 91.7,
        insuranceRateChange: 4.2,
        upcomingDeadlines: 5,
        deadlineBreakdown: { d7: 2, d30: 3 },
        urgentActions: 3,
        urgentBreakdown: { visa: 1, insurance: 2, socialInsurance: 2, guaranteeInsurance: 0 },
      },
      alertGroups: [],
      visaDistribution: [],
      insuranceSummary: [],
      complianceScore: { score: 73, breakdown: [] },
      aiInsight: { content: "test", generatedAt: "2026-03-24T06:00:00+09:00" },
      timeline: [],
    };
    expect(response.stats.totalWorkers).toBe(12);
    expect(response.complianceScore.score).toBe(73);
    expect(response.alertGroups).toHaveLength(0);
    expect(response.timeline).toHaveLength(0);
  });
});
