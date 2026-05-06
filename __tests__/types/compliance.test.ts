import { describe, expect, it } from "vitest";
import {
  completeDeadlinePayloadSchema,
  DEADLINE_COMPLETION_FIELDS,
} from "@/types/compliance";
import { DEADLINE_TYPES } from "@/types/api";

describe("completeDeadlinePayloadSchema", () => {
  it("최소_payload_completedAt만_통과시킨다", () => {
    const result = completeDeadlinePayloadSchema.safeParse({ completedAt: "2026-05-06" });
    expect(result.success).toBe(true);
  });

  it("evidenceUrl_빈_문자열은_undefined로_변환된다", () => {
    const result = completeDeadlinePayloadSchema.safeParse({
      completedAt: "2026-05-06",
      evidenceUrl: "",
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.evidenceUrl).toBeUndefined();
  });

  it("nextDueDate가_completedAt보다_이전이면_실패", () => {
    const result = completeDeadlinePayloadSchema.safeParse({
      completedAt: "2026-05-06",
      nextDueDate: "2026-05-05",
    });
    expect(result.success).toBe(false);
  });

  it("renewedUntil이_completedAt보다_이전이면_실패", () => {
    const result = completeDeadlinePayloadSchema.safeParse({
      completedAt: "2026-05-06",
      renewedUntil: "2026-05-05",
    });
    expect(result.success).toBe(false);
  });

  it("evidenceUrl이_URL이_아니면_실패", () => {
    const result = completeDeadlinePayloadSchema.safeParse({
      completedAt: "2026-05-06",
      evidenceUrl: "not-a-url",
    });
    expect(result.success).toBe(false);
  });

  it("note가_1000자_초과면_실패", () => {
    const result = completeDeadlinePayloadSchema.safeParse({
      completedAt: "2026-05-06",
      note: "x".repeat(1001),
    });
    expect(result.success).toBe(false);
  });
});

describe("DEADLINE_COMPLETION_FIELDS", () => {
  it("9개_DeadlineType_모두에_대해_매핑이_존재한다", () => {
    for (const type of DEADLINE_TYPES) {
      expect(DEADLINE_COMPLETION_FIELDS[type]).toBeDefined();
      expect(DEADLINE_COMPLETION_FIELDS[type].length).toBeGreaterThan(0);
    }
  });

  it("모든_매핑의_첫_원소는_completedAt이다", () => {
    for (const type of DEADLINE_TYPES) {
      expect(DEADLINE_COMPLETION_FIELDS[type][0]).toBe("completedAt");
    }
  });

  it("EXIT_GUARANTEE_INSURANCE는_renewedUntil과_evidenceUrl을_포함한다", () => {
    const fields = DEADLINE_COMPLETION_FIELDS.EXIT_GUARANTEE_INSURANCE;
    expect(fields).toContain("renewedUntil");
    expect(fields).toContain("evidenceUrl");
  });

  it("VISA_EXPIRY와_CONTRACT_RENEWAL은_nextDueDate를_포함한다", () => {
    expect(DEADLINE_COMPLETION_FIELDS.VISA_EXPIRY).toContain("nextDueDate");
    expect(DEADLINE_COMPLETION_FIELDS.CONTRACT_RENEWAL).toContain("nextDueDate");
  });
});
