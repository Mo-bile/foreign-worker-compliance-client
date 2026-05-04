import { describe, it, expect, vi, beforeEach, beforeAll, afterAll, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { server } from "@/mocks/server";
import { createMockCompany } from "@/__tests__/fixtures/company";

// ─── Mocks ──────────────────────────────────────────────

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({ push: vi.fn(), back: vi.fn(), replace: vi.fn() }),
}));

vi.mock("@/lib/contexts/company-context", () => ({
  useCompanyContext: () => ({
    selectedCompanyId: 1,
    selectedCompany: mockCompanyData,
    companies: [mockCompanyData],
    isLoading: false,
    isError: false,
    setSelectedCompanyId: vi.fn(),
  }),
}));

const mockCompanyData = createMockCompany({
  id: 1,
  name: "테스트 사업장",
  businessNumber: "123-45-67890",
  region: "SEOUL",
  subRegion: null,
  industryCategory: "MANUFACTURING",
  industrySubCategory: null,
  employeeCount: 50,
  domesticInsuredCount: null,
  address: "서울시 강남구",
  contactPhone: "02-1234-5678",
  contactEmail: "test@demo.test",
  averageForeignWorkerWage: null,
  createdAt: "2026-01-01",
  updatedAt: "2026-01-01",
  derivedCounts: {
    activeForeignWorkerCount: 3,
    registeredWorkforceTotal: 3,
  },
});

vi.mock("@/lib/queries/use-companies", () => ({
  useCompany: () => ({
    data: mockCompanyData,
    isLoading: false,
    isError: false,
    error: null,
  }),
  useCreateCompany: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
  useUpdateCompany: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
  usePatchCompany: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
  useCompanies: () => ({ data: [], isLoading: false, isError: false }),
}));

vi.mock("@/lib/queries/use-workers", () => ({
  useWorkers: () => ({
    data: [{ id: 1 }, { id: 2 }, { id: 3 }],
    isLoading: false,
    isError: false,
  }),
}));

vi.mock("@/lib/queries/use-simulation", () => ({
  useSimulation: () => ({
    data: null,
    isPending: false,
    isError: false,
    mutate: vi.fn(),
    reset: vi.fn(),
  }),
}));

vi.mock("@/lib/queries/use-benchmark", () => ({
  useBenchmarkList: () => ({
    data: [],
    isLoading: false,
    isError: false,
    error: null,
  }),
  useCreateBenchmark: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
}));

// ─── MSW Setup ──────────────────────────────────────────

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// ─── Helpers ────────────────────────────────────────────

