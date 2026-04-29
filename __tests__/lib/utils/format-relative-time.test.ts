import { describe, it, expect, vi, afterEach } from "vitest";
import { formatRelativeTime } from "@/lib/utils/format-relative-time";

describe("formatRelativeTime", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("초_단위_차이를_반환한다", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-15T10:00:30Z"));
    expect(formatRelativeTime("2026-04-15T10:00:00Z")).toBe("30초 전");
  });

  it("분_단위_차이를_반환한다", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-15T10:05:00Z"));
    expect(formatRelativeTime("2026-04-15T10:00:00Z")).toBe("5분 전");
  });

  it("시간_단위_차이를_반환한다", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-15T13:00:00Z"));
    expect(formatRelativeTime("2026-04-15T10:00:00Z")).toBe("3시간 전");
  });

  it("일_단위_차이를_반환한다", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-17T10:00:00Z"));
    expect(formatRelativeTime("2026-04-15T10:00:00Z")).toBe("2일 전");
  });

  it("0초_차이이면_0초_전을_반환한다", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-15T10:00:00Z"));
    const result = formatRelativeTime("2026-04-15T10:00:00Z");
    expect(result).toMatch(/0초 전/);
  });
});
