import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { AiInsightBlock } from "@/components/legal/ai-insight-block";

describe("AiInsightBlock", () => {
  it("renders sanitized HTML content", () => {
    render(<AiInsightBlock html='<p>테스트 <strong class="text-signal-red">강조</strong></p>' />);
    expect(screen.getByText("강조")).toBeInTheDocument();
    expect(screen.getByText("강조").tagName).toBe("STRONG");
  });

  it("strips disallowed tags", () => {
    const { container } = render(<AiInsightBlock html='<p>안전</p><script>alert("xss")</script>' />);
    expect(container.querySelector("script")).toBeNull();
    expect(screen.getByText("안전")).toBeInTheDocument();
  });

  it("renders AI label", () => {
    render(<AiInsightBlock html="<p>내용</p>" />);
    expect(screen.getByText("✦ AI 영향 분석")).toBeInTheDocument();
  });
});
