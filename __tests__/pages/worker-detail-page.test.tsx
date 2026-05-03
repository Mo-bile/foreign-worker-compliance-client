import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import { act, render, screen, waitFor, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Suspense, type ReactNode } from "react";
import { server } from "@/mocks/server";
import WorkerDetailPage from "@/app/(app)/workers/[id]/page";

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

async function renderWorkerDetailPage(workerId: string) {
  const Wrapper = createWrapper();
  const params = Promise.resolve({ id: workerId });

  await act(async () => {
    render(
      <Wrapper>
        <Suspense fallback={<div>params loading</div>}>
          <WorkerDetailPage params={params} />
        </Suspense>
      </Wrapper>,
    );
  });
}

describe("WorkerDetailPage", () => {
  it("한글_이름이_있으면_제목에_병기하고_기본_정보에_중복_표시하지_않는다", async () => {
    await renderWorkerDetailPage("1");

    const heading = await screen.findByRole("heading", { name: /Nguyen Van A/ });

    expect(heading).toHaveTextContent("Nguyen Van A");
    expect(within(heading).getByText("응우옌 반 아")).toBeDefined();
    expect(screen.queryByText("한글 이름")).toBeNull();
  });

  it("한글_이름이_없으면_기본_정보에_대체_텍스트를_표시하지_않는다", async () => {
    await renderWorkerDetailPage("2");

    await screen.findByRole("heading", { name: "Zhang Wei" });

    await waitFor(() => expect(screen.queryByText("한글 이름")).toBeNull());
    expect(screen.getAllByText("Zhang Wei")).toHaveLength(1);
  });
});
