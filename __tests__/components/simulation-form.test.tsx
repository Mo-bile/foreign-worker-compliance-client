import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SimulationForm } from "@/components/simulator/simulation-form";
import type { CompanyResponse } from "@/types/api";
import type { MetadataResponse } from "@/types/metadata";

// ─── Mock useMetadata ────────────────────────────────────────────
const mockUseMetadata = vi.fn<() => { data: MetadataResponse | undefined; isError: boolean }>();

vi.mock("@/lib/queries/use-metadata", () => ({
  useMetadata: () => mockUseMetadata(),
}));

// ─── Fixtures ────────────────────────────────────────────────────

const mockCompany: CompanyResponse = {
  id: 1,
  name: "테스트 회사",
  businessNumber: "123-45-67890",
  region: "SEOUL",
  subRegion: null,
  industryCategory: "MANUFACTURING",
  industrySubCategory: null,
  employeeCount: 50,
  foreignWorkerCount: 5,
  domesticInsuredCount: 30,
  address: "서울시 종로구",
  contactPhone: "02-1234-5678",
  averageForeignWorkerWage: null,
  recentYearTerminationCount: null,
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-03-01T00:00:00Z",
};

const mockMetadata: MetadataResponse = {
  nationalities: [
    { code: "VIETNAM", koreanName: "베트남", socialSecurityAgreement: false },
    { code: "PHILIPPINES", koreanName: "필리핀", socialSecurityAgreement: false },
  ],
  regions: [{ code: "SEOUL", koreanName: "서울특별시" }],
  industryCategories: [{ code: "MANUFACTURING", koreanName: "제조업" }],
  visaTypes: [{ code: "E9", description: "비전문취업" }],
  scoringPolicies: [
    {
      code: "BONUS_1",
      displayName: "신규 사업장",
      points: 5,
      type: "BONUS",
      applicableIndustry: null,
      mutualExclusionGroup: null,
    },
    {
      code: "BONUS_2",
      displayName: "성실납부",
      points: 3,
      type: "BONUS",
      applicableIndustry: null,
      mutualExclusionGroup: null,
    },
    {
      code: "DEDUCT_1",
      displayName: "임금체불",
      points: 10,
      type: "DEDUCTION",
      applicableIndustry: null,
      mutualExclusionGroup: null,
    },
    {
      code: "DEDUCT_2",
      displayName: "산재사고",
      points: 7,
      type: "DEDUCTION",
      applicableIndustry: null,
      mutualExclusionGroup: null,
    },
    {
      code: "LV_SERIOUS",
      displayName: "노동관계법 중대위반",
      points: 10,
      type: "DEDUCTION",
      applicableIndustry: null,
      mutualExclusionGroup: "LABOR_VIOLATION",
    },
    {
      code: "LV_GENERAL",
      displayName: "노동관계법 일반위반",
      points: 6,
      type: "DEDUCTION",
      applicableIndustry: null,
      mutualExclusionGroup: "LABOR_VIOLATION",
    },
  ],
  scoringPolicyGroups: [
    { code: "LABOR_VIOLATION", displayName: "노동관계법 위반 감점" },
  ],
};

// ─── Helpers ─────────────────────────────────────────────────────

function renderForm(
  overrides: {
    company?: CompanyResponse | null;
    onSubmit?: (data: unknown) => void;
    isPending?: boolean;
  } = {},
) {
  const company = overrides.company !== undefined ? overrides.company : mockCompany;
  const onSubmit = overrides.onSubmit ?? vi.fn();
  const isPending = overrides.isPending ?? false;
  return render(<SimulationForm company={company} onSubmit={onSubmit} isPending={isPending} />);
}

// ─── Tests ───────────────────────────────────────────────────────

