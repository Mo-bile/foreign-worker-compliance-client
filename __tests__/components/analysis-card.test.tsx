import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AnalysisCard } from "@/components/simulator/analysis-card";
import type { AnalysisSection } from "@/types/simulator";

const section: AnalysisSection = {
  id: "quota",
  icon: "BarChart3",
  title: "쿼터 분석",
  badge: { text: "여유", color: "green" },
  dataRows: [
    { key: "업종별 배정 쿼터", value: "4,200명" },
    { key: "현재 배정 인원", value: "2,856명" },
  ],
  progress: { label: "소진율", value: 68, level: "mid" },
  dataSources: [{ name: "고용노동부", dataId: "15002263" }],
  aiInsight: "현재 소진율 <strong>68%</strong>는 양호한 수준입니다.",
};

describe("AnalysisCard", () => {
  it("제목과_배지를_렌더링한다", () => {
    render(<AnalysisCard section={section} defaultOpen />);
    expect(screen.getByText("쿼터 분석")).toBeDefined();
    expect(screen.getByText("여유")).toBeDefined();
  });

  it("데이터_행을_렌더링한다", () => {
    render(<AnalysisCard section={section} defaultOpen />);
    expect(screen.getByText("업종별 배정 쿼터")).toBeDefined();
    expect(screen.getByText("4,200명")).toBeDefined();
  });

  it("프로그레스_바를_렌더링한다", () => {
    render(<AnalysisCard section={section} defaultOpen />);
    expect(screen.getByText("소진율")).toBeDefined();
    expect(screen.getByText("68%")).toBeDefined();
  });

  it("데이터_소스_칩을_렌더링한다", () => {
    render(<AnalysisCard section={section} defaultOpen />);
    expect(screen.getByText("고용노동부")).toBeDefined();
  });

  it("AI_인사이트를_렌더링한다", () => {
    render(<AnalysisCard section={section} defaultOpen />);
    expect(screen.getByText(/양호한 수준/)).toBeDefined();
  });

  it("토글로_접고_펼칠_수_있다", () => {
    render(<AnalysisCard section={section} />);
    // Default closed
    const body = screen.queryByText("업종별 배정 쿼터");
    expect(body).toBeNull();

    // Click to open
    const header = screen.getByText("쿼터 분석");
    fireEvent.click(header);
    expect(screen.getByText("업종별 배정 쿼터")).toBeDefined();

    // Click to close
    fireEvent.click(header);
    expect(screen.queryByText("업종별 배정 쿼터")).toBeNull();
  });

  it("defaultOpen이_true이면_처음부터_열려있다", () => {
    render(<AnalysisCard section={section} defaultOpen />);
    expect(screen.getByText("업종별 배정 쿼터")).toBeDefined();
  });
});
