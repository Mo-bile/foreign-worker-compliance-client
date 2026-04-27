import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ImpactBox } from "@/components/legal/impact-box";

describe("ImpactBox", () => {
  it("renders level, description, and actions", () => {
    render(
      <ImpactBox
        level="HIGH"
        description="사업장 내 영향도가 높은 법령 변경입니다."
        actions={["서류를 검토하세요", "담당자에게 공유하세요"]}
      />,
    );

    expect(screen.getByText("✦ AI 분석 — 공식 출처 + 사업장 컨텍스트 기반")).toBeInTheDocument();
    expect(screen.getByText("영향도: 높음")).toBeInTheDocument();
    expect(screen.getByText("사업장 내 영향도가 높은 법령 변경입니다.")).toBeInTheDocument();
    expect(screen.getByText("→ 서류를 검토하세요")).toBeInTheDocument();
    expect(screen.getByText("→ 담당자에게 공유하세요")).toBeInTheDocument();
  });

  it.each([
    ["HIGH", "높음"],
    ["MEDIUM", "보통"],
    ["LOW", "낮음"],
  ])("renders %s level as %s", (level, label) => {
    render(<ImpactBox level={level} />);
    expect(screen.getByText(`영향도: ${label}`)).toBeInTheDocument();
  });

  it("renders only the title when optional props are empty or missing", () => {
    render(<ImpactBox actions={[]} />);

    expect(screen.getByText("✦ AI 분석 — 공식 출처 + 사업장 컨텍스트 기반")).toBeInTheDocument();
    expect(screen.getByText("AI 분석 데이터가 없습니다")).toBeInTheDocument();
    expect(screen.queryByText(/영향도:/)).not.toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  it("renders title", () => {
    render(<ImpactBox />);
    expect(screen.getByText("✦ AI 분석 — 공식 출처 + 사업장 컨텍스트 기반")).toBeInTheDocument();
  });
});