describe("SimulationForm", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    mockUseMetadata.mockReturnValue({ data: mockMetadata, isError: false });
  });

  // ── Section rendering ──────────────────────────────────────────

  describe("섹션 렌더링", () => {
    it("시뮬레이션 조건 제목을 렌더링한다", () => {
      renderForm();
      expect(screen.getByText("시뮬레이션 조건")).toBeDefined();
    });

    it("자동 입력 안내 박스를 렌더링한다 (company 있을 때)", () => {
      renderForm();
      expect(screen.getByText("사업장 정보에서 자동 입력됨")).toBeDefined();
    });

    it("고용 한도 계산용 섹션을 렌더링한다", () => {
      renderForm();
      expect(screen.getByText("고용 한도 계산용")).toBeDefined();
    });

    it("기본 입력 필드들을 렌더링한다", () => {
      renderForm();
      expect(screen.getByLabelText(/희망 채용 인원/)).toBeDefined();
      expect(screen.getByLabelText(/희망 국적/)).toBeDefined();
      expect(screen.getByLabelText(/희망 시기/)).toBeDefined();
    });

    it("배정 점수 시뮬레이션 섹션을 렌더링한다", () => {
      renderForm();
      expect(screen.getByText(/배정 점수 시뮬레이션/)).toBeDefined();
    });
  });

  // ── Auto-fill box ──────────────────────────────────────────────

  describe("자동 입력 박스", () => {
    it("company가 제공되면 회사 정보를 표시한다", () => {
      renderForm();
      expect(screen.getByText(/서울/)).toBeDefined();
      expect(screen.getByText(/제조업/)).toBeDefined();
      expect(screen.getByText(/상시근로자/)).toBeDefined();
      expect(screen.getByText(/50명/)).toBeDefined();
    });

    it("company가 null이면 자동 입력 박스를 표시하지 않는다", () => {
      renderForm({ company: null });
      expect(screen.queryByText("사업장 정보에서 자동 입력됨")).toBeNull();
    });
  });

  // ── domesticInsuredCount default ───────────────────────────────

  describe("내국인 피보험자 수 기본값", () => {
    it("company.domesticInsuredCount로 초기값을 설정한다", () => {
      renderForm();
      const input = screen.getByLabelText(/내국인 피보험자 수/) as HTMLInputElement;
      expect(input.value).toBe("30");
    });

    it("company가 null이면 0으로 초기화한다", () => {
      renderForm({ company: null });
      const input = screen.getByLabelText(/내국인 피보험자 수/) as HTMLInputElement;
      expect(input.value).toBe("0");
    });
  });

  // ── Scoring checkboxes from metadata ───────────────────────────

  describe("점수 체크박스", () => {
    it("metadata.scoringPolicies로부터 체크박스를 렌더링한다", () => {
      renderForm();
      expect(screen.getByText(/신규 사업장/)).toBeDefined();
      expect(screen.getByText(/성실납부/)).toBeDefined();
      expect(screen.getByText(/임금체불/)).toBeDefined();
      expect(screen.getByText(/산재사고/)).toBeDefined();
    });

    it("가산 항목은 +점수로 표시한다", () => {
      renderForm();
      expect(screen.getByText(/\+5점/)).toBeDefined();
      expect(screen.getByText(/\+3점/)).toBeDefined();
    });

    it("감점 항목은 -점수로 표시한다", () => {
      renderForm();
      expect(screen.getAllByText(/-10점/).length).toBeGreaterThan(0);
      expect(screen.getByText(/-7점/)).toBeDefined();
    });

    it("metadata가 없으면 체크박스가 렌더링되지 않는다", () => {
      mockUseMetadata.mockReturnValue({ data: undefined, isError: false });
      renderForm();
      expect(screen.queryByText(/신규 사업장/)).toBeNull();
    });
  });

  // ── Deduction items red text ───────────────────────────────────

  describe("감점 항목 스타일", () => {
    it("감점 항목 텍스트가 text-signal-red 클래스를 가진다", () => {
      renderForm();
      const deductionLabel = screen.getByText(/임금체불/);
      expect(deductionLabel.className).toContain("text-signal-red");
    });

    it("가산 항목 텍스트는 text-signal-red 클래스를 갖지 않는다", () => {
      renderForm();
      const bonusLabel = screen.getByText(/신규 사업장/);
      expect(bonusLabel.className).not.toContain("text-signal-red");
    });
  });

  // ── Deduction item selection ───────────────────────────────────

  describe("감점 항목 선택", () => {
    it("감점 체크박스를 선택하면 appliedScoringCodes에 반영된다", async () => {
      const onSubmit = vi.fn();
      const user = userEvent.setup();
      renderForm({ onSubmit });

      // Check a deduction checkbox (임금체불: score=10)
      const checkboxes = screen.getAllByRole("checkbox");
      // Order: BONUS_1, BONUS_2, DEDUCT_1, DEDUCT_2
      await user.click(checkboxes[2]); // DEDUCT_1 (임금체불, score=10)

      // Fill required fields to enable submit
      const timingSelect = screen.getByLabelText(/희망 시기/) as HTMLSelectElement;
      await user.selectOptions(timingSelect, "2026_Q2");

      // Submit
      const submitButton = screen.getByRole("button", { name: /시뮬레이션 실행/ });
      await user.click(submitButton);

      expect(onSubmit).toHaveBeenCalledTimes(1);
      const request = onSubmit.mock.calls[0][0];
      expect(request.appliedScoringCodes).toContain("DEDUCT_1");
    });

    it("여러 감점 체크박스를 선택하면 모두 반영된다", async () => {
      const onSubmit = vi.fn();
      const user = userEvent.setup();
      renderForm({ onSubmit });

      const checkboxes = screen.getAllByRole("checkbox");
      await user.click(checkboxes[2]); // DEDUCT_1 (10)
      await user.click(checkboxes[3]); // DEDUCT_2 (7)

      const timingSelect = screen.getByLabelText(/희망 시기/) as HTMLSelectElement;
      await user.selectOptions(timingSelect, "2026_Q2");

      const submitButton = screen.getByRole("button", { name: /시뮬레이션 실행/ });
      await user.click(submitButton);

      expect(onSubmit).toHaveBeenCalledTimes(1);
      const request = onSubmit.mock.calls[0][0];
      expect(request.appliedScoringCodes).toContain("DEDUCT_1");
      expect(request.appliedScoringCodes).toContain("DEDUCT_2");
    });

    it("가산 항목도 appliedScoringCodes에 반영된다", async () => {
      const onSubmit = vi.fn();
      const user = userEvent.setup();
      renderForm({ onSubmit });

      const checkboxes = screen.getAllByRole("checkbox");
      await user.click(checkboxes[0]); // BONUS_1 (not deduction)

      const timingSelect = screen.getByLabelText(/희망 시기/) as HTMLSelectElement;
      await user.selectOptions(timingSelect, "2026_Q2");

      const submitButton = screen.getByRole("button", { name: /시뮬레이션 실행/ });
      await user.click(submitButton);

      expect(onSubmit).toHaveBeenCalledTimes(1);
      const request = onSubmit.mock.calls[0][0];
      expect(request.appliedScoringCodes).toContain("BONUS_1");
    });
  });

  describe("그룹 감점 렌더링", () => {
    it("그룹 라벨이 metadata의 displayName으로 렌더링된다", () => {
      renderForm();
      expect(screen.getByText(/노동관계법 위반 감점/)).toBeDefined();
    });

    it("그룹 감점 항목이 라디오 버튼으로 렌더링된다", () => {
      renderForm();
      const radioButtons = screen.getAllByRole("radio");

      expect(radioButtons.length).toBe(2);
      expect(screen.getByText(/노동관계법 중대위반/)).toBeDefined();
      expect(screen.getByText(/노동관계법 일반위반/)).toBeDefined();
    });

    it("그룹 감점 항목이 빨간색 스타일로 표시된다", () => {
      renderForm();
      const deductionLabel = screen.getByText(/노동관계법 중대위반/);

      expect(deductionLabel.className).toContain("text-signal-red");
    });

    it("그룹 감점 항목의 점수가 -N점 형식으로 표시된다", () => {
      renderForm();
      expect(screen.getAllByText(/-10점/).length).toBeGreaterThan(0);
      expect(screen.getByText(/-6점/)).toBeDefined();
    });

    it("그룹 라디오 버튼 선택이 appliedScoringCodes에 반영된다", async () => {
      const onSubmit = vi.fn();
      const user = userEvent.setup();
      renderForm({ onSubmit });

      const radioButtons = screen.getAllByRole("radio");
      await user.click(radioButtons[0]); // LV_SERIOUS

      const timingSelect = screen.getByLabelText(/희망 시기/) as HTMLSelectElement;
      await user.selectOptions(timingSelect, "2026_Q2");

      const submitButton = screen.getByRole("button", { name: /시뮬레이션 실행/ });
      await user.click(submitButton);

      expect(onSubmit).toHaveBeenCalledTimes(1);
      const request = onSubmit.mock.calls[0][0];
      expect(request.appliedScoringCodes).toContain("LV_SERIOUS");
    });
  });

  // ── Submit disabled conditions ─────────────────────────────────

  describe("제출 비활성화 조건", () => {
    it("desiredTiming이 선택되지 않으면 제출 버튼이 비활성화된다", () => {
      renderForm();
      const submitButton = screen.getByRole("button", { name: /시뮬레이션 실행/ });
      expect((submitButton as HTMLButtonElement).disabled).toBe(true);
    });

    it("domesticInsuredCount가 0이면 제출 버튼이 비활성화된다", async () => {
      const user = userEvent.setup();
      renderForm({ company: null });

      // domesticInsuredCount starts at 0 when company is null
      const timingSelect = screen.getByLabelText(/희망 시기/) as HTMLSelectElement;
      await user.selectOptions(timingSelect, "2026_Q2");

      const submitButton = screen.getByRole("button", { name: /시뮬레이션 실행/ });
      expect((submitButton as HTMLButtonElement).disabled).toBe(true);
    });

    it("isPending이면 제출 버튼이 비활성화된다", async () => {
      const user = userEvent.setup();
      renderForm({ isPending: true });

      const timingSelect = screen.getByLabelText(/희망 시기/) as HTMLSelectElement;
      await user.selectOptions(timingSelect, "2026_Q2");

      const submitButton = screen.getByRole("button", { name: /분석 중/ });
      expect((submitButton as HTMLButtonElement).disabled).toBe(true);
    });

    it("필수 조건이 충족되면 제출 버튼이 활성화된다", async () => {
      const user = userEvent.setup();
      renderForm();

      const timingSelect = screen.getByLabelText(/희망 시기/) as HTMLSelectElement;
      await user.selectOptions(timingSelect, "2026_Q2");

      const submitButton = screen.getByRole("button", { name: /시뮬레이션 실행/ });
      expect((submitButton as HTMLButtonElement).disabled).toBe(false);
    });
  });

  // ── Submit request shape ───────────────────────────────────────

  describe("제출 데이터 형태", () => {
    it("올바른 SimulationRequest 형태로 onSubmit을 호출한다", async () => {
      const onSubmit = vi.fn();
      const user = userEvent.setup();
      renderForm({ onSubmit });

      const timingSelect = screen.getByLabelText(/희망 시기/) as HTMLSelectElement;
      await user.selectOptions(timingSelect, "2026_Q3");

      const submitButton = screen.getByRole("button", { name: /시뮬레이션 실행/ });
      await user.click(submitButton);

      expect(onSubmit).toHaveBeenCalledTimes(1);
      const request = onSubmit.mock.calls[0][0];
      expect(request).toEqual({
        desiredWorkers: 1,
        preferredNationality: undefined,
        desiredTiming: "2026_Q3",
        domesticInsuredCount: 30,
        appliedScoringCodes: [],
      });
    });

    it("희망 국적을 선택하면 preferredNationality가 포함된다", async () => {
      const onSubmit = vi.fn();
      const user = userEvent.setup();
      renderForm({ onSubmit });

      const nationalitySelect = screen.getByLabelText(/희망 국적/) as HTMLSelectElement;
      await user.selectOptions(nationalitySelect, "VIETNAM");

      const timingSelect = screen.getByLabelText(/희망 시기/) as HTMLSelectElement;
      await user.selectOptions(timingSelect, "2026_Q2");

      const submitButton = screen.getByRole("button", { name: /시뮬레이션 실행/ });
      await user.click(submitButton);

      const request = onSubmit.mock.calls[0][0];
      expect(request.preferredNationality).toBe("VIETNAM");
    });

    it("체크박스 선택이 appliedScoringCodes에 반영된다", async () => {
      const onSubmit = vi.fn();
      const user = userEvent.setup();
      renderForm({ onSubmit });

      const checkboxes = screen.getAllByRole("checkbox");
      await user.click(checkboxes[0]); // BONUS_1
      await user.click(checkboxes[2]); // DEDUCT_1

      const timingSelect = screen.getByLabelText(/희망 시기/) as HTMLSelectElement;
      await user.selectOptions(timingSelect, "2026_Q2");

      const submitButton = screen.getByRole("button", { name: /시뮬레이션 실행/ });
      await user.click(submitButton);

      const request = onSubmit.mock.calls[0][0];
      expect(request.appliedScoringCodes).toContain("BONUS_1");
      expect(request.appliedScoringCodes).toContain("DEDUCT_1");
      expect(request.appliedScoringCodes.length).toBe(2);
    });

    it("desiredWorkers 변경이 반영된다", async () => {
      const onSubmit = vi.fn();
      const user = userEvent.setup();
      renderForm({ onSubmit });

      const workersInput = screen.getByLabelText(/희망 채용 인원/) as HTMLInputElement;
      await user.clear(workersInput);
      await user.type(workersInput, "5");

      const timingSelect = screen.getByLabelText(/희망 시기/) as HTMLSelectElement;
      await user.selectOptions(timingSelect, "2026_Q2");

      const submitButton = screen.getByRole("button", { name: /시뮬레이션 실행/ });
      await user.click(submitButton);

      const request = onSubmit.mock.calls[0][0];
      expect(request.desiredWorkers).toBe(5);
    });
  });

  // ── Metadata error state ───────────────────────────────────────

  describe("메타데이터 에러 상태", () => {
    it("isMetadataError일 때 에러 메시지를 표시한다", () => {
      mockUseMetadata.mockReturnValue({ data: undefined, isError: true });
      renderForm();
      expect(
        screen.getByText("배정 점수 항목을 불러오지 못했습니다. 페이지를 새로고침해주세요."),
      ).toBeDefined();
    });

    it("isMetadataError가 아니면 에러 메시지를 표시하지 않는다", () => {
      renderForm();
      expect(
        screen.queryByText("배정 점수 항목을 불러오지 못했습니다. 페이지를 새로고침해주세요."),
      ).toBeNull();
    });
  });

  // ── isPending loading state ────────────────────────────────────

  describe("로딩 상태", () => {
    it("isPending이면 '분석 중...' 텍스트를 표시한다", () => {
      renderForm({ isPending: true });
      expect(screen.getByText("분석 중...")).toBeDefined();
    });

    it("isPending이면 '시뮬레이션 실행' 텍스트를 표시하지 않는다", () => {
      renderForm({ isPending: true });
      expect(screen.queryByText("시뮬레이션 실행")).toBeNull();
    });

    it("isPending이 아니면 '시뮬레이션 실행' 텍스트를 표시한다", () => {
      renderForm({ isPending: false });
      expect(screen.getByText("시뮬레이션 실행")).toBeDefined();
    });

    it("isPending이 아니면 '분석 중...' 텍스트를 표시하지 않는다", () => {
      renderForm({ isPending: false });
      expect(screen.queryByText("분석 중...")).toBeNull();
    });
  });

  // ── Read-only fields from company ──────────────────────────────

  describe("읽기 전용 필드", () => {
    it("현재 외국인 근로자 수가 회사 데이터에서 자동 입력된다", () => {
      renderForm();
      const input = screen.getByDisplayValue("5") as HTMLInputElement;
      expect(input.readOnly).toBe(true);
    });

    it("사업장 소재지가 회사 데이터에서 자동 입력된다", () => {
      renderForm();
      const inputs = screen.getAllByDisplayValue("서울");
      const readonlyInput = inputs.find(
        (el) => el.tagName === "INPUT" && (el as HTMLInputElement).readOnly,
      );
      expect(readonlyInput).toBeDefined();
    });
  });

  // ── Checkbox toggle behavior ───────────────────────────────────

  describe("체크박스 토글", () => {
    it("체크박스를 다시 클릭하면 선택이 해제된다", async () => {
      const onSubmit = vi.fn();
      const user = userEvent.setup();
      renderForm({ onSubmit });

      const checkboxes = screen.getAllByRole("checkbox");
      await user.click(checkboxes[0]); // check BONUS_1
      await user.click(checkboxes[0]); // uncheck BONUS_1

      const timingSelect = screen.getByLabelText(/희망 시기/) as HTMLSelectElement;
      await user.selectOptions(timingSelect, "2026_Q2");

      const submitButton = screen.getByRole("button", { name: /시뮬레이션 실행/ });
      await user.click(submitButton);

      const request = onSubmit.mock.calls[0][0];
      expect(request.appliedScoringCodes.length).toBe(0);
    });
  });

  // ── Disclaimer text ────────────────────────────────────────────

  describe("면책 문구", () => {
    it("면책 문구를 렌더링한다", () => {
      renderForm();
      expect(screen.getByText(/시뮬레이션 결과는 공공데이터 기반 추정이며/)).toBeDefined();
    });
  });
});
