import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CollapsibleCard } from "@/components/simulator/collapsible-card";

const defaultProps = {
  icon: <span>★</span>,
  iconColorClass: "bg-blue-100 text-blue-600",
  title: "테스트 카드 제목",
};

describe("CollapsibleCard", () => {
  describe("title 렌더링", () => {
    it("title prop이 화면에 표시된다", () => {
      render(
        <CollapsibleCard {...defaultProps}>
          <p>내용</p>
        </CollapsibleCard>,
      );
      expect(screen.getByText("테스트 카드 제목")).toBeDefined();
    });
  });

  describe("defaultOpen 동작", () => {
    it("defaultOpen=true이면 children이 처음부터 보인다", () => {
      render(
        <CollapsibleCard {...defaultProps} defaultOpen={true}>
          <p>펼쳐진 내용</p>
        </CollapsibleCard>,
      );
      expect(screen.getByText("펼쳐진 내용")).toBeDefined();
    });

    it("defaultOpen=false이면 children이 처음에 보이지 않는다", () => {
      render(
        <CollapsibleCard {...defaultProps} defaultOpen={false}>
          <p>접혀진 내용</p>
        </CollapsibleCard>,
      );
      expect(screen.queryByText("접혀진 내용")).toBeNull();
    });

    it("defaultOpen 미지정 시 children이 보이지 않는다 (기본값 false)", () => {
      render(
        <CollapsibleCard {...defaultProps}>
          <p>기본 접힌 내용</p>
        </CollapsibleCard>,
      );
      expect(screen.queryByText("기본 접힌 내용")).toBeNull();
    });
  });

  describe("헤더 클릭으로 토글", () => {
    it("접힌 상태에서 헤더 클릭 시 children이 나타난다", () => {
      render(
        <CollapsibleCard {...defaultProps} defaultOpen={false}>
          <p>토글 내용</p>
        </CollapsibleCard>,
      );
      expect(screen.queryByText("토글 내용")).toBeNull();
      fireEvent.click(screen.getByRole("button"));
      expect(screen.getByText("토글 내용")).toBeDefined();
    });

    it("펼쳐진 상태에서 헤더 클릭 시 children이 사라진다", () => {
      render(
        <CollapsibleCard {...defaultProps} defaultOpen={true}>
          <p>토글 내용</p>
        </CollapsibleCard>,
      );
      expect(screen.getByText("토글 내용")).toBeDefined();
      fireEvent.click(screen.getByRole("button"));
      expect(screen.queryByText("토글 내용")).toBeNull();
    });

    it("두 번 클릭하면 다시 펼쳐진다", () => {
      render(
        <CollapsibleCard {...defaultProps} defaultOpen={false}>
          <p>토글 내용</p>
        </CollapsibleCard>,
      );
      const button = screen.getByRole("button");
      fireEvent.click(button);
      fireEvent.click(button);
      expect(screen.queryByText("토글 내용")).toBeNull();
    });

    it("버튼의 aria-expanded 속성이 상태에 따라 올바르게 변한다", () => {
      render(
        <CollapsibleCard {...defaultProps} defaultOpen={false}>
          <p>내용</p>
        </CollapsibleCard>,
      );
      const button = screen.getByRole("button");
      expect(button.getAttribute("aria-expanded")).toBe("false");
      fireEvent.click(button);
      expect(button.getAttribute("aria-expanded")).toBe("true");
    });
  });

  describe("muted prop", () => {
    it("muted=true이면 루트 div에 opacity-50 클래스가 추가된다", () => {
      const { container } = render(
        <CollapsibleCard {...defaultProps} muted={true}>
          <p>내용</p>
        </CollapsibleCard>,
      );
      const card = container.firstChild as HTMLElement;
      expect(card.className).toContain("opacity-50");
    });

    it("muted=false이면 opacity-50 클래스가 없다", () => {
      const { container } = render(
        <CollapsibleCard {...defaultProps} muted={false}>
          <p>내용</p>
        </CollapsibleCard>,
      );
      const card = container.firstChild as HTMLElement;
      expect(card.className).not.toContain("opacity-50");
    });

    it("muted 미지정 시 opacity-50 클래스가 없다", () => {
      const { container } = render(
        <CollapsibleCard {...defaultProps}>
          <p>내용</p>
        </CollapsibleCard>,
      );
      const card = container.firstChild as HTMLElement;
      expect(card.className).not.toContain("opacity-50");
    });
  });

  describe("badge prop", () => {
    it("badge prop이 있으면 헤더 안에 렌더링된다", () => {
      render(
        <CollapsibleCard {...defaultProps} badge={<span>NEW</span>}>
          <p>내용</p>
        </CollapsibleCard>,
      );
      expect(screen.getByText("NEW")).toBeDefined();
    });
  });
});
