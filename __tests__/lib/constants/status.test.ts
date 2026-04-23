import { describe, it, expect } from "vitest";
import { DEADLINE_STATUS_BADGE_STYLES, DEADLINE_STATUS_CHART_COLORS } from "@/lib/constants/status";
import { DEADLINE_STATUSES } from "@/types/api";

describe("DEADLINE_STATUS_BADGE_STYLES", () => {
  it("모든_DeadlineStatus에_대한_스타일이_존재한다", () => {
    for (const status of DEADLINE_STATUSES) {
      expect(DEADLINE_STATUS_BADGE_STYLES[status]).toBeDefined();
      expect(typeof DEADLINE_STATUS_BADGE_STYLES[status]).toBe("string");
    }
  });
});

describe("DEADLINE_STATUS_CHART_COLORS", () => {
  it("APPROACHING과_URGENT에_대한_색상이_존재한다", () => {
    expect(DEADLINE_STATUS_CHART_COLORS.URGENT).toBe("var(--signal-orange)");
    expect(DEADLINE_STATUS_CHART_COLORS.APPROACHING).toBe("var(--signal-yellow)");
  });

  it("OVERDUE_COMPLETED_PENDING은_포함하지_않는다", () => {
    expect("OVERDUE" in DEADLINE_STATUS_CHART_COLORS).toBe(false);
    expect("COMPLETED" in DEADLINE_STATUS_CHART_COLORS).toBe(false);
    expect("PENDING" in DEADLINE_STATUS_CHART_COLORS).toBe(false);
  });
});
