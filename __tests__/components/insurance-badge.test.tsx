import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { InsuranceBadge } from "@/components/workers/insurance-badge";

describe("InsuranceBadge", () => {
  it("의무는_배지를_렌더링한다", () => {
    render(<InsuranceBadge status="의무" />);
    expect(screen.getByText("의무")).toBeDefined();
  });

  it("임의는_배지를_렌더링한다", () => {
    render(<InsuranceBadge status="임의" />);
    expect(screen.getByText("임의")).toBeDefined();
  });

  it("면제는_배지를_렌더링한다", () => {
    render(<InsuranceBadge status="면제" />);
    expect(screen.getByText("면제")).toBeDefined();
  });
});
