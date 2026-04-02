import { describe, it, expect } from "vitest";
import { transformDashboardResponse } from "@/lib/transforms/dashboard-transform";
import type { DashboardRawResponse } from "@/types/dashboard";

const baseRaw: DashboardRawResponse = {
  stats: {
    totalWorkers: 12,
    visaBreakdown: [
      { visaType: "E9", count: 8 },
      { visaType: "H2", count: 3 },
      { visaType: "E7", count: 1 },
    ],
    insuranceRate: 91.7,
    upcomingDeadlines: 5,
    deadlineBreakdown: { d7: 2, d30: 3 },
    urgentActions: 3,
    urgentBreakdown: { visa: 1, insurance: 2 },
  },
  alerts: [
    {
      deadlineId: 1,
      workerId: 3,
      workerName: "Nguyen Van A",
      deadlineType: "VISA_EXPIRY",
      status: "URGENT",
      dDay: -4,
      dueDate: "2026-04-02",
      description: "비자 갱신 필요",
    },
    {
      deadlineId: 2,
      workerId: 5,
      workerName: "Pham Thi B",
      deadlineType: "INSURANCE_ENROLLMENT",
      status: "OVERDUE",
      dDay: 3,
      dueDate: "2026-03-26",
      description: "건강보험 미가입",
    },
    {
      deadlineId: 3,
      workerId: 7,
      workerName: "Rahman C",
      deadlineType: "CONTRACT_RENEWAL",
      status: "APPROACHING",
      dDay: -21,
      dueDate: "2026-04-19",
      description: "근로계약 갱신 필요",
    },
  ],
  visaDistribution: [
    { visaType: "E9", count: 8, percentage: 66.7 },
    { visaType: "H2", count: 3, percentage: 25.0 },
    { visaType: "E7", count: 1, percentage: 8.3 },
  ],
  insuranceSummary: [
    { insuranceType: "NATIONAL_PENSION", mandatoryCount: 10, totalWorkers: 12 },
    { insuranceType: "HEALTH_INSURANCE", mandatoryCount: 12, totalWorkers: 12 },
    { insuranceType: "EMPLOYMENT_INSURANCE", mandatoryCount: 9, totalWorkers: 12 },
    { insuranceType: "INDUSTRIAL_ACCIDENT", mandatoryCount: 12, totalWorkers: 12 },
  ],
  complianceScore: {
    total: 73,
    breakdown: [
      { category: "INSURANCE", score: 92 },
      { category: "DEADLINE", score: 65 },
    ],
  },
  aiInsight: "AI 인사이트 텍스트",
  upcomingDeadlines: [
    {
      deadlineId: 1,
      workerId: 3,
      workerName: "Nguyen Van A",
      visaType: "E9",
      deadlineType: "VISA_EXPIRY",
      status: "URGENT",
      dDay: -4,
      dueDate: "2026-04-02",
    },
    {
      deadlineId: 4,
      workerId: 8,
      workerName: "Li Wei D",
      visaType: "E7",
      deadlineType: "CHANGE_REPORT",
      status: "PENDING",
      dDay: -45,
      dueDate: "2026-05-13",
    },
  ],
};

