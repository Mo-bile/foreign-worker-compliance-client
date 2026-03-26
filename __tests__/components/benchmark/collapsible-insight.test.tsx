import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CollapsibleInsight } from "@/components/benchmark/collapsible-insight";

describe("CollapsibleInsight", () => {
  const content = "<p>테스트 AI 해석 내용</p>";

  it("defaultOpen이_true이면_내용이_보인다", () => {
    render(<CollapsibleInsight content={content} defaultOpen />);
    expect(screen.getByText("테스트 AI 해석 내용")).toBeDefined();
    expect(screen.getByText(/AI 해석 닫기/)).toBeDefined();
  });

  it("defaultOpen이_false이면_내용이_안_보인다", () => {
    render(<CollapsibleInsight content={content} />);
    expect(screen.queryByText("테스트 AI 해석 내용")).toBeNull();
    expect(screen.getByText(/AI 해석 보기/)).toBeDefined();
  });

  it("토글_버튼을_클릭하면_열고_닫힌다", () => {
    render(<CollapsibleInsight content={content} />);

    const toggle = screen.getByRole("button");
    expect(toggle.getAttribute("aria-expanded")).toBe("false");

    fireEvent.click(toggle);
    expect(toggle.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByText("테스트 AI 해석 내용")).toBeDefined();

    fireEvent.click(toggle);
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
  });

  it("HTML을_DOMPurify로_살균한다", () => {
    const malicious = '<p>safe</p><script>alert("xss")</script>';
    render(<CollapsibleInsight content={malicious} defaultOpen />);
    expect(screen.getByText("safe")).toBeDefined();
    expect(screen.queryByText('alert("xss")')).toBeNull();
  });
});
