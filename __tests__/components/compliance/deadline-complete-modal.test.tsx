import { describe, it, expect, beforeAll, afterAll, afterEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { server } from "@/mocks/server";
import { DeadlineCompleteModal } from "@/components/compliance/deadline-complete-modal";
import { DEADLINE_COMPLETION_FIELDS } from "@/types/compliance";
import type { ComplianceDeadlineResponse } from "@/types/api";
import { DEADLINE_TYPES } from "@/types/api";

const toastSuccessSpy = vi.fn();
const toastErrorSpy = vi.fn();

vi.mock("sonner", () => ({
  toast: {
    success: (message: string) => toastSuccessSpy(message),
    error: (message: string) => toastErrorSpy(message),
  },
}));

beforeAll(() => server.listen());
afterEach(() => {
  server.resetHandlers();
  vi.clearAllMocks();
});
afterAll(() => server.close());

function renderModal(deadline: ComplianceDeadlineResponse, onClose = vi.fn()) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <DeadlineCompleteModal deadline={deadline} onClose={onClose} />
    </QueryClientProvider>,
  );
}

const baseDeadline: ComplianceDeadlineResponse = {
  id: 1,
  workerId: 10,
  workerName: "NGUYEN",
  deadlineType: "EXIT_GUARANTEE_INSURANCE",
  dueDate: "2026-06-15",
  status: "URGENT",
  description: "출국만기보험",
};

describe.each(DEADLINE_TYPES)("DeadlineCompleteModal - %s", (type) => {
  it(`${type}_매핑된_필드만_렌더링된다`, () => {
    renderModal({ ...baseDeadline, deadlineType: type });
    const expected = DEADLINE_COMPLETION_FIELDS[type];

    if (expected.includes("nextDueDate")) {
      expect(screen.getByLabelText(/(새 비자 만료일|새 계약 종료일|다음 기한)/)).toBeInTheDocument();
    } else {
      expect(
        screen.queryByLabelText(/(새 비자 만료일|새 계약 종료일|다음 기한)/),
      ).not.toBeInTheDocument();
    }
    if (expected.includes("renewedUntil")) {
      expect(screen.getByLabelText(/갱신 만료일/)).toBeInTheDocument();
    } else {
      expect(screen.queryByLabelText(/갱신 만료일/)).not.toBeInTheDocument();
    }
    if (expected.includes("evidenceUrl")) {
      expect(screen.getByLabelText(/증빙 URL/)).toBeInTheDocument();
    } else {
      expect(screen.queryByLabelText(/증빙 URL/)).not.toBeInTheDocument();
    }
  });
});

describe("DeadlineCompleteModal - submit", () => {
  it("출국만기보험_renewedUntil_입력_후_제출하면_payload가_전송되고_onClose_호출", async () => {
    let captured: Record<string, unknown> | null = null;
    server.use(
      http.patch("*/api/compliance/:id/complete", async ({ request }) => {
        captured = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json(
          {
            completedDeadlineId: 1,
            createdDeadlines: [
              {
                id: 99,
                type: "EXIT_GUARANTEE_INSURANCE",
                dueDate: "2027-06-15",
                description: "출국만기보험",
              },
            ],
          },
          { status: 202 },
        );
      }),
    );

    const user = userEvent.setup();
    const onClose = vi.fn();
    renderModal(baseDeadline, onClose);

    await user.clear(screen.getByLabelText(/완료일/));
    await user.type(screen.getByLabelText(/완료일/), "2026-05-06");
    await user.type(screen.getByLabelText(/증권번호/), "POL-123");
    await user.type(screen.getByLabelText(/갱신 만료일/), "2027-05-06");
    await user.click(screen.getByRole("button", { name: "완료" }));

    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(captured).toMatchObject({
      completedAt: "2026-05-06",
      referenceNumber: "POL-123",
      renewedUntil: "2027-05-06",
    });
  });

  it("갱신_만료일이_완료일보다_이전이면_제출하지_않는다", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderModal(baseDeadline, onClose);

    await user.clear(screen.getByLabelText(/완료일/));
    await user.type(screen.getByLabelText(/완료일/), "2026-05-06");
    await user.type(screen.getByLabelText(/갱신 만료일/), "2026-05-05");
    await user.click(screen.getByRole("button", { name: "완료" }));

    expect(await screen.findByText("갱신 만료일은 완료일 이후여야 합니다")).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });
});

describe("DeadlineCompleteModal — toast variants", () => {
  function setupCompleteResponse(summary: {
    completedDeadlineId: number;
    createdDeadlines: Array<{ id: number; type: string; dueDate: string; description: string }>;
  }) {
    server.use(
      http.patch("*/api/compliance/:id/complete", () =>
        HttpResponse.json(summary, { status: 202 }),
      ),
    );
  }

  it("createdDeadlines가_빈_배열이면_단순_완료_토스트만_노출한다", async () => {
    setupCompleteResponse({ completedDeadlineId: 1, createdDeadlines: [] });

    const user = userEvent.setup();
    const onClose = vi.fn();
    renderModal({ ...baseDeadline, deadlineType: "HEALTH_INSURANCE_ENROLLMENT" }, onClose);

    await user.clear(screen.getByLabelText(/완료일/));
    await user.type(screen.getByLabelText(/완료일/), "2026-05-07");
    await user.click(screen.getByRole("button", { name: "완료" }));

    await waitFor(() => expect(toastSuccessSpy).toHaveBeenCalled());
    expect(toastSuccessSpy).toHaveBeenCalledWith("완료 처리되었습니다");
  });

  it("createdDeadlines_1개면_다음_데드라인_안내를_포함한다", async () => {
    setupCompleteResponse({
      completedDeadlineId: 1,
      createdDeadlines: [
        {
          id: 99,
          type: "EXIT_GUARANTEE_INSURANCE",
          dueDate: "2027-06-15",
          description: "출국만기보험",
        },
      ],
    });

    const user = userEvent.setup();
    renderModal(baseDeadline);

    await user.clear(screen.getByLabelText(/완료일/));
    await user.type(screen.getByLabelText(/완료일/), "2026-05-07");
    await user.type(screen.getByLabelText(/갱신 만료일/), "2027-06-15");
    await user.click(screen.getByRole("button", { name: "완료" }));

    await waitFor(() => expect(toastSuccessSpy).toHaveBeenCalled());
    const message = toastSuccessSpy.mock.calls[0][0] as string;
    expect(message).toContain("다음 데드라인이");
    expect(message).toContain("자동 생성되었습니다");
    expect(message).not.toContain("외 ");
  });

  it("createdDeadlines_2개면_외_N건_표기를_포함한다", async () => {
    setupCompleteResponse({
      completedDeadlineId: 1,
      createdDeadlines: [
        {
          id: 99,
          type: "EXIT_GUARANTEE_INSURANCE",
          dueDate: "2027-06-15",
          description: "출국만기보험",
        },
        {
          id: 100,
          type: "WAGE_GUARANTEE_INSURANCE",
          dueDate: "2027-07-01",
          description: "임금체불보증보험",
        },
      ],
    });

    const user = userEvent.setup();
    renderModal(baseDeadline);

    await user.clear(screen.getByLabelText(/완료일/));
    await user.type(screen.getByLabelText(/완료일/), "2026-05-07");
    await user.type(screen.getByLabelText(/갱신 만료일/), "2027-06-15");
    await user.click(screen.getByRole("button", { name: "완료" }));

    await waitFor(() => expect(toastSuccessSpy).toHaveBeenCalled());
    const message = toastSuccessSpy.mock.calls[0][0] as string;
    expect(message).toContain("(외 1건)");
  });
});
