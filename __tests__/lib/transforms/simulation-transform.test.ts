import { describe, it, expect } from "vitest";
import { transformSimulationResult } from "@/lib/transforms/simulation-transform";
import { mockWithinQuotaResponse, mockExceededResponse } from "@/mocks/simulator-data";

// ─── Within Quota ─────────────────────────────────────────────────────────────

describe("transformSimulationResult (WITHIN_QUOTA)", () => {
  const result = transformSimulationResult(mockWithinQuotaResponse);

  it("verdict가_WITHIN_QUOTA이다", () => {
    expect(result.verdict.verdict).toBe("WITHIN_QUOTA");
  });

  it("VerdictDisplayData_title이_추가_채용_가능이다", () => {
    expect(result.verdict.title).toBe("추가 채용 가능");
  });

  it("VerdictDisplayData_usagePercent를_올바르게_계산한다", () => {
    // currentForeignWorkerCount=12, totalLimit=16 → 75%
    expect(result.verdict.usagePercent).toBe(75);
  });

  it("VerdictDisplayData_progressLevel이_mid이다 (75%는 50이상_80미만)", () => {
    expect(result.verdict.progressLevel).toBe("mid");
  });

  it("VerdictDisplayData_remainingCapacity가_4이다", () => {
    expect(result.verdict.remainingCapacity).toBe(4);
  });

  it("VerdictDisplayData_totalLimit이_16이다", () => {
    expect(result.verdict.totalLimit).toBe(16);
  });
});

// ─── Exceeded ─────────────────────────────────────────────────────────────────

describe("transformSimulationResult (EXCEEDED)", () => {
  const result = transformSimulationResult(mockExceededResponse);

  it("verdict가_EXCEEDED이다", () => {
    expect(result.verdict.verdict).toBe("EXCEEDED");
  });

  it("VerdictDisplayData_title이_추가_채용_불가이다", () => {
    expect(result.verdict.title).toBe("추가 채용 불가");
  });

  it("VerdictDisplayData_usagePercent가_100이다 (16/16)", () => {
    expect(result.verdict.usagePercent).toBe(100);
  });

  it("VerdictDisplayData_progressLevel이_critical이다 (100%)", () => {
    expect(result.verdict.progressLevel).toBe("critical");
  });
});

// ─── Progress Level Boundaries ────────────────────────────────────────────────

describe("progressLevel 경계값", () => {
  const makeResult = (current: number, total: number) =>
    transformSimulationResult({
      ...mockWithinQuotaResponse,
      employmentLimitAnalysis: {
        ...mockWithinQuotaResponse.employmentLimitAnalysis,
        currentForeignWorkerCount: current,
        totalLimit: total,
        remainingCapacity: total - current,
        limitExceeded: false,
      },
    });

  it("percent < 50이면_low이다", () => {
    expect(makeResult(4, 10).verdict.progressLevel).toBe("low");
  });

  it("percent >= 50이면_mid이다", () => {
    expect(makeResult(5, 10).verdict.progressLevel).toBe("mid");
  });

  it("percent >= 80이면_high이다", () => {
    expect(makeResult(8, 10).verdict.progressLevel).toBe("high");
  });

  it("percent >= 100이면_critical이다", () => {
    expect(makeResult(10, 10).verdict.progressLevel).toBe("critical");
  });
});

// ─── Scoring Table Rows ───────────────────────────────────────────────────────

describe("scoring 테이블 rows", () => {
  const result = transformSimulationResult(mockWithinQuotaResponse);
  const rows = result.scoring.tableRows;

  it("첫_번째_row가_가점만점이다", () => {
    // mock maxPossibleScore = 84
    expect(rows[0].label).toBe("가점 만점");
    expect(rows[0].score).toBe("84점");
    expect(rows[0].status).toBe("—");
  });

  it("적용된_보너스_항목이_+점수_형식으로_표시된다", () => {
    // appliedBonusItems: DEPOPULATION_AREA +5, LABOR_LAW_COMPLIANCE +3
    expect(rows[1].label).toBe("인구감소지역 소재 사업장");
    expect(rows[1].score).toBe("+5점");
    expect(rows[1].status).toBe("✓");

    expect(rows[2].label).toBe("최근 2년간 노동관계법 위반 없음");
    expect(rows[2].score).toBe("+3점");
    expect(rows[2].status).toBe("✓");
  });

  it("미해당_보너스_항목이_0점_미해당으로_표시된다", () => {
    // availableBonusItems: PREMIUM_DORMITORY, NEW_WORKPLACE
    expect(rows[3].score).toBe("0점");
    expect(rows[3].status).toBe("미해당");

    expect(rows[4].score).toBe("0점");
    expect(rows[4].status).toBe("미해당");
  });

  it("마지막_row가_합계이며_estimatedScore로_표시된다", () => {
    const lastRow = rows[rows.length - 1];
    expect(lastRow.label).toBe("합계");
    expect(lastRow.score).toBe("68점");
  });

  it("row 순서: 기본점수 → applied → available → 합계", () => {
    // 총 1 + 2 applied + 2 available + 1 합계 = 6
    expect(rows).toHaveLength(6);
  });
});

