import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { EndReasonDistributionCard } from "@/components/benchmark/end-reason-distribution-card";

describe("EndReasonDistributionCard", () => {
  it("9 reason 라벨 매핑 + 0건 사유 생략", () => {
    render(
      <EndReasonDistributionCard
        distribution={{
          CONTRACT_EXPIRY: 2,
          VOLUNTARY_RESIGNATION: 1,
          DISMISSAL: 0,
        }}
      />,
    );
    expect(screen.getByText("계약만료")).toBeInTheDocument();
    expect(screen.getByText("자발적 퇴사")).toBeInTheDocument();
    expect(screen.queryByText("해고")).toBeNull();
    expect(screen.getByText("총 3건")).toBeInTheDocument();
  });

  it("count desc 정렬", () => {
    const { container } = render(
      <EndReasonDistributionCard
        distribution={{
          VOLUNTARY_RESIGNATION: 1,
          CONTRACT_EXPIRY: 5,
          WORKPLACE_CHANGE: 3,
        }}
      />,
    );
    const labels = container.querySelectorAll("li .font-medium");
    expect(labels[0]?.textContent).toBe("계약만료");
    expect(labels[1]?.textContent).toBe("사업장 변경");
    expect(labels[2]?.textContent).toBe("자발적 퇴사");
  });

  it("percentage 표시 (1자리 소수)", () => {
    render(
      <EndReasonDistributionCard
        distribution={{ CONTRACT_EXPIRY: 1, VOLUNTARY_RESIGNATION: 2 }}
      />,
    );
    expect(screen.getByText(/2건 \(66\.7%\)/)).toBeInTheDocument();
    expect(screen.getByText(/1건 \(33\.3%\)/)).toBeInTheDocument();
  });

  it("empty state — total 0일 때 안내 메시지", () => {
    render(<EndReasonDistributionCard distribution={{}} />);
    expect(screen.getByText("최근 1년간 이직 기록이 없습니다.")).toBeInTheDocument();
  });
});
