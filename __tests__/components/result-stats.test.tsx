import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ResultStats } from "@/components/simulator/result-stats";
import type { SimStatItem } from "@/types/simulator";

const stats = {
  allocation: { label: "배정 가능성", value: "높음", subText: "쿼터 여유 충분", color: "green" } as SimStatItem,
  competition: { label: "지역 경쟁도", value: "보통", subText: "밀집도 상위 35%", color: "orange" } as SimStatItem,
  duration: { label: "예상 소요기간", value: "3~5개월", subText: "내국인 구인노력 포함", color: "blue" } as SimStatItem,
};

describe("ResultStats", () => {
  it("3개_스탯_라벨을_렌더링한다", () => {
    render(<ResultStats stats={stats} />);
    expect(screen.getByText("배정 가능성")).toBeDefined();
    expect(screen.getByText("지역 경쟁도")).toBeDefined();
    expect(screen.getByText("예상 소요기간")).toBeDefined();
  });

  it("스탯_값을_렌더링한다", () => {
    render(<ResultStats stats={stats} />);
    expect(screen.getByText("높음")).toBeDefined();
    expect(screen.getByText("보통")).toBeDefined();
    expect(screen.getByText("3~5개월")).toBeDefined();
  });

  it("서브텍스트를_렌더링한다", () => {
    render(<ResultStats stats={stats} />);
    expect(screen.getByText("쿼터 여유 충분")).toBeDefined();
    expect(screen.getByText("밀집도 상위 35%")).toBeDefined();
    expect(screen.getByText("내국인 구인노력 포함")).toBeDefined();
  });
});
