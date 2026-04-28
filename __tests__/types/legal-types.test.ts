import { describe, it, expect } from "vitest";
import { mockLegalChangesResponse, mockImpacts } from "@/mocks/legal-data";

describe("Legal types mock data shape", () => {
  it("mockLegalChangesResponse has 11 items", () => {
    expect(mockLegalChangesResponse).toHaveLength(11);
  });

  it("each item has required LegalChange fields", () => {
    for (const c of mockLegalChangesResponse) {
      expect(c.id).toBeTypeOf("number");
      expect(c.title).toBeTruthy();
      expect(c.lawName).toBeTruthy();
      expect(c.category).toBeTruthy();
      expect(c.changeType).toBeTruthy();
      expect(c.effectiveDate).toBeTruthy();
      expect(c.summary).toBeTruthy();
      expect(["HIGH", "MEDIUM", "LOW"]).toContain(c.severity);
      expect(c.displayStatus).toBeTruthy();
      expect(c.sourceType).toBeTruthy();
    }
  });

  it("mockImpacts has LegalImpact fields", () => {
    for (const impact of Object.values(mockImpacts)) {
      expect(["HIGH", "MEDIUM", "LOW"]).toContain(impact.level);
      expect(impact.description).toBeTruthy();
      expect(impact.actions.length).toBeGreaterThan(0);
    }
  });

  it("acknowledged items have no impact data", () => {
    const acknowledgedIds = mockLegalChangesResponse
      .filter((c) => c.acknowledged)
      .map((c) => c.id);
    for (const id of acknowledgedIds) {
      expect(mockImpacts[id]).toBeUndefined();
    }
  });
});
