import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AiInsightBlock } from "@/components/common/ai-insight-block";

describe("AiInsightBlock", () => {
  it("AI_분석_태그를_표시한다", () => {
    render(<AiInsightBlock content="테스트 인사이트" />);
    expect(screen.getByText("✦ AI 분석")).toBeDefined();
  });

  it("콘텐츠를_렌더링한다", () => {
    render(<AiInsightBlock content="<strong>중요</strong> 내용" />);
    expect(screen.getByText("중요")).toBeDefined();
  });

  it("면책_고지를_표시한다", () => {
    render(<AiInsightBlock content="테스트" />);
    expect(screen.getByText(/본 서비스는 법률 자문이 아닌 관리 보조 도구입니다/)).toBeDefined();
  });

  it("면책_고지를_숨길_수_있다", () => {
    render(<AiInsightBlock content="테스트" showDisclaimer={false} />);
    expect(screen.queryByText(/본 서비스는 법률 자문이 아닌 관리 보조 도구입니다/)).toBeNull();
  });

  it("XSS_스크립트를_제거한다", () => {
    const { container } = render(
      <AiInsightBlock content='<script>alert("xss")</script>안전한 텍스트' />,
    );
    expect(container.querySelector("script")).toBeNull();
    expect(screen.getByText("안전한 텍스트")).toBeDefined();
  });
});
