import { describe, it, expect } from "vitest";
import type {
  DashboardResponse,
  DeadlineUrgency,
  AlertGroupUrgency,
  AlertGroup,
  TimelineItem,
} from "@/types/dashboard";

describe("Dashboard Types", () => {
  it("AlertGroupUrgency_유니온이_3가지_값을_허용한다", () => {
    const urgencies: AlertGroupUrgency[] = ["critical", "warning", "caution"];
    expect(urgencies).toHaveLength(3);
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
      href: "/alerts/visa",
    };
    expect(alertGroup.count).toBe(3);
    expect(alertGroup.urgency).toBe("critical");
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
        urgentBreakdown: { visa: 1, insurance: 2 },
      },
      alertGroups: [],
      visaDistribution: [],
      insuranceSummary: [],
      complianceScore: { total: 73, breakdown: [] },
      aiInsight: "test",
      timeline: [],
    };
    expect(response.stats.totalWorkers).toBe(12);
    expect(response.complianceScore.total).toBe(73);
    expect(response.alertGroups).toHaveLength(0);
    expect(response.timeline).toHaveLength(0);
  });
});
