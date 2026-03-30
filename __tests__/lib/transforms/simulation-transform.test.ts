import { describe, it, expect } from "vitest";
import { transformSimulationResult } from "@/lib/transforms/simulation-transform";
import {
  mockWithinQuotaResponse,
  mockExceededResponse,
} from "@/mocks/simulator-data";

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
      employmentLimit: {
        ...mockWithinQuotaResponse.employmentLimit,
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

  it("첫_번째_row가_기본점수_60점이다", () => {
    expect(rows[0].label).toBe("기본 점수 (사업장 규모·업종)");
    expect(rows[0].score).toBe("60점");
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
      scoring: {
        ...mockWithinQuotaResponse.scoring,
        availableBonusItems: [],
      },
    });
    expect(noAvailable.scoring.improvement).toBeNull();
  });
});

// ─── Quota Round Rows ─────────────────────────────────────────────────────────

describe("quota roundRows 포맷", () => {
  const result = transformSimulationResult(mockWithinQuotaResponse);
  const rows = result.quota.roundRows;

  it("과거_차수는_allocation을_숫자_포맷으로_표시한다", () => {
    // "2025년 5차": allocation=10200
    expect(rows[0].allocation).toBe("10,200명");
    expect(rows[0].industryAllocation).toBe("1,836명");
    expect(rows[0].isCurrent).toBe(false);
    expect(rows[0].isFuture).toBe(false);
  });

  it("현재_차수는_industryAllocation에_≈_prefix가_붙는다", () => {
    // "2026년 2차 (현재)"
    expect(rows[2].isCurrent).toBe(true);
    expect(rows[2].industryAllocation).toBe("≈2,250명");
  });

  it("예정_차수는_allocation이_미공개_industryAllocation이_—이다", () => {
    // "2026년 3차 (예정)"
    expect(rows[3].isFuture).toBe(true);
    expect(rows[3].allocation).toBe("미공개");
    expect(rows[3].industryAllocation).toBe("—");
  });

  it("competitionRate가_null이면_—을_표시한다", () => {
    expect(rows[2].competitionRate).toBe("—");
    expect(rows[3].competitionRate).toBe("—");
  });

  it("competitionRate가_있으면_:1_형식으로_표시한다", () => {
    expect(rows[0].competitionRate).toBe("1.8:1");
    expect(rows[1].competitionRate).toBe("1.6:1");
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

  it("whatIf rows의_delta_0은_현재로_표시한다", () => {
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
      employmentLimit: {
        ...mockExceededResponse.employmentLimit,
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
