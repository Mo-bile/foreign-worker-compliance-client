import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EndEmploymentModal } from "@/components/workers/end-employment-modal";

// Mock useEndEmployment 훅
const mutateMock = vi.fn();
const onSuccessHandlers: Array<(response: unknown) => void> = [];

vi.mock("@/lib/queries/use-workers", () => ({
  useEndEmployment: () => ({
    mutate: (data: unknown, opts: { onSuccess?: (r: unknown) => void; onError?: (e: Error) => void }) => {
      mutateMock(data);
      if (opts?.onSuccess) onSuccessHandlers.push(opts.onSuccess);
    },
    isPending: false,
  }),
}));

// Mock sonner
const toastSuccess = vi.fn();
const toastError = vi.fn();
vi.mock("sonner", () => ({
  toast: { success: (msg: string) => toastSuccess(msg), error: (msg: string) => toastError(msg) },
}));

beforeEach(() => {
  mutateMock.mockClear();
  toastSuccess.mockClear();
  toastError.mockClear();
  onSuccessHandlers.length = 0;
});

const defaultProps = {
  open: true,
  onClose: vi.fn(),
  workerId: 1,
  workerName: "Nguyen Van A",
};

describe("EndEmploymentModal", () => {
  it("open_true_시_모달_마운트되고_제목에_워커이름_노출된다", () => {
    render(<EndEmploymentModal {...defaultProps} />);
    expect(screen.getByText("고용종료 처리 — Nguyen Van A")).toBeDefined();
  });

  it("사유_미선택_제출_시_에러_메시지_노출된다", async () => {
    render(<EndEmploymentModal {...defaultProps} />);
    await userEvent.click(screen.getByRole("button", { name: "고용종료 처리" }));
    await waitFor(() => {
      expect(screen.getByText("종료 사유를 선택해주세요")).toBeDefined();
    });
  });

  it("WORKPLACE_CHANGE_선택_시_사업주_귀책_radio_3종_노출", async () => {
    render(<EndEmploymentModal {...defaultProps} />);
    await userEvent.click(screen.getByLabelText("종료 사유"));
    await userEvent.click(await screen.findByRole("option", { name: "사업장 변경" }));
    expect(screen.getByText("사업주 귀책 여부")).toBeDefined();
    expect(screen.getByLabelText("예")).toBeDefined();
    expect(screen.getByLabelText("아니오")).toBeDefined();
    expect(screen.getByLabelText("확인 필요")).toBeDefined();
  });

  it("CONTRACT_EXPIRY_선택_시_사업주_귀책_radio_비노출", async () => {
    render(<EndEmploymentModal {...defaultProps} />);
    await userEvent.click(screen.getByLabelText("종료 사유"));
    await userEvent.click(await screen.findByRole("option", { name: "계약만료" }));
    expect(screen.queryByText("사업주 귀책 여부")).toBeNull();
  });

  it("WORKPLACE_CHANGE_employerFault_미선택_제출_시_refine_에러", async () => {
    render(<EndEmploymentModal {...defaultProps} />);
    await userEvent.click(screen.getByLabelText("종료 사유"));
    await userEvent.click(await screen.findByRole("option", { name: "사업장 변경" }));
    await userEvent.click(screen.getByRole("button", { name: "고용종료 처리" }));
    await waitFor(() => {
      expect(
        screen.getByText("사업장 변경 사유 선택 시 사업주 귀책 여부를 선택해주세요"),
      ).toBeDefined();
    });
  });

  it("CONTRACT_EXPIRY_정상_제출_시_payload_employerFault_null로_정규화", async () => {
    render(<EndEmploymentModal {...defaultProps} />);
    await userEvent.click(screen.getByLabelText("종료 사유"));
    await userEvent.click(await screen.findByRole("option", { name: "계약만료" }));
    await userEvent.click(screen.getByRole("button", { name: "고용종료 처리" }));
    await waitFor(() => expect(mutateMock).toHaveBeenCalledOnce());
    const payload = mutateMock.mock.calls[0][0];
    expect(payload.reason).toBe("CONTRACT_EXPIRY");
    expect(payload.employerFault).toBeNull();
  });

  it("성공_콜백_트리거_시_토스트에_4대보험_안내_포함", async () => {
    render(<EndEmploymentModal {...defaultProps} />);
    await userEvent.click(screen.getByLabelText("종료 사유"));
    await userEvent.click(await screen.findByRole("option", { name: "계약만료" }));
    await userEvent.click(screen.getByRole("button", { name: "고용종료 처리" }));
    await waitFor(() => expect(onSuccessHandlers).toHaveLength(1));
    onSuccessHandlers[0]({
      workerId: 1,
      endedAt: "2026-05-01",
      status: "ENDED",
      createdDeadlines: [{ id: 1, type: "CHANGE_REPORT", dueDate: "2026-05-16", description: "고용센터 신고" }],
      autoCompletedDeadlines: [],
      preservedDeadlineCount: 0,
    });
    expect(toastSuccess).toHaveBeenCalledOnce();
    expect(toastSuccess.mock.calls[0][0]).toContain("4대보험 자격상실");
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it("memo_공백만_입력_시_payload_memo_null로_정규화", async () => {
    render(<EndEmploymentModal {...defaultProps} />);
    await userEvent.click(screen.getByLabelText("종료 사유"));
    await userEvent.click(await screen.findByRole("option", { name: "계약만료" }));
    await userEvent.type(screen.getByLabelText(/메모/), "   ");
    await userEvent.click(screen.getByRole("button", { name: "고용종료 처리" }));
    await waitFor(() => expect(mutateMock).toHaveBeenCalledOnce());
    expect(mutateMock.mock.calls[0][0].memo).toBeNull();
  });

  it("취소_클릭_시_onClose_호출_mutate_미호출", async () => {
    const onCloseMock = vi.fn();
    render(<EndEmploymentModal {...defaultProps} onClose={onCloseMock} />);
    await userEvent.click(screen.getByRole("button", { name: "취소" }));
    expect(onCloseMock).toHaveBeenCalled();
    expect(mutateMock).not.toHaveBeenCalled();
  });
});
