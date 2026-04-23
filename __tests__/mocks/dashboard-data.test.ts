import { describe, it, expect } from "vitest";
import { mockDashboardRaw } from "@/mocks/dashboard-data";

describe("mockDashboardRaw", () => {
  it("stats_필드가_올바른_구조를_갖는다", () => {
    expect(mockDashboardRaw.stats.totalWorkers).toBe(12);
    expect(mockDashboardRaw.stats.visaBreakdown).toHaveLength(3);
    expect(mockDashboardRaw.stats.insuranceRate).toBe(91.7);
    expect(mockDashboardRaw.stats.urgentActions).toBe(3);
  });

  it("alerts가_3개_있고_BE_도메인_필드를_갖는다", () => {
    expect(mockDashboardRaw.alerts).toHaveLength(3);
    expect(mockDashboardRaw.alerts[0].deadlineType).toBe("VISA_EXPIRY");
    expect(mockDashboardRaw.alerts[0].status).toBe("URGENT");
    expect(mockDashboardRaw.alerts[1].deadlineType).toBe("HEALTH_INSURANCE_ENROLLMENT");
    expect(mockDashboardRaw.alerts[1].status).toBe("OVERDUE");
    expect(mockDashboardRaw.alerts[2].status).toBe("APPROACHING");
  });

  it("complianceScore_total이_73이다", () => {
    expect(mockDashboardRaw.complianceScore.score).toBe(73);
    expect(mockDashboardRaw.complianceScore.breakdown).toHaveLength(2);
  });

  it("upcomingDeadlines가_5개_있다", () => {
    expect(mockDashboardRaw.upcomingDeadlines).toHaveLength(5);
  });

  it("insuranceSummary가_BE_도메인_필드를_갖는다", () => {
    expect(mockDashboardRaw.insuranceSummary[0].insuranceType).toBe("NATIONAL_PENSION");
    expect(mockDashboardRaw.insuranceSummary[0].mandatoryCount).toBe(10);
    expect(mockDashboardRaw.insuranceSummary[0].totalWorkers).toBe(12);
  });
});
