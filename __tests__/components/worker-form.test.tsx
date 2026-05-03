import { describe, it, expect, vi, beforeAll, afterEach, afterAll } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { WorkerForm } from "@/components/workers/worker-form";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CompanyProvider } from "@/lib/contexts/company-context";
import { server } from "@/mocks/server";
import { mockWorkers } from "@/mocks/data";

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

function trackKoreanNameSuggestionRequests() {
  let requestCount = 0;
  const handleSuggestionRequest: Parameters<typeof http.post>[1] = () => {
    requestCount += 1;
    return HttpResponse.json({ koreanName: "응우옌 반 안" }, { status: 202 });
  };
  server.use(
    http.post(`${BACKEND}/api/workers/korean-name/suggest`, handleSuggestionRequest),
    http.post("*/api/workers/korean-name/suggest", handleSuggestionRequest),
  );
  return () => requestCount;
}

async function selectOption(
  user: ReturnType<typeof userEvent.setup>,
  label: string,
  option: string,
) {
  await user.click(screen.getByLabelText(label));
  await user.click(await screen.findByRole("option", { name: option }));
}

async function fillRequiredCreateFields(
  user: ReturnType<typeof userEvent.setup>,
  koreanName?: string,
) {
  await user.type(screen.getByLabelText("이름"), "NGUYEN VAN AN");
  if (koreanName != null) {
    await user.type(screen.getByLabelText("한글 이름 (선택)"), koreanName);
  }
  await user.type(screen.getByLabelText("생년월일"), "1995-03-15");
  await selectOption(user, "국적", "베트남");
  await selectOption(user, "비자 유형", "E-9 비전문취업");
  await user.type(screen.getByLabelText("비자 만료일"), "2027-12-31");
  await user.type(screen.getByLabelText("입국일"), "2024-06-15");
  await user.type(screen.getByLabelText("계약 시작일"), "2025-03-01");
  await user.click(await screen.findByLabelText("사업장"));
  await user.click(await screen.findByRole("option", { name: "한국전자 주식회사 (123-45-67890)" }));
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

    const koreanNameInput = screen.getByLabelText("한글 이름 (선택)");
    const suggestButton = screen.getByRole("button", { name: /AI로 생성/ });
    const helperText = screen.getByText(
      "이름의 한글 발음 표기를 입력하세요. AI 추천 결과는 실제 발음과 다를 수 있으니 확인 후 저장하세요.",
    );
    const inputDescriptions = koreanNameInput.getAttribute("aria-describedby")?.split(/\s+/);
    const buttonDescriptions = suggestButton.getAttribute("aria-describedby")?.split(/\s+/);

    expect(screen.getByLabelText("이름")).toBeDefined();
    expect(koreanNameInput).toBeDefined();
    expect(suggestButton).toBeDefined();
    expect(helperText).toHaveAttribute("id", "koreanNameHelp");
    expect(inputDescriptions).toEqual(
      expect.arrayContaining(["koreanNameHelp", "koreanNameMessage"]),
    );
    expect(buttonDescriptions).toEqual(
      expect.arrayContaining(["koreanNameHelp", "koreanNameMessage"]),
    );
  });

  it("이름이_없으면_AI_추천_API를_호출하지_않는다", async () => {
    const user = userEvent.setup();
    const getSuggestionRequestCount = trackKoreanNameSuggestionRequests();
    renderWithProviders(<WorkerForm mode="create" />);

    await user.click(screen.getByRole("button", { name: /AI로 생성/ }));

    const message = await screen.findByRole("status");
    expect(message).toHaveTextContent("이름을 입력한 뒤 AI로 생성해 주세요.");
    expect(message).toHaveAttribute("id", "koreanNameMessage");
    expect(message).toHaveAttribute("aria-live", "polite");
    expect(getSuggestionRequestCount()).toBe(0);
  });

  it("국적이_없으면_AI_추천_API를_호출하지_않는다", async () => {
    const user = userEvent.setup();
    const getSuggestionRequestCount = trackKoreanNameSuggestionRequests();
    renderWithProviders(<WorkerForm mode="create" />);

    await user.type(screen.getByLabelText("이름"), "NGUYEN VAN AN");
    await user.click(screen.getByRole("button", { name: /AI로 생성/ }));

    expect(await screen.findByText("국적을 선택한 뒤 AI로 생성해 주세요.")).toBeDefined();
    expect(getSuggestionRequestCount()).toBe(0);
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

  it("입력값이_변경되면_늦게_도착한_AI_추천_결과를_적용하지_않는다", async () => {
    const user = userEvent.setup();
    let requestCount = 0;
    let releaseSuggestion: (() => void) | undefined;
    const suggestionRelease = new Promise<void>((resolve) => {
      releaseSuggestion = resolve;
    });
    const handleSuggestionRequest: Parameters<typeof http.post>[1] = async () => {
      requestCount += 1;
      await suggestionRelease;
      return HttpResponse.json({ koreanName: "응우옌 반 안" }, { status: 202 });
    };
    server.use(
      http.post(`${BACKEND}/api/workers/korean-name/suggest`, handleSuggestionRequest),
      http.post("*/api/workers/korean-name/suggest", handleSuggestionRequest),
    );
    renderWithProviders(<WorkerForm mode="create" />);

    await user.type(screen.getByLabelText("이름"), "NGUYEN VAN AN");
    await selectOption(user, "국적", "베트남");
    await user.click(screen.getByRole("button", { name: /AI로 생성/ }));

    await waitFor(() => expect(requestCount).toBe(1));
    const koreanNameInput = screen.getByLabelText("한글 이름 (선택)");
    await user.type(koreanNameInput, "직접 입력");
    releaseSuggestion?.();

    expect(
      await screen.findByText(
        "입력값이 변경되어 추천 결과를 적용하지 않았습니다. 다시 생성해 주세요.",
      ),
    ).toBeDefined();
    expect(koreanNameInput).toHaveValue("직접 입력");
  });

  it("등록_제출에_공백이_제거된_한글_이름을_포함한다", async () => {
    const user = userEvent.setup();
    let received: Record<string, unknown> | undefined;
    server.use(
      http.post("*/api/workers", async ({ request }) => {
        received = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({ id: 99, name: received.name, koreanName: received.koreanName });
      }),
    );
    renderWithProviders(<WorkerForm mode="create" />);

    await fillRequiredCreateFields(user, "  응우옌 반 안  ");
    await user.click(screen.getByRole("button", { name: "등록" }));

    await waitFor(() => expect(received).toBeDefined());
    expect(received?.koreanName).toBe("응우옌 반 안");
  });

  it("등록_제출에서_공백만_있는_한글_이름은_보내지_않는다", async () => {
    const user = userEvent.setup();
    let received: Record<string, unknown> | undefined;
    server.use(
      http.post("*/api/workers", async ({ request }) => {
        received = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({ id: 99, name: received.name, koreanName: received.koreanName });
      }),
    );
    renderWithProviders(<WorkerForm mode="create" />);

    await fillRequiredCreateFields(user, "   ");
    await user.click(screen.getByRole("button", { name: "등록" }));

    await waitFor(() => expect(received).toBeDefined());
    expect(received).not.toHaveProperty("koreanName", "   ");
    expect(received?.koreanName).toBeUndefined();
  });

  it("수정_제출에서_기존_한글_이름을_비우면_빈_문자열을_보낸다", async () => {
    const user = userEvent.setup();
    const worker = { ...mockWorkers[0], id: 99, koreanName: "응우옌 반 안" };
    let received: Record<string, unknown> | undefined;
    let receivedWorkerId: string | readonly string[] | undefined;
    server.use(
      http.put("*/api/workers/:id", async ({ request, params }) => {
        receivedWorkerId = params.id;
        received = (await request.json()) as Record<string, unknown>;
        return new HttpResponse(null, { status: 204 });
      }),
    );
    renderWithProviders(<WorkerForm mode="edit" worker={worker} workerId={worker.id} />);

    const koreanNameInput = screen.getByLabelText("한글 이름 (선택)");
    expect(koreanNameInput).toHaveValue("응우옌 반 안");
    await user.clear(koreanNameInput);
    await user.click(screen.getByRole("button", { name: "수정" }));

    await waitFor(() => expect(received).toBeDefined());
    expect(receivedWorkerId).toBe(String(worker.id));
    expect(received).toHaveProperty("koreanName", "");
  });
});
