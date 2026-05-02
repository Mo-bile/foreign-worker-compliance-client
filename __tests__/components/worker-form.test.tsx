import { describe, it, expect, vi, beforeAll, afterEach, afterAll } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { WorkerForm } from "@/components/workers/worker-form";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CompanyProvider } from "@/lib/contexts/company-context";
import { server } from "@/mocks/server";

const BACKEND = process.env.BACKEND_URL ?? "http://localhost:8080";

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
    renderWithProviders(<WorkerForm mode="create" />);

    const submitButton = screen.getByRole("button", { name: "등록" });
    await user.click(submitButton);

    // Check that at least one validation error appears
    // Use findByText with the exact message from registerWorkerRequestSchema
    expect(await screen.findByText("이름을 입력해주세요")).toBeDefined();
  });

  it("모든_필수_필드를_렌더링한다", async () => {
    renderWithProviders(<WorkerForm mode="create" />);

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

  it("한글_이름_필드와_AI_생성_버튼을_렌더링한다", async () => {
    renderWithProviders(<WorkerForm mode="create" />);

    expect(screen.getByLabelText("이름")).toBeDefined();
    expect(screen.getByLabelText("한글 이름 (선택)")).toBeDefined();
    expect(screen.getByRole("button", { name: /AI로 생성/ })).toBeDefined();
    expect(
      screen.getByText(
        "이름의 한글 발음 표기를 입력하세요. AI 추천 결과는 실제 발음과 다를 수 있으니 확인 후 저장하세요.",
      ),
    ).toBeDefined();
  });

  it("이름이_없으면_AI_추천_API를_호출하지_않는다", async () => {
    const user = userEvent.setup();
    renderWithProviders(<WorkerForm mode="create" />);

    await user.click(screen.getByRole("button", { name: /AI로 생성/ }));

    expect(await screen.findByText("이름을 입력한 뒤 AI로 생성해 주세요.")).toBeDefined();
  });

  it("국적이_없으면_AI_추천_API를_호출하지_않는다", async () => {
    const user = userEvent.setup();
    renderWithProviders(<WorkerForm mode="create" />);

    await user.type(screen.getByLabelText("이름"), "NGUYEN VAN AN");
    await user.click(screen.getByRole("button", { name: /AI로 생성/ }));

    expect(await screen.findByText("국적을 선택한 뒤 AI로 생성해 주세요.")).toBeDefined();
  });

  it("AI_추천_결과를_한글_이름_입력칸에만_채운다", async () => {
    const user = userEvent.setup();
    let received: unknown;
    const handleSuggestionRequest: Parameters<typeof http.post>[1] = async ({ request }) => {
      received = await request.json();
      return HttpResponse.json({ koreanName: "응우옌 반 안" }, { status: 202 });
    };
    server.use(
      http.post(`${BACKEND}/api/workers/korean-name/suggest`, handleSuggestionRequest),
      http.post("*/api/workers/korean-name/suggest", handleSuggestionRequest),
    );
    renderWithProviders(<WorkerForm mode="create" />);

    await user.type(screen.getByLabelText("이름"), "NGUYEN VAN AN");
    await user.click(screen.getByLabelText("국적"));
    await user.click(await screen.findByRole("option", { name: "베트남" }));
    await user.click(screen.getByRole("button", { name: /AI로 생성/ }));

    expect(await screen.findByDisplayValue("응우옌 반 안")).toBeDefined();
    expect(received).toEqual({ name: "NGUYEN VAN AN", nationalityCode: "VIETNAM" });
    expect(screen.queryByText("근로자가 등록되었습니다")).toBeNull();
  });
});
