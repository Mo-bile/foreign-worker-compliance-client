import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ImpactBox } from "@/components/legal/impact-box";

describe("ImpactBox", () => {
  it("renders all impact items", () => {
    const impacts = ["영향 1", "영향 2", "영향 3"];
    render(<ImpactBox impacts={impacts} />);
    for (const impact of impacts) {
      expect(screen.getByText(`→ ${impact}`)).toBeInTheDocument();
    }
  });

  it("renders title", () => {
    render(<ImpactBox impacts={["영향 1"]} />);
    expect(screen.getByText("귀사 영향 분석")).toBeInTheDocument();
  });
});
