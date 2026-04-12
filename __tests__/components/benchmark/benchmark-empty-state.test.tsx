import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BenchmarkEmptyState } from "@/components/benchmark/benchmark-empty-state";

describe("BenchmarkEmptyState", () => {
  it("CTA 버튼을 표시한다", () => {
    render(
      <BenchmarkEmptyState onCreateBenchmark={() => {}} isLoading={false} />,
    );

    expect(screen.getByText("사업장 진단 실행")).toBeInTheDocument();
  });

  it("CTA 클릭 시 콜백을 호출한다", () => {
    const onCreateBenchmark = vi.fn();
    render(
      <BenchmarkEmptyState
        onCreateBenchmark={onCreateBenchmark}
        isLoading={false}
      />,
    );

    fireEvent.click(screen.getByText("사업장 진단 실행"));
    expect(onCreateBenchmark).toHaveBeenCalledOnce();
  });

  it("로딩 중에는 버튼이 비활성화된다", () => {
    render(
      <BenchmarkEmptyState onCreateBenchmark={() => {}} isLoading={true} />,
    );

    expect(screen.getByText("진단 중...")).toBeInTheDocument();
    expect(screen.getByRole("button")).toBeDisabled();
  });
});