// ─── Scoring percentileDisclaimer ────────────────────────────────────────────

describe("scoring percentileDisclaimer", () => {
  it("면책 문구가 포함된다", () => {
    const result = transformSimulationResult(mockWithinQuotaResponse);
    expect(result.scoring.percentileDisclaimer).toBe("참고용 추정치, 실제와 다를 수 있음");
  });
});

// ─── Scoring Improvement (best available bonus) ───────────────────────────────

describe("scoring improvement", () => {
  it("availableBonusItems 중 최고 점수 항목으로 improvement를 생성한다", () => {
    const result = transformSimulationResult(mockWithinQuotaResponse);
    const improvement = result.scoring.improvement;

    expect(improvement).not.toBeNull();
    // PREMIUM_DORMITORY(5) > NEW_WORKPLACE(3) → best = PREMIUM_DORMITORY
    expect(improvement!.improvementLabel).toBe("우수 기숙사 제공 시");
    expect(improvement!.currentScore).toBe(68);
    expect(improvement!.improvedScore).toBe(73); // 68 + 5
  });

  it("improvedScore는_currentScore + bestAvailable.score이다", () => {
    const result = transformSimulationResult(mockWithinQuotaResponse);
    const improvement = result.scoring.improvement!;
    expect(improvement.improvedScore).toBe(improvement.currentScore + 5);
  });

  it("availableBonusItems가_없으면_improvement는_null이다", () => {
    const noAvailable = transformSimulationResult({
      ...mockWithinQuotaResponse,
      scoringAnalysis: {
        ...mockWithinQuotaResponse.scoringAnalysis,
        availableBonusItems: [],
      },
    });
    expect(noAvailable.scoring.improvement).toBeNull();
  });
});

// ─── Quota Year Rows ──────────────────────────────────────────────────────────

describe("quota yearRows 포맷", () => {
  const result = transformSimulationResult(mockWithinQuotaResponse);

  it("industry와 currentYearQuota가 올바르게 설정된다", () => {
    expect(result.quota.industry).toBe("식료품제조업");
    expect(result.quota.currentYearQuota).toBe("12,500명");
  });

  it("recentHistory를 yearRows로 변환한다", () => {
    const rows = result.quota.yearRows;
    expect(rows).toHaveLength(3);
  });

  it("각 yearRow가 올바른 형식이다", () => {
    const rows = result.quota.yearRows;
    expect(rows[0].year).toBe(2024);
    expect(rows[0].quotaCount).toBe("9,800명");
    expect(rows[0].source).toBe("고용노동부 고시");
    expect(rows[0].isCurrent).toBe(false);
  });

  it("현재 연도 row의 isCurrent가 true이다", () => {
    const currentRow = result.quota.yearRows.find((r) => r.year === 2026);
    expect(currentRow?.isCurrent).toBe(true);
  });

  it("quotaCount가 숫자 포맷(콤마)으로 표시된다", () => {
    const rows = result.quota.yearRows;
    expect(rows[2].quotaCount).toBe("12,500명");
  });
});

// ─── whatIf ───────────────────────────────────────────────────────────────────

