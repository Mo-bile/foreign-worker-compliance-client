import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { H2Badge } from "@/components/workers/h2-badge";

describe("H2Badge", () => {
  it("H2_비자에_배지를_렌더링한다", () => {
    render(<H2Badge visaTypeCode="H2" />);
    expect(screen.getByText("신규 발급 중단")).toBeInTheDocument();
  });

  it("E9_비자에_렌더링하지_않는다", () => {
    const { container } = render(<H2Badge visaTypeCode="E9" />);
    expect(container.innerHTML).toBe("");
  });

  it("F2_비자에_렌더링하지_않는다", () => {
    const { container } = render(<H2Badge visaTypeCode="F2" />);
    expect(container.innerHTML).toBe("");
  });
});
