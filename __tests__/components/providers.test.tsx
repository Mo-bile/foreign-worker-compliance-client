import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useMutation, useQuery } from "@tanstack/react-query";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { Providers } from "@/components/providers";

function MutationTestComponent({ error }: { error: Error }) {
  const mutation = useMutation({
    mutationFn: () => Promise.reject(error),
  });
  return <button onClick={() => mutation.mutate()}>trigger</button>;
}

function QueryTestComponent({ error }: { error: Error }) {
  const query = useQuery({
    queryKey: ["test-error"],
    queryFn: () => Promise.reject(error),
    retry: false,
  });
  return <div>{query.isError ? "error-state" : "loading"}</div>;
}

describe("Providers 글로벌 에러 핸들링", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("mutation 에러 시 BE 메시지를 다이얼로그로 표시한다", async () => {
    const beError = new Error("농축산업 업종은 아직 시뮬레이션을 지원하지 않습니다");
    render(
      <Providers>
        <MutationTestComponent error={beError} />
      </Providers>,
    );

    await userEvent.click(screen.getByText("trigger"));

    await waitFor(() => {
      expect(screen.getByRole("alertdialog")).toBeInTheDocument();
      expect(
        screen.getByText("농축산업 업종은 아직 시뮬레이션을 지원하지 않습니다"),
      ).toBeInTheDocument();
    });
  });

  it("mutation 에러의 message가 없으면 폴백 메시지를 다이얼로그로 표시한다", async () => {
    const emptyError = new Error();
    render(
      <Providers>
        <MutationTestComponent error={emptyError} />
      </Providers>,
    );

    await userEvent.click(screen.getByText("trigger"));

    await waitFor(() => {
      expect(screen.getByRole("alertdialog")).toBeInTheDocument();
      expect(
        screen.getByText("서버와의 통신 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요."),
      ).toBeInTheDocument();
    });
  });

  it("query 에러 시에도 BE 메시지를 다이얼로그로 표시한다", async () => {
    const queryError = new Error("사업장을 찾을 수 없습니다: id=999");
    render(
      <Providers>
        <QueryTestComponent error={queryError} />
      </Providers>,
    );

    await waitFor(() => {
      expect(screen.getByText("error-state")).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByRole("alertdialog")).toBeInTheDocument();
      expect(screen.getByText("사업장을 찾을 수 없습니다: id=999")).toBeInTheDocument();
    });
  });

  it("확인_버튼_클릭_시_다이얼로그가_닫힌다", async () => {
    const beError = new Error("중복 에러 테스트");
    render(
      <Providers>
        <MutationTestComponent error={beError} />
      </Providers>,
    );

    await userEvent.click(screen.getByText("trigger"));

    await waitFor(() => {
      expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole("button", { name: "확인" }));

    await waitFor(() => {
      expect(screen.queryByRole("alertdialog")).toBeNull();
    });
  });
});