describe("transformDashboardResponse", () => {
  it("기본_구조를_올바르게_변환한다", () => {
    const result = transformDashboardResponse(baseRaw);

    expect(result.stats).toBeDefined();
    expect(result.alertGroups).toBeDefined();
    expect(result.visaDistribution).toBeDefined();
    expect(result.insuranceSummary).toBeDefined();
    expect(result.complianceScore).toBeDefined();
    expect(result.aiInsight).toBe("AI 인사이트 텍스트");
    expect(result.timeline).toBeDefined();
  });

  describe("stats 변환", () => {
    it("visaBreakdown의_visaType을_type으로_변환한다", () => {
      const result = transformDashboardResponse(baseRaw);
      expect(result.stats.visaBreakdown[0]).toEqual({ type: "E9", count: 8 });
      expect(result.stats.visaBreakdown[1]).toEqual({ type: "H2", count: 3 });
    });

    it("insuranceRateChange를_null로_설정한다", () => {
      const result = transformDashboardResponse(baseRaw);
      expect(result.stats.insuranceRateChange).toBeNull();
    });

    it("나머지_stats_필드를_그대로_전달한다", () => {
      const result = transformDashboardResponse(baseRaw);
      expect(result.stats.totalWorkers).toBe(12);
      expect(result.stats.insuranceRate).toBe(91.7);
      expect(result.stats.upcomingDeadlines).toBe(5);
      expect(result.stats.deadlineBreakdown).toEqual({ d7: 2, d30: 3 });
      expect(result.stats.urgentActions).toBe(3);
      expect(result.stats.urgentBreakdown).toEqual({ visa: 1, insurance: 2 });
    });
  });

  describe("transformAlertGroups", () => {
    it("deadlineType별로 그룹핑한다 (3 types → 3 groups)", () => {
      const result = transformDashboardResponse(baseRaw);
      expect(result.alertGroups).toHaveLength(3);
      const types = result.alertGroups.map((g) => g.deadlineType);
      expect(types).toContain("VISA_EXPIRY");
      expect(types).toContain("INSURANCE_ENROLLMENT");
      expect(types).toContain("CONTRACT_RENEWAL");
    });

    it("그룹별 count가 해당 유형 알림 수와 일치한다", () => {
      const result = transformDashboardResponse(baseRaw);
      const visaGroup = result.alertGroups.find((g) => g.deadlineType === "VISA_EXPIRY");
      expect(visaGroup?.count).toBe(1);
    });

    it("dDay >= 0이면 urgency가 critical이다 (INSURANCE_ENROLLMENT dDay: 3)", () => {
      const result = transformDashboardResponse(baseRaw);
      const insuranceGroup = result.alertGroups.find(
        (g) => g.deadlineType === "INSURANCE_ENROLLMENT",
      );
      expect(insuranceGroup?.urgency).toBe("critical");
    });

    it("dDay가 -7 이상 0 미만이면 urgency가 warning이다 (VISA_EXPIRY dDay: -4)", () => {
      const result = transformDashboardResponse(baseRaw);
      const visaGroup = result.alertGroups.find((g) => g.deadlineType === "VISA_EXPIRY");
      expect(visaGroup?.urgency).toBe("warning");
    });

    it("dDay가 -7 미만이면 urgency가 caution이다", () => {
      const raw: DashboardRawResponse = {
        ...baseRaw,
        alerts: [{ ...baseRaw.alerts[0], dDay: -10 }],
      };
      const result = transformDashboardResponse(raw);
      const visaGroup = result.alertGroups.find((g) => g.deadlineType === "VISA_EXPIRY");
      expect(visaGroup?.urgency).toBe("caution");
    });

    it("그룹 내 가장 높은 urgency를 사용한다", () => {
      const raw: DashboardRawResponse = {
        ...baseRaw,
        alerts: [
          { ...baseRaw.alerts[0], deadlineType: "VISA_EXPIRY", dDay: -10 }, // caution
          { ...baseRaw.alerts[1], deadlineType: "VISA_EXPIRY", dDay: 3 }, // critical
        ],
      };
      const result = transformDashboardResponse(raw);
      const visaGroup = result.alertGroups.find((g) => g.deadlineType === "VISA_EXPIRY");
      expect(visaGroup?.urgency).toBe("critical");
    });

    it("가장 긴급한 순으로 정렬한다 (critical → warning → caution)", () => {
      const result = transformDashboardResponse(baseRaw);
      const urgencies = result.alertGroups.map((g) => g.urgency);
      const order = { critical: 0, warning: 1, caution: 2 };
      for (let i = 0; i < urgencies.length - 1; i++) {
        expect(order[urgencies[i]]).toBeLessThanOrEqual(order[urgencies[i + 1]]);
      }
    });

    it("label에 ALERT_TITLE_MAP 값을 사용한다 (\"비자 만료 임박\")", () => {
      const result = transformDashboardResponse(baseRaw);
      const visaGroup = result.alertGroups.find((g) => g.deadlineType === "VISA_EXPIRY");
      expect(visaGroup?.label).toBe("비자 만료 임박");
    });

    it("href가 /compliance?type={deadlineType} 형태이다", () => {
      const result = transformDashboardResponse(baseRaw);
      const visaGroup = result.alertGroups.find((g) => g.deadlineType === "VISA_EXPIRY");
      expect(visaGroup?.href).toBe("/compliance?type=VISA_EXPIRY");
    });

    it("alerts가 빈 배열이면 빈 배열을 반환한다", () => {
      const raw: DashboardRawResponse = { ...baseRaw, alerts: [] };
      const result = transformDashboardResponse(raw);
      expect(result.alertGroups).toEqual([]);
    });

    it("ALERT_TITLE_MAP에_없는_deadlineType은_raw_값을_label로_사용한다", () => {
      const raw: DashboardRawResponse = {
        ...baseRaw,
        alerts: [{ ...baseRaw.alerts[0], deadlineType: "UNKNOWN_TYPE" as any, dDay: -4 }],
      };
      const result = transformDashboardResponse(raw);
      expect(result.alertGroups[0].label).toBe("UNKNOWN_TYPE");
    });
  });

  describe("visaDistribution 변환", () => {
    it("visaType을_type으로_변환한다", () => {
      const result = transformDashboardResponse(baseRaw);
      expect(result.visaDistribution[0]).toEqual({ type: "E9", count: 8, percentage: 66.7 });
    });
  });

  describe("insuranceSummary 변환", () => {
    it("insuranceType을_한글_label로_변환한다", () => {
      const result = transformDashboardResponse(baseRaw);
      expect(result.insuranceSummary[0].label).toBe("국민연금");
      expect(result.insuranceSummary[1].label).toBe("건강보험");
      expect(result.insuranceSummary[2].label).toBe("고용보험");
      expect(result.insuranceSummary[3].label).toBe("산재보험");
    });

    it("enrolled에_mandatoryCount를_사용한다", () => {
      const result = transformDashboardResponse(baseRaw);
      expect(result.insuranceSummary[0].enrolled).toBe(10);
    });

    it("mandatoryCount_==_totalWorkers이면_status_ok", () => {
      const result = transformDashboardResponse(baseRaw);
      expect(result.insuranceSummary[1].status).toBe("ok");
      expect(result.insuranceSummary[1].statusText).toBe("✓ 전원");
    });

    it("mandatoryCount_<_totalWorkers이면_status_warn", () => {
      const result = transformDashboardResponse(baseRaw);
      expect(result.insuranceSummary[0].status).toBe("warn");
      expect(result.insuranceSummary[0].statusText).toBe("2 미가입");
    });

    it("type에_insuranceType을_그대로_전달한다", () => {
      const result = transformDashboardResponse(baseRaw);
      expect(result.insuranceSummary[0].type).toBe("NATIONAL_PENSION");
    });
  });

  describe("complianceScore 변환", () => {
    it("category를_한글_label로_변환한다", () => {
      const result = transformDashboardResponse(baseRaw);
      expect(result.complianceScore.breakdown[0].label).toBe("보험 가입");
      expect(result.complianceScore.breakdown[1].label).toBe("데드라인 준수");
    });

    it("total을_그대로_전달한다", () => {
      const result = transformDashboardResponse(baseRaw);
      expect(result.complianceScore.total).toBe(73);
    });

    it("COMPLIANCE_CATEGORY_LABEL_MAP에_등록된_category는_한글_label로_변환한다", () => {
      const raw: DashboardRawResponse = {
        ...baseRaw,
        complianceScore: {
          total: 50,
          breakdown: [{ category: "WAGE", score: 50 }],
        },
      };
      const result = transformDashboardResponse(raw);
      expect(result.complianceScore.breakdown[0].label).toBe("임금 경쟁력");
    });
  });

  describe("timeline 변환", () => {
    it("dDay 오름차순으로 정렬한다", () => {
      const result = transformDashboardResponse(baseRaw);
      const dDays = result.timeline.map((item) => {
        const raw = baseRaw.upcomingDeadlines.find((d) => String(d.deadlineId) === item.id);
        return raw?.dDay ?? 0;
      });
      for (let i = 0; i < dDays.length - 1; i++) {
        expect(dDays[i]).toBeLessThanOrEqual(dDays[i + 1]);
      }
    });

    it("최대 5개만 반환한다", () => {
      const raw: DashboardRawResponse = {
        ...baseRaw,
        upcomingDeadlines: [
          { ...baseRaw.upcomingDeadlines[0], deadlineId: 1, dDay: 1 },
          { ...baseRaw.upcomingDeadlines[0], deadlineId: 2, dDay: 2 },
          { ...baseRaw.upcomingDeadlines[0], deadlineId: 3, dDay: 3 },
          { ...baseRaw.upcomingDeadlines[0], deadlineId: 4, dDay: 4 },
          { ...baseRaw.upcomingDeadlines[0], deadlineId: 5, dDay: 5 },
          { ...baseRaw.upcomingDeadlines[0], deadlineId: 6, dDay: 6 },
        ],
      };
      const result = transformDashboardResponse(raw);
      expect(result.timeline).toHaveLength(5);
    });

    it('dueDate를 M월 D일 형식으로 변환한다 ("2026-05-13" → "5월 13일")', () => {
      const result = transformDashboardResponse(baseRaw);
      const firstItem = result.timeline[0];
      expect(firstItem.date).toBe("5월 13일");
    });

    it('deadlineLabel에 한글 레이블을 사용한다 ("비자 만료")', () => {
      const result = transformDashboardResponse(baseRaw);
      const visaItem = result.timeline.find((item) => item.id === "1");
      expect(visaItem?.deadlineLabel).toBe("비자 만료");
    });

    it("status를 urgency로 매핑한다 (URGENT → d7)", () => {
      const result = transformDashboardResponse(baseRaw);
      const visaItem = result.timeline.find((item) => item.id === "1");
      expect(visaItem?.urgency).toBe("d7");
    });

    it("빈 배열이면 빈 배열을 반환한다", () => {
      const raw: DashboardRawResponse = { ...baseRaw, upcomingDeadlines: [] };
      const result = transformDashboardResponse(raw);
      expect(result.timeline).toEqual([]);
    });

    it("알_수_없는_status는_overdue로_매핑한다", () => {
      const raw: DashboardRawResponse = {
        ...baseRaw,
        upcomingDeadlines: [{ ...baseRaw.upcomingDeadlines[0], status: "UNKNOWN" as any }],
      };
      const result = transformDashboardResponse(raw);
      expect(result.timeline[0].urgency).toBe("overdue");
    });

    it("잘못된_날짜_형식은_원본을_반환한다", () => {
      const raw: DashboardRawResponse = {
        ...baseRaw,
        upcomingDeadlines: [{ ...baseRaw.upcomingDeadlines[0], dueDate: "invalid-date" }],
      };
      const result = transformDashboardResponse(raw);
      expect(result.timeline[0].date).toBe("invalid-date");
    });

    it("0_패딩_날짜를_올바르게_변환한다", () => {
      const raw: DashboardRawResponse = {
        ...baseRaw,
        upcomingDeadlines: [{ ...baseRaw.upcomingDeadlines[0], dueDate: "2026-01-09" }],
      };
      const result = transformDashboardResponse(raw);
      expect(result.timeline[0].date).toBe("1월 9일");
    });
  });
});
