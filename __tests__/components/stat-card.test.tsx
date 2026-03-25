import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatCard } from "@/components/dashboard/stat-card";
import { Users } from "lucide-react";

describe("StatCard", () => {
  it("타이틀과_값을_렌더링한다", () => {
    render(<StatCard title="전체 근로자" value={42} icon={Users} isLoading={false} />);
    expect(screen.getByText("전체 근로자")).toBeDefined();
    expect(screen.getByText("42")).toBeDefined();
  });

  it("로딩_중에_스켈레톤을_표시한다", () => {
    render(<StatCard title="전체 근로자" value={undefined} icon={Users} isLoading={true} />);
    expect(document.querySelectorAll("[data-slot='skeleton']").length).toBeGreaterThan(0);
    expect(screen.queryByText("0")).toBeNull();
  });

  it("에러_상태에서_대시를_표시한다", () => {
    render(<StatCard title="전체 근로자" value={undefined} icon={Users} isLoading={false} isError />);
    expect(screen.getByText("—")).toBeDefined();
  });

  it("value가_undefined이면_0을_표시한다", () => {
    render(<StatCard title="전체 근로자" value={undefined} icon={Users} isLoading={false} />);
    expect(screen.getByText("0")).toBeDefined();
  });

  it("기본적으로_border-t-[3px]_클래스를_포함한다", () => {
    const { container } = render(
      <StatCard title="전체 근로자" value={10} icon={Users} isLoading={false} />,
    );
    const card = container.firstElementChild as HTMLElement;
    expect(card.className).toContain("border-t-[3px]");
  });

  it("className_prop이_Card에_병합된다", () => {
    const { container } = render(
      <StatCard
        title="전체 근로자"
        value={10}
        icon={Users}
        isLoading={false}
        className="border-t-[color:var(--signal-red)]"
      />,
    );
    const card = container.firstElementChild as HTMLElement;
    expect(card.className).toContain("border-t-[3px]");
    expect(card.className).toContain("border-t-[color:var(--signal-red)]");
  });

  it("className_없이도_정상_렌더한다", () => {
    const { container } = render(
      <StatCard title="전체 근로자" value={5} icon={Users} isLoading={false} />,
    );
    const card = container.firstElementChild as HTMLElement;
    expect(card.className).toContain("border-t-[3px]");
    expect(card.className).not.toContain("undefined");
  });

  it("urgent_variant에서_signal-red-bg_배경을_적용한다", () => {
    const { container } = render(
      <StatCard
        title="긴급 조치"
        value={3}
        icon={Users}
        isLoading={false}
        variant="urgent"
      />,
    );
    const card = container.firstElementChild as HTMLElement;
    expect(card.className).toContain("bg-signal-red-bg");
  });

  it("subtitle을_렌더링한다", () => {
    render(
      <StatCard
        title="등록 근로자"
        value={12}
        icon={Users}
        isLoading={false}
        subtitle="E-9 8명 · H-2 3명 · E-7 1명"
      />,
    );
    expect(screen.getByText("E-9 8명 · H-2 3명 · E-7 1명")).toBeDefined();
  });

  it("change_prop으로_변동을_표시한다", () => {
    render(
      <StatCard
        title="보험 가입률"
        value={91.7}
        icon={Users}
        isLoading={false}
        change={{ direction: "up", text: "전월 대비 4.2%p 개선" }}
      />,
    );
    expect(screen.getByText(/전월 대비 4.2%p 개선/)).toBeDefined();
  });

  it("change_up일_때_signal-green_색상이다", () => {
    const { container } = render(
      <StatCard
        title="보험"
        value={91}
        icon={Users}
        isLoading={false}
        change={{ direction: "up", text: "개선" }}
      />,
    );
    const changeEl = container.querySelector("[data-testid='stat-change']") as HTMLElement;
    expect(changeEl.className).toContain("text-signal-green");
  });

  it("change_down일_때_signal-red_색상이다", () => {
    const { container } = render(
      <StatCard
        title="보험"
        value={80}
        icon={Users}
        isLoading={false}
        change={{ direction: "down", text: "하락" }}
      />,
    );
    const changeEl = container.querySelector("[data-testid='stat-change']") as HTMLElement;
    expect(changeEl.className).toContain("text-signal-red");
  });

  it("valueSuffix를_렌더링한다", () => {
    render(
      <StatCard
        title="보험 가입률"
        value={91.7}
        icon={Users}
        isLoading={false}
        valueSuffix="%"
      />,
    );
    expect(screen.getByText("%")).toBeDefined();
  });
});