describe("whatIf", () => {
  it("WITHIN_QUOTA이면_whatIf가_null이다", () => {
    const result = transformSimulationResult(mockWithinQuotaResponse);
    expect(result.whatIf).toBeNull();
  });

  it("EXCEEDED이면_whatIf가_null이_아니다", () => {
    const result = transformSimulationResult(mockExceededResponse);
    expect(result.whatIf).not.toBeNull();
  });

  it("whatIf rows의_additionalDomesticCount_0은_현재로_표시한다", () => {
    const result = transformSimulationResult(mockExceededResponse);
    const rows = result.whatIf!.rows;
    const currentRow = rows.find((r) => r.domesticInsuredCount === 33);
    expect(currentRow?.delta).toBe("현재");
  });

  it("whatIf rows의_delta_양수는_+n명_형식으로_표시한다", () => {
    const result = transformSimulationResult(mockExceededResponse);
    const rows = result.whatIf!.rows;
    expect(rows[1].delta).toBe("+3명");
    expect(rows[2].delta).toBe("+7명");
    expect(rows[3].delta).toBe("+12명");
  });

  it("feasibilityLabel이_올바르게_매핑된다", () => {
    const result = transformSimulationResult(mockExceededResponse);
    const rows = result.whatIf!.rows;
    expect(rows[0].feasibilityLabel).toBe("불가");
    expect(rows[1].feasibilityLabel).toBe("부족");
    expect(rows[2].feasibilityLabel).toBe("가능");
    expect(rows[3].feasibilityLabel).toBe("여유");
  });

  it("minimumConditionText가 첫 번째 POSSIBLE 시나리오를 기반으로 생성된다", () => {
    const result = transformSimulationResult(mockExceededResponse);
    // POSSIBLE: domesticInsuredCount=40, delta=7
    expect(result.whatIf!.minimumConditionText).toContain("40명");
    expect(result.whatIf!.minimumConditionText).toContain("+7명");
  });

  it("EXCEEDED이지만_whatIfScenarios가_빈_배열이면_whatIf는_null이다", () => {
    const noScenarios = transformSimulationResult({
      ...mockExceededResponse,
      employmentLimitAnalysis: {
        ...mockExceededResponse.employmentLimitAnalysis,
        whatIfScenarios: [],
      },
    });
    expect(noScenarios.whatIf).toBeNull();
  });
});

// ─── Recommendation variant ───────────────────────────────────────────────────

describe("recommendation variant", () => {
  it("WITHIN_QUOTA이면_variant가_green이다", () => {
    const result = transformSimulationResult(mockWithinQuotaResponse);
    expect(result.recommendation.variant).toBe("green");
  });

  it("EXCEEDED이면_variant가_yellow이다", () => {
    const result = transformSimulationResult(mockExceededResponse);
    expect(result.recommendation.variant).toBe("yellow");
  });

  it("WITHIN_QUOTA이면_title이_다음_단계_안내이다", () => {
    const result = transformSimulationResult(mockWithinQuotaResponse);
    expect(result.recommendation.title).toBe("다음 단계 안내");
  });

  it("EXCEEDED이면_title이_대안_조치이다", () => {
    const result = transformSimulationResult(mockExceededResponse);
    expect(result.recommendation.title).toBe("대안 조치");
  });

  it("WITHIN_QUOTA의_items는_고정된_3개_안내_링크를_포함한다", () => {
    const result = transformSimulationResult(mockWithinQuotaResponse);
    const items = result.recommendation.items;
    expect(items).toHaveLength(3);
    expect(items[0].href).toBe("https://www.work.go.kr");
    expect(items[1].href).toBe("https://www.eps.go.kr");
    expect(items[2].href).toBe("https://www.work.go.kr/center");
  });

  it("EXCEEDED의_items는_aiInsights.actionItems에서_생성된다", () => {
    const result = transformSimulationResult(mockExceededResponse);
    const texts = result.recommendation.items.map((i) => i.text);
    expect(texts).toEqual(mockExceededResponse.aiInsights.actionItems);
  });
});

// ─── AI Summary Sanitization ──────────────────────────────────────────────────

describe("aiSummary sanitization", () => {
  it("허용된_태그(strong)는_유지된다", () => {
    const result = transformSimulationResult(mockWithinQuotaResponse);
    expect(result.aiSummary).toContain("<strong>");
  });

  it("script_태그는_제거된다", () => {
    const withScript = transformSimulationResult({
      ...mockWithinQuotaResponse,
      aiInsights: {
        ...mockWithinQuotaResponse.aiInsights,
        overallVerdict: "안전한 텍스트 <script>alert('xss')</script>",
      },
    });
    expect(withScript.aiSummary).not.toContain("<script>");
    expect(withScript.aiSummary).toContain("안전한 텍스트");
  });

  it("onclick_속성은_제거된다", () => {
    const withOnclick = transformSimulationResult({
      ...mockWithinQuotaResponse,
      aiInsights: {
        ...mockWithinQuotaResponse.aiInsights,
        overallVerdict: '<em onclick="evil()">텍스트</em>',
      },
    });
    expect(withOnclick.aiSummary).not.toContain("onclick");
    expect(withOnclick.aiSummary).toContain("<em>");
  });
});

