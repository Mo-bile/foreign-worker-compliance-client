import { describe, it, expect } from "vitest";
import { mockDashboard } from "@/mocks/dashboard-data";

describe("mockDashboard", () => {
  it("stats_필드가_올바른_구조를_갖는다", () => {
    expect(mockDashboard.stats.totalWorkers).toBe(12);
    expect(mockDashboard.stats.visaBreakdown).toHaveLength(3);
    expect(mockDashboard.stats.insuranceRate).toBe(91.7);
    expect(mockDashboard.stats.urgentActions).toBe(3);
  });

  it("alerts가_3개_있다", () => {
    expect(mockDashboard.alerts).toHaveLength(3);
    expect(mockDashboard.alerts[0].level).toBe("critical");
    expect(mockDashboard.alerts[1].level).toBe("warning");
    expect(mockDashboard.alerts[2].level).toBe("info");
  });

  it("complianceScore_total이_73이다", () => {
    expect(mockDashboard.complianceScore.total).toBe(73);
    expect(mockDashboard.complianceScore.breakdown).toHaveLength(3);
  });

  it("upcomingDeadlines가_5개_있다", () => {
    expect(mockDashboard.upcomingDeadlines).toHaveLength(5);
  });

  it("모든_alert에_actions가_있다", () => {
    for (const alert of mockDashboard.alerts) {
      expect(alert.actions.length).toBeGreaterThan(0);
    }
  });
});
