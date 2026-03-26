import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BenchmarkHeader } from "@/components/benchmark/benchmark-header";
import { AiSummaryBlock } from "@/components/benchmark/ai-summary-block";
import { QuickActionCards } from "@/components/benchmark/quick-action-cards";
import type { QuickActions } from "@/types/benchmark";

vi.mock("sonner", () => ({
  toast: vi.fn(),
}));

describe("BenchmarkHeader", () => {
  it("타이틀과_리포트_배지를_렌더링한다", () => {
    render(<BenchmarkHeader reportPeriod="2026년 1분기" />);
    expect(screen.getByText("사업장 건강검진")).toBeDefined();
    expect(screen.getByText("2026년 1분기 리포트")).toBeDefined();
  });

  it("PDF_버튼을_렌더링한다", () => {
    render(<BenchmarkHeader reportPeriod="2026년 1분기" />);
    expect(screen.getByRole("button", { name: /PDF/ })).toBeDefined();
  });
});

describe("AiSummaryBlock", () => {
  it("AI_종합_진단_라벨을_렌더링한다", () => {
    render(<AiSummaryBlock html="<p>테스트</p>" />);
    expect(screen.getByText(/AI 종합 진단/)).toBeDefined();
  });

  it("살균된_HTML_콘텐츠를_렌더링한다", () => {
    render(<AiSummaryBlock html="<p>안전한 내용</p>" />);
    expect(screen.getByText("안전한 내용")).toBeDefined();
  });
});

describe("QuickActionCards", () => {
  const mockActions: QuickActions = {
    urgent: { count: 2, items: [{ text: "비자 만료" }, { text: "보험 미가입" }] },
    improvement: { count: 3, items: [{ text: "임금 조정" }] },
  };

  it("즉시_조치와_개선_권고를_렌더링한다", () => {
    render(<QuickActionCards actions={mockActions} />);
    expect(screen.getByText(/즉시 조치/)).toBeDefined();
    expect(screen.getByText(/개선 권고/)).toBeDefined();
  });

  it("건수를_표시한다", () => {
    render(<QuickActionCards actions={mockActions} />);
    expect(screen.getByText(/2건/)).toBeDefined();
    expect(screen.getByText(/3건/)).toBeDefined();
  });
});
