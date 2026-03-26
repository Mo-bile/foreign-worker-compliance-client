import { describe, it, expect } from "vitest";
import { mockComplianceReport } from "@/mocks/report-data";

describe("Report types mock data shape", () => {
  it("ComplianceReportResponse has required fields", () => {
    expect(mockComplianceReport.score).toBe(73);
    expect(mockComplianceReport.scoreChange).toBe(4);
    expect(mockComplianceReport.completed).toHaveLength(5);
    expect(mockComplianceReport.pending).toHaveLength(3);
    expect(mockComplianceReport.legalChanges).toHaveLength(2);
    expect(mockComplianceReport.upcoming).toHaveLength(3);
  });

  it("ChecklistItem has valid status values", () => {
    const validStatuses = ["done", "miss", "pending"];
    for (const item of [...mockComplianceReport.completed, ...mockComplianceReport.pending]) {
      expect(validStatuses).toContain(item.status);
    }
  });

  it("UpcomingItem has valid urgency values", () => {
    const validUrgencies = ["urgent", "warning", "normal"];
    for (const item of mockComplianceReport.upcoming) {
      expect(validUrgencies).toContain(item.urgency);
    }
  });
});
