import { describe, it, expect } from "vitest";
import { mockLegalChangesResponse, mockImpacts } from "@/mocks/legal-data";

describe("Legal types mock data shape", () => {
  it("LegalChangesResponse has required fields", () => {
    expect(mockLegalChangesResponse.changes).toHaveLength(3);
    expect(mockLegalChangesResponse.lastSyncedAt).toBeTruthy();
    for (const c of mockLegalChangesResponse.changes) {
      expect(c.id).toBeTruthy();
      expect(c.title).toBeTruthy();
      expect(c.severity).toBeTruthy();
      expect(c.status).toBeTruthy();
      expect(c.badge.text).toBeTruthy();
      expect(c.badge.color).toBeTruthy();
    }
  });

  it("LegalImpact has required fields", () => {
    for (const impact of Object.values(mockImpacts)) {
      expect(impact.changeId).toBeTruthy();
      expect(impact.impacts.length).toBeGreaterThan(0);
      expect(impact.aiAnalysis).toBeTruthy();
      expect(impact.actions.length).toBeGreaterThan(0);
    }
  });

  it("resolved change has no impact data", () => {
    expect(mockImpacts["lc-3"]).toBeUndefined();
  });
});