// ─── Disclaimer pass-through ──────────────────────────────────────────────────

describe("disclaimer", () => {
  it("disclaimer가_그대로_전달된다", () => {
    const result = transformSimulationResult(mockWithinQuotaResponse);
    expect(result.disclaimer).toBe(mockWithinQuotaResponse.aiInsights.disclaimer);
  });

  it("exceeded 시나리오에서도_disclaimer가_그대로_전달된다", () => {
    const result = transformSimulationResult(mockExceededResponse);
    expect(result.disclaimer).toBe(mockExceededResponse.aiInsights.disclaimer);
  });
});

// ─── Top-level fields ─────────────────────────────────────────────────────────

describe("top-level 필드", () => {
  it("id가_문자열로_변환된다", () => {
    expect(transformSimulationResult(mockWithinQuotaResponse).id).toBe("1");
    expect(transformSimulationResult(mockExceededResponse).id).toBe("2");
  });

  it("createdAt이_그대로_전달된다", () => {
    const result = transformSimulationResult(mockWithinQuotaResponse);
    expect(result.createdAt).toBe("2026-03-30T14:32:00Z");
  });
});

// ─── Scoring rows with deductionCodes ────────────────────────────────────────

describe("scoring rows with deductionCodes", () => {
  it("deductionCodes에_DEPOPULATION_AREA가_포함되면_해당_row의_isDeduction이_true이고_점수가_-5점이다", () => {
    const deductionCodes = new Set(["DEPOPULATION_AREA"]);
    const result = transformSimulationResult(mockWithinQuotaResponse, deductionCodes);
    const rows = result.scoring.tableRows;

    // DEPOPULATION_AREA는 appliedBonusItems 첫 번째 → rows[1]
    expect(rows[1].isDeduction).toBe(true);
    expect(rows[1].score).toBe("-5점");
  });

  it("deductionCodes에_PREMIUM_DORMITORY가_포함되면_해당_available_row의_isDeduction이_true이다", () => {
    const deductionCodes = new Set(["PREMIUM_DORMITORY"]);
    const result = transformSimulationResult(mockWithinQuotaResponse, deductionCodes);
    const rows = result.scoring.tableRows;

    // PREMIUM_DORMITORY는 availableBonusItems 첫 번째 → rows[3]
    expect(rows[3].isDeduction).toBe(true);
    expect(rows[3].score).toBe("0점"); // available 항목은 여전히 0점
  });

  it("복수의_deductionCodes가_올바르게_적용된다", () => {
    const deductionCodes = new Set(["DEPOPULATION_AREA", "PREMIUM_DORMITORY"]);
    const result = transformSimulationResult(mockWithinQuotaResponse, deductionCodes);
    const rows = result.scoring.tableRows;

    expect(rows[1].isDeduction).toBe(true);
    expect(rows[1].score).toBe("-5점");

    expect(rows[2].isDeduction).toBe(false); // LABOR_LAW_COMPLIANCE는 감점 아님
    expect(rows[2].score).toBe("+3점");

    expect(rows[3].isDeduction).toBe(true); // PREMIUM_DORMITORY
    expect(rows[4].isDeduction).toBe(false); // NEW_WORKPLACE는 감점 아님
  });
});

// ─── Scoring improvement with deductionCodes ─────────────────────────────────

