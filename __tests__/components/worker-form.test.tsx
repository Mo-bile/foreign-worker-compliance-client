import { describe, it, expect, vi, beforeAll, afterEach, afterAll } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { WorkerForm } from "@/components/workers/worker-form";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CompanyProvider } from "@/lib/contexts/company-context";
import { server } from "@/mocks/server";

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Mock next/navigation so useRouter doesn't require App Router context
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    back: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/workers/new",
}));

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <CompanyProvider>{ui}</CompanyProvider>
    </QueryClientProvider>,
  );
}

describe("WorkerForm", () => {
  it("필수_필드가_비어있으면_에러를_표시한다", async () => {
    const user = userEvent.setup();
    renderWithProviders(<WorkerForm />);

    const submitButton = screen.getByRole("button", { name: "등록" });
    await user.click(submitButton);

    // Check that at least one validation error appears
    // Use findByText with the exact message from registerWorkerRequestSchema
    expect(await screen.findByText("이름을 입력해주세요")).toBeDefined();
  });

  it("모든_필수_필드를_렌더링한다", async () => {
    renderWithProviders(<WorkerForm />);

    expect(screen.getByLabelText("이름")).toBeDefined();
    expect(screen.getByLabelText("생년월일")).toBeDefined();
    expect(screen.getByLabelText("국적")).toBeDefined();
    expect(screen.getByLabelText("비자 유형")).toBeDefined();
    expect(screen.getByLabelText("비자 만료일")).toBeDefined();
    expect(screen.getByLabelText("입국일")).toBeDefined();
    expect(screen.getByLabelText("계약 시작일")).toBeDefined();
    // 사업장 Select loads asynchronously after companies are fetched
    expect(await screen.findByLabelText("사업장")).toBeDefined();
  });
});
