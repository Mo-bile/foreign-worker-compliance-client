import { describe, it, expect } from "vitest";
import { mockLegalChangesResponse, mockImpacts } from "@/mocks/legal-data";
import { legalActionSchema, legalChangeSchema } from "@/types/legal";

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
    const acknowledgedIds = mockLegalChangesResponse.filter((c) => c.acknowledged).map((c) => c.id);
    for (const id of acknowledgedIds) {
      expect(mockImpacts[id]).toBeUndefined();
    }
  });
});

describe("legalChangeSchema 신규 5필드", () => {
  const baseValid = {
    id: 1,
    title: "test",
    lawName: "test",
    category: "LABOR",
    changeType: "ENFORCEMENT",
    effectiveDate: "2026-04-15",
    summary: "test",
    severity: "HIGH",
    acknowledged: false,
    displayStatus: "UPCOMING",
    sourceType: "LAW",
    officialSourceUrl: "https://www.law.go.kr/example",
    icon: "⚖️",
    detectedDate: "2026-03-18",
    dDay: -13,
    badge: { text: "조치 필요", color: "red" },
  } as const;

  it("5필드 + description 모두 포함 시 통과", () => {
    expect(() =>
      legalChangeSchema.parse({ ...baseValid, description: "test desc" }),
    ).not.toThrow();
  });

  it("description 누락 허용 (optional)", () => {
    expect(() => legalChangeSchema.parse(baseValid)).not.toThrow();
  });

  it("badge.color는 SignalColor enum만 허용", () => {
    expect(() =>
      legalChangeSchema.parse({
        ...baseValid,
        badge: { text: "x", color: "purple" },
      }),
    ).toThrow();
  });

  it("dDay null 허용", () => {
    expect(() => legalChangeSchema.parse({ ...baseValid, dDay: null })).not.toThrow();
  });
});

describe("legalActionSchema 신규", () => {
  it("label + primary boolean 검증", () => {
    expect(() => legalActionSchema.parse({ label: "확인", primary: true })).not.toThrow();
  });

  it("primary 누락 시 throw", () => {
    expect(() => legalActionSchema.parse({ label: "x" })).toThrow();
  });
});