function renderWithQuery(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

// ─── Imports (after mocks) ──────────────────────────────

import { Sidebar } from "@/components/layout/sidebar";
import { DeadlineTimeline } from "@/components/dashboard/deadline-timeline";
import { NotificationTimingToggles } from "@/components/notifications/notification-timing-toggles";
import { NotificationLogTable } from "@/components/notifications/notification-log-table";
import { CompanyEditModal } from "@/components/settings/company-edit-modal";
import SimulatorPage from "@/app/(app)/simulator/page";
import BenchmarkPage from "@/app/(app)/benchmark/page";
import MyCompanyPage from "@/app/(app)/settings/company/page";
import NotificationSettingsPage from "@/app/(app)/settings/notifications/page";
import type { NotificationLog } from "@/types/notification";

// ─── Tests ──────────────────────────────────────────────

describe("Sidebar — S17 카테고리 재구성", () => {
  beforeEach(() => {
    render(<Sidebar />);
  });

  it("6개 카테고리가 모두 표시된다", () => {
    expect(screen.getByText("메인")).toBeInTheDocument();
    expect(screen.getByText("고용 전")).toBeInTheDocument();
    expect(screen.getByText("고용 후")).toBeInTheDocument();
    expect(screen.getByText("지속 관리")).toBeInTheDocument();
    expect(screen.getByText("설정")).toBeInTheDocument();
    expect(screen.getByText("관리자")).toBeInTheDocument();
  });

  it("예상 계산 라벨이 E-9 고용허가 표현을 포함한다", () => {
    expect(screen.getByText("E-9 고용허가 예상 계산")).toBeInTheDocument();
  });

  it("설정 카테고리에 내 사업장 정보, 알림 설정이 있다", () => {
    expect(screen.getByText("내 사업장 정보")).toBeInTheDocument();
    expect(screen.getByText("알림 설정")).toBeInTheDocument();
  });

  it("관리자 카테고리에 사업장 관리가 있다", () => {
    expect(screen.getByText("사업장 관리")).toBeInTheDocument();
  });
});

describe("SimulatorPage — E-9 안내 박스", () => {
  it("E-9 비자 기준 안내 문구가 표시된다", () => {
    renderWithQuery(<SimulatorPage />);
    expect(screen.getByText(/E-9 \(일반 외국인\) 비자 기준/)).toBeInTheDocument();
    expect(screen.getByText(/H-2 \(방문취업\)/)).toBeInTheDocument();
  });
});

describe("BenchmarkPage — 진단 안내 박스", () => {
  it("사업장 진단에 사용하는 데이터 기준 안내 문구가 표시된다", () => {
    renderWithQuery(<BenchmarkPage />);
    expect(screen.getByText(/회사 및 근로자 정보와 외부 기준 정보/)).toBeInTheDocument();
    expect(screen.getByText(/임금 구간, E-9 퇴사 사유, 관리 체크리스트/)).toBeInTheDocument();
    expect(screen.getByText(/지역\/업종 내 위치 기준/)).toBeInTheDocument();
  });
});

describe("DeadlineTimeline — 알림 설정 딥링크", () => {
  it("알림 설정 링크가 표시된다", () => {
    render(<DeadlineTimeline items={[]} />);
    const link = screen.getByText("알림 설정 →");
    expect(link).toHaveAttribute("href", "/settings/notifications");
  });
});

describe("NotificationSettingsPage — 알림 안내 박스", () => {
  it("상단 안내 문구와 쉬운 발송 표현을 표시한다", () => {
    renderWithQuery(<NotificationSettingsPage />);

    expect(screen.getByText(/주요 기한을 놓치지 않도록 이메일로 알려주는 기능/)).toBeInTheDocument();
    expect(screen.getByText(/받을 이메일을 확인하고, 알림을 받을 시점/)).toBeInTheDocument();
    expect(screen.getByText(/자동 발송은 준비 중/)).toBeInTheDocument();
    expect(screen.getByText("직접 보내기")).toBeInTheDocument();
    expect(screen.queryByText(/P2 단계/)).not.toBeInTheDocument();
  });
});

describe("NotificationTimingToggles", () => {
  const STORAGE_KEY = "fwc:notification-prefs:1";

  beforeEach(() => {
    localStorage.clear();
  });

  it("기본값으로 3개 체크박스가 모두 체크된다", () => {
    render(<NotificationTimingToggles companyId={1} />);
    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes).toHaveLength(3);
    checkboxes.forEach((cb) => expect(cb).toBeChecked());
  });

  it("체크 해제 시 localStorage에 저장된다", async () => {
    const user = userEvent.setup();
    render(<NotificationTimingToggles companyId={1} />);
    const d30Checkbox = screen.getByLabelText("D-30 (한 달 전)");
    await user.click(d30Checkbox);
    expect(d30Checkbox).not.toBeChecked();
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(stored.d30).toBe(false);
  });

  it("localStorage에 저장된 값을 복원한다", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ d30: false, d7: true, overdue: false }));
    render(<NotificationTimingToggles companyId={1} />);
    expect(screen.getByLabelText("D-30 (한 달 전)")).not.toBeChecked();
    expect(screen.getByLabelText("D-7 (일주일 전)")).toBeChecked();
    expect(screen.getByLabelText("기한 초과")).not.toBeChecked();
  });
});

describe("NotificationLogTable", () => {
  const mockLogs: NotificationLog[] = [
    {
      id: 1,
      sentAt: "2026-04-25T14:30:00",
      templateType: "D7",
      deadlineCount: 3,
      recipientEmail: "owner1@demo.test",
    },
    {
      id: 2,
      sentAt: "2026-04-20T09:00:00",
      templateType: "OVERDUE",
      deadlineCount: 2,
      recipientEmail: "owner1@demo.test",
    },
  ];

  it("발송 기록을 테이블로 렌더링한다", () => {
    render(<NotificationLogTable logs={mockLogs} />);
    expect(screen.getByText("D-7")).toBeInTheDocument();
    expect(screen.getByText("기한 초과")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getAllByText("owner1@demo.test")).toHaveLength(2);
  });

  it("빈 배열이면 안내 메시지를 표시한다", () => {
    render(<NotificationLogTable logs={[]} />);
    expect(screen.getByText("발송 기록이 없습니다")).toBeInTheDocument();
  });
});

