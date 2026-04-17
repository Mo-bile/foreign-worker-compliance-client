import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useMutation, useQuery } from "@tanstack/react-query";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { toast } from "sonner";

import { Providers } from "@/components/providers";

vi.mock("sonner", async () => {
  const actual = await vi.importActual<typeof import("sonner")>("sonner");
  return {
    ...actual,
    toast: {
      ...actual.toast,
      error: vi.fn(),
    },
  };
});

function MutationTestComponent({ error }: { error: Error }) {
  const mutation = useMutation({
    mutationFn: () => Promise.reject(error),
  });
  return (
    <button onClick={() => mutation.mutate()}>trigger</button>
  );
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

  it("mutation 에러 시 BE 메시지를 토스트로 표시한다", async () => {
    const beError = new Error("농축산업 업종은 아직 시뮬레이션을 지원하지 않습니다");
    render(
      <Providers>
        <MutationTestComponent error={beError} />
      </Providers>,
    );

    await userEvent.click(screen.getByText("trigger"));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "농축산업 업종은 아직 시뮬레이션을 지원하지 않습니다",
      );
    });
  });

  it("mutation 에러의 message가 없으면 폴백 메시지를 표시한다", async () => {
    const emptyError = new Error();
    render(
      <Providers>
        <MutationTestComponent error={emptyError} />
      </Providers>,
    );

    await userEvent.click(screen.getByText("trigger"));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("오류가 발생했습니다");
    });
  });

  it("query 에러 시에도 BE 메시지를 토스트로 표시한다", async () => {
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
      expect(toast.error).toHaveBeenCalledWith("사업장을 찾을 수 없습니다: id=999");
    });
  });

  it("토스트는 에러당 1번만 표시된다", async () => {
    const beError = new Error("중복 에러 테스트");
    render(
      <Providers>
        <MutationTestComponent error={beError} />
      </Providers>,
    );

    await userEvent.click(screen.getByText("trigger"));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledTimes(1);
    });
  });
});
