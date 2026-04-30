import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AiReportSection } from "@/components/benchmark/ai-report-section";

describe("AiReportSection", () => {
  it("다크_모드_패널_스타일을_포함한다", () => {
    const { container } = render(<AiReportSection aiReport="**진단** 결과입니다." />);
    const panel = container.firstElementChild as HTMLElement;

    expect(panel.className).toContain("dark:border-border");
    expect(panel.className).toContain("dark:from-card");
    expect(panel.className).toContain("dark:to-[oklch(0.16_0.03_260)]");
  });

  it("접힌_상태의_페이드도_다크_모드_배경을_사용한다", () => {
    const { container } = render(<AiReportSection aiReport={"긴 분석 결과입니다.\n\n".repeat(20)} />);
    const fade = container.querySelector(".bg-gradient-to-t") as HTMLElement;

    expect(fade.className).toContain("dark:from-card");
  });

  it("마크다운_콘텐츠를_렌더링한다", () => {
    render(<AiReportSection aiReport="**진단** 결과입니다." />);

    expect(screen.getByText("진단")).toBeInTheDocument();
    expect(screen.getByText(/결과입니다/)).toBeInTheDocument();
  });
});
