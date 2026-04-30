import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AiSummarySection } from "@/components/simulator/ai-summary-section";

describe("AiSummarySection", () => {
  it("AI 종합 안내 제목과 내용을 렌더링한다", () => {
    render(<AiSummarySection sanitizedHtml="<p>예상 결과 안내입니다.</p>" />);

    expect(screen.getByText("AI")).toBeInTheDocument();
    expect(screen.getByText("종합 안내")).toBeInTheDocument();
    expect(screen.getByText("예상 결과 안내입니다.")).toBeInTheDocument();
  });
});