describe("CompanyEditModal", () => {
  const mockCompany = createMockCompany();

  it("open=true일 때 모달이 표시된다", () => {
    renderWithQuery(
      <CompanyEditModal open={true} onClose={vi.fn()} company={mockCompany} section="info" />,
    );
    expect(screen.getByText("사업장 정보 수정")).toBeInTheDocument();
    expect(screen.getByDisplayValue("테스트 회사")).toBeInTheDocument();
  });

  it("open=false일 때 모달이 표시되지 않는다", () => {
    renderWithQuery(
      <CompanyEditModal open={false} onClose={vi.fn()} company={mockCompany} section="info" />,
    );
    expect(screen.queryByText("사업장 정보 수정")).not.toBeInTheDocument();
  });

  it("section=workers일 때 인원 정보 수정 모달이 표시된다", () => {
    renderWithQuery(
      <CompanyEditModal open={true} onClose={vi.fn()} company={mockCompany} section="workers" />,
    );
    expect(screen.getByText("인원 정보 수정")).toBeInTheDocument();
    expect(screen.getByDisplayValue("50")).toBeInTheDocument();
  });

  it("section=benchmark일 때 비교 진단 정보 수정 모달이 표시된다", () => {
    renderWithQuery(
      <CompanyEditModal open={true} onClose={vi.fn()} company={mockCompany} section="benchmark" />,
    );
    expect(screen.getByText("비교 진단 정보 수정")).toBeInTheDocument();
  });
});

describe("MyCompanyPage — 내 사업장 정보", () => {
  it("사업장 정보와 근로자 수를 표시한다", () => {
    renderWithQuery(<MyCompanyPage />);
    expect(screen.getByText("내 사업장 정보")).toBeInTheDocument();
    expect(screen.getByText("123-45-67890")).toBeInTheDocument();
    expect(screen.getByText("재직중 (전체)")).toBeInTheDocument();
    expect(screen.getAllByText("3명").length).toBeGreaterThan(0);
  });

  it("각 카드에 수정 버튼이 있다", () => {
    renderWithQuery(<MyCompanyPage />);
    const editButtons = screen.getAllByRole("button", { name: /수정/ });
    expect(editButtons.length).toBe(3);
  });

  it("근로자 관리 링크가 있다", () => {
    renderWithQuery(<MyCompanyPage />);
    const link = screen.getByText("근로자 관리 →");
    expect(link).toHaveAttribute("href", "/workers");
  });
});

describe("NotificationSettingsPage — 알림 설정", () => {
  it("주요 섹션이 모두 표시된다", () => {
    renderWithQuery(<NotificationSettingsPage />);
    expect(screen.getByText("알림 설정")).toBeInTheDocument();
    expect(screen.getByText("수신 이메일")).toBeInTheDocument();
    expect(screen.getByText("알림 시점")).toBeInTheDocument();
    expect(screen.getByText("직접 보내기")).toBeInTheDocument();
    expect(screen.getByText("최근 발송 기록")).toBeInTheDocument();
  });

  it("contactEmail을 표시한다", () => {
    renderWithQuery(<NotificationSettingsPage />);
    expect(screen.getByText("test@demo.test")).toBeInTheDocument();
  });

  it("지금 알림 보내기 버튼이 있다", () => {
    renderWithQuery(<NotificationSettingsPage />);
    expect(screen.getByRole("button", { name: /지금 알림 보내기/ })).toBeInTheDocument();
  });

  it("자동 발송 준비 중 안내가 표시된다", () => {
    renderWithQuery(<NotificationSettingsPage />);
    expect(screen.getAllByText(/자동 발송은 .*준비 중/).length).toBeGreaterThanOrEqual(1);
  });
});
