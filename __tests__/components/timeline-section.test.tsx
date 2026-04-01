import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TimelineSection } from "@/components/simulator/timeline-section";
import type { TimelineDisplayData } from "@/types/simulator";

const mockData: TimelineDisplayData = {
  estimatedMonths: 4,
  preferredNationality: "VIETNAM",
  steps: [
    { title: "내국인 구인노력", duration: "약 14일", description: "워크넷 등록", source: "외국인고용법 시행령 제14조" },
    { title: "고용허가서 신청", duration: "약 1개월", description: "서류 제출", source: null },
    { title: "비자발급·입국", duration: "약 3개월", description: "입국", source: "외국인력지원센터 교육 일정" },
  ],
};

describe("TimelineSection", () => {
  it("예상 소요기간 뱃지를 표시한다", () => {
    render(<TimelineSection data={mockData} defaultOpen />);
    expect(screen.getByText("약 4개월")).toBeDefined();
  });

  it("각 step의 title과 description을 렌더링한다", () => {
    render(<TimelineSection data={mockData} defaultOpen />);
    expect(screen.getByText(/1\. 내국인 구인노력/)).toBeDefined();
    expect(screen.getByText("워크넷 등록")).toBeDefined();
    expect(screen.getByText(/2\. 고용허가서 신청/)).toBeDefined();
  });

  it("각 step의 duration 뱃지를 렌더링한다", () => {
    render(<TimelineSection data={mockData} defaultOpen />);
    expect(screen.getByText("약 14일")).toBeDefined();
    expect(screen.getByText("약 1개월")).toBeDefined();
  });

  it("국적별 비교 테이블이 없다", () => {
    const { container } = render(<TimelineSection data={mockData} defaultOpen />);
    expect(container.textContent).not.toContain("주요 송출국별");
    expect(container.textContent).not.toContain("평균 소요기간");
  });

  it("하이라이트 박스가 없다", () => {
    const { container } = render(<TimelineSection data={mockData} defaultOpen />);
    expect(container.textContent).not.toContain("현재 선택:");
  });

  it("source가 있으면 출처 텍스트를 렌더링한다", () => {
    render(<TimelineSection data={mockData} defaultOpen />);
    expect(screen.getByText("출처: 외국인고용법 시행령 제14조")).toBeDefined();
    expect(screen.getByText("출처: 외국인력지원센터 교육 일정")).toBeDefined();
  });

  it("source가 null이면 출처 텍스트를 렌더링하지 않는다", () => {
    const { container } = render(<TimelineSection data={mockData} defaultOpen />);
    const sourceTexts = container.querySelectorAll("span");
    const sourceContents = Array.from(sourceTexts).map((el) => el.textContent);
    expect(sourceContents.filter((t) => t?.startsWith("출처:"))).toHaveLength(2);
  });
});