describe("scoring improvement with deductionCodes", () => {
  it("deductionCodes에_PREMIUM_DORMITORY가_포함되면_NEW_WORKPLACE가_improvement_후보가_된다", () => {
    const deductionCodes = new Set(["PREMIUM_DORMITORY"]);
    const result = transformSimulationResult(mockWithinQuotaResponse, deductionCodes);
    const improvement = result.scoring.improvement;

    expect(improvement).not.toBeNull();
    // PREMIUM_DORMITORY(5) 제외 → NEW_WORKPLACE(3)가 best
    expect(improvement!.improvementLabel).toBe("외국인 고용이 처음인 사업장 시");
    expect(improvement!.improvedScore).toBe(68 + 3);
  });

  it("모든_availableBonusItems가_deductionCodes에_포함되면_improvement는_null이다", () => {
    const deductionCodes = new Set(["PREMIUM_DORMITORY", "NEW_WORKPLACE"]);
    const result = transformSimulationResult(mockWithinQuotaResponse, deductionCodes);

    expect(result.scoring.improvement).toBeNull();
  });

  it("improvementLabel이_감점이_아닌_항목을_정확히_반영한다", () => {
    const deductionCodes = new Set(["NEW_WORKPLACE"]);
    const result = transformSimulationResult(mockWithinQuotaResponse, deductionCodes);
    const improvement = result.scoring.improvement;

    expect(improvement).not.toBeNull();
    // NEW_WORKPLACE(3) 제외 → PREMIUM_DORMITORY(5)가 best
    expect(improvement!.improvementLabel).toBe("우수 기숙사 제공 시");
    expect(improvement!.improvedScore).toBe(68 + 5);
  });
});

// ─── additionalCount ratePercent calculation ─────────────────────────────────

describe("additionalCount ratePercent 계산", () => {
  it("baseLimitAfterCap × ratePercent / 100 으로 additionalCount를 계산한다", () => {
    const result = transformSimulationResult({
      ...mockWithinQuotaResponse,
      employmentLimitAnalysis: {
        ...mockWithinQuotaResponse.employmentLimitAnalysis,
        baseLimitAfterCap: 20,
        additionalBonuses: [
          { reason: "인구감소지역", ratePercent: 20, cappedByDomesticCount: false },
        ],
      },
    });
    // Math.floor(20 * 20 / 100) = 4
    expect(result.verdict.additionalBonuses[0].additionalCount).toBe(4);
  });

  it("ratePercent가 undefined이면 additionalCount가 0이다", () => {
    const result = transformSimulationResult({
      ...mockWithinQuotaResponse,
      employmentLimitAnalysis: {
        ...mockWithinQuotaResponse.employmentLimitAnalysis,
        baseLimitAfterCap: 20,
        additionalBonuses: [
          {
            reason: "테스트",
            ratePercent: undefined as unknown as number,
            cappedByDomesticCount: false,
          },
        ],
      },
    });
    expect(result.verdict.additionalBonuses[0].additionalCount).toBe(0);
  });

  it("소수 결과는 Math.floor로 내림한다", () => {
    const result = transformSimulationResult({
      ...mockWithinQuotaResponse,
      employmentLimitAnalysis: {
        ...mockWithinQuotaResponse.employmentLimitAnalysis,
        baseLimitAfterCap: 15,
        additionalBonuses: [{ reason: "테스트", ratePercent: 10, cappedByDomesticCount: false }],
      },
    });
    // Math.floor(15 * 10 / 100) = Math.floor(1.5) = 1
    expect(result.verdict.additionalBonuses[0].additionalCount).toBe(1);
  });
});

// ─── buildTimeline output ────────────────────────────────────────────────────

describe("buildTimeline 출력", () => {
  const result = transformSimulationResult(mockWithinQuotaResponse);

  it("estimatedMonths가 그대로 전달된다", () => {
    expect(result.timeline.estimatedMonths).toBe(
      mockWithinQuotaResponse.timelineEstimate.estimatedMonths,
    );
  });

  it("preferredNationality가 그대로 전달된다", () => {
    expect(result.timeline.preferredNationality).toBe(
      mockWithinQuotaResponse.timelineEstimate.preferredNationality,
    );
  });

  it("stepName이 title로 매핑된다", () => {
    const firstStep = result.timeline.steps[0];
    expect(firstStep.title).toBe(mockWithinQuotaResponse.timelineEstimate.steps[0].stepName);
  });

  it("estimatedDays가 duration 문자열로 변환된다", () => {
    const steps = result.timeline.steps;
    // estimatedDays=14 → "약 14일"
    expect(steps[0].duration).toBe("약 14일");
    // estimatedDays=60 → "약 2개월"
    expect(steps[1].duration).toBe("약 2개월");
  });

  it("description이 그대로 전달된다", () => {
    const firstStep = result.timeline.steps[0];
    expect(firstStep.description).toBe(
      mockWithinQuotaResponse.timelineEstimate.steps[0].description,
    );
  });

  it("source가 있으면 그대로 전달된다", () => {
    const firstStep = result.timeline.steps[0];
    expect(firstStep.source).toBe(mockWithinQuotaResponse.timelineEstimate.steps[0].source);
  });

  it("source가 없으면 null로 변환된다", () => {
    const noSourceResult = transformSimulationResult({
      ...mockWithinQuotaResponse,
      timelineEstimate: {
        ...mockWithinQuotaResponse.timelineEstimate,
        steps: [{ stepName: "테스트", estimatedDays: 14, description: "소스 없음" }],
      },
    });
    expect(noSourceResult.timeline.steps[0].source).toBeNull();
  });

  it("source가 빈 문자열이면 null로 정규화된다", () => {
    const emptySourceResult = transformSimulationResult({
      ...mockWithinQuotaResponse,
      timelineEstimate: {
        ...mockWithinQuotaResponse.timelineEstimate,
        steps: [{ stepName: "테스트", estimatedDays: 14, description: "빈 소스", source: "" }],
      },
    });
    expect(emptySourceResult.timeline.steps[0].source).toBeNull();
  });
});

// ─── formatDays boundary ─────────────────────────────────────────────────────

describe("formatDays 경계값 (30일)", () => {
  it("estimatedDays=30이면 '약 1개월'로 변환된다", () => {
    const result = transformSimulationResult({
      ...mockWithinQuotaResponse,
      timelineEstimate: {
        ...mockWithinQuotaResponse.timelineEstimate,
        steps: [{ stepName: "테스트", estimatedDays: 30, description: "30일 경계" }],
      },
    });
    expect(result.timeline.steps[0].duration).toBe("약 1개월");
  });

  it("estimatedDays=29이면 '약 29일'로 변환된다", () => {
    const result = transformSimulationResult({
      ...mockWithinQuotaResponse,
      timelineEstimate: {
        ...mockWithinQuotaResponse.timelineEstimate,
        steps: [{ stepName: "테스트", estimatedDays: 29, description: "29일" }],
      },
    });
    expect(result.timeline.steps[0].duration).toBe("약 29일");
  });

  it("estimatedDays=45이면 '약 2개월'로 변환된다 (반올림)", () => {
    const result = transformSimulationResult({
      ...mockWithinQuotaResponse,
      timelineEstimate: {
        ...mockWithinQuotaResponse.timelineEstimate,
        steps: [{ stepName: "테스트", estimatedDays: 45, description: "45일" }],
      },
    });
    // Math.round(45/30) = Math.round(1.5) = 2
    expect(result.timeline.steps[0].duration).toBe("약 2개월");
  });
});

// ─── Recommendation empty actionItems fallback ───────────────────────────────

describe("recommendation empty actionItems fallback", () => {
  it("EXCEEDED이고_actionItems가_빈_배열이면_기본_안내_항목을_표시한다", () => {
    const result = transformSimulationResult({
      ...mockExceededResponse,
      aiInsights: {
        ...mockExceededResponse.aiInsights,
        actionItems: [],
      },
    });
    expect(result.recommendation.items).toHaveLength(1);
    expect(result.recommendation.items[0].text).toContain("고용센터");
  });
});

// ─── totalLimit=0 edge cases ─────────────────────────────────────────────────

describe("totalLimit=0 edge cases", () => {
  const makeZeroLimitResult = (currentForeignWorkerCount: number) =>
    transformSimulationResult({
      ...mockWithinQuotaResponse,
      employmentLimitAnalysis: {
        ...mockWithinQuotaResponse.employmentLimitAnalysis,
        totalLimit: 0,
        currentForeignWorkerCount,
        remainingCapacity: 0,
        limitExceeded: currentForeignWorkerCount > 0,
      },
    });

  it("totalLimit=0이고_currentForeignWorkerCount=5이면_usagePercent가_100이다", () => {
    const result = makeZeroLimitResult(5);
    expect(result.verdict.usagePercent).toBe(100);
  });

  it("totalLimit=0이고_currentForeignWorkerCount=0이면_usagePercent가_0이다", () => {
    const result = makeZeroLimitResult(0);
    expect(result.verdict.usagePercent).toBe(0);
  });
});
