import type { DashboardResponse } from "@/types/dashboard";

export const mockDashboard: DashboardResponse = {
  stats: {
    totalWorkers: 12,
    visaBreakdown: [
      { type: "E9", count: 8 },
      { type: "H2", count: 3 },
      { type: "E7", count: 1 },
    ],
    insuranceRate: 91.7,
    insuranceRateChange: 4.2,
    upcomingDeadlines: 5,
    deadlineBreakdown: { d7: 2, d30: 3 },
    urgentActions: 3,
    urgentBreakdown: { visa: 1, insurance: 2 },
  },
  alerts: [
    {
      id: "1",
      level: "critical",
      title: "비자 만료 임박 — Nguyen Van A",
      description: "E-9 비자가 2026.03.28에 만료됩니다. 즉시 연장 신청이 필요합니다.",
      dDay: 4,
      badgeText: "D-4",
      actions: [
        { label: "비자 연장 신청", href: "/workers/1" },
        { label: "근로자 상세", href: "/workers/1" },
      ],
    },
    {
      id: "2",
      level: "warning",
      title: "건강보험 미가입 — Pham Thi B",
      description: "입사 후 14일이 경과했으나 건강보험 취득신고가 완료되지 않았습니다.",
      dDay: 0,
      badgeText: "D-0",
      actions: [
        { label: "일정 확인", href: "/deadlines" },
        { label: "조치하기", href: "/workers/2" },
      ],
    },
    {
      id: "3",
      level: "info",
      title: "법령 변경 — 2026년 최저임금 고시",
      description: "7월 1일부터 시간급 10,620원으로 변경. 귀사 근로자 3명의 계약서 확인 필요.",
      dDay: null,
      badgeText: "정보",
      actions: [{ label: "자세히 보기", href: "/legal-changes" }],
    },
  ],
  visaDistribution: [
    { type: "E9", count: 8, percentage: 66.7 },
    { type: "H2", count: 3, percentage: 25.0 },
    { type: "E7", count: 1, percentage: 8.3 },
  ],
  insuranceSummary: [
    {
      type: "national_pension",
      enrolled: 10,
      label: "국민연금",
      status: "ok",
      statusText: "✓ 가입",
    },
    { type: "health", enrolled: 11, label: "건강보험", status: "warn", statusText: "1 미가입" },
    { type: "employment", enrolled: 9, label: "고용보험", status: "warn", statusText: "1 미가입" },
    {
      type: "industrial_accident",
      enrolled: 12,
      label: "산재보험",
      status: "ok",
      statusText: "✓ 전원",
    },
  ],
  complianceScore: {
    total: 73,
    breakdown: [
      { label: "보험 가입", score: 92 },
      { label: "데드라인 준수", score: 65 },
      { label: "임금 경쟁력", score: 62 },
    ],
  },
  aiInsight:
    "귀사의 외국인 근로자 임금 수준은 경기도 안산시 식료품제조업 동종업계 대비 <strong>하위 30%</strong>에 해당합니다. 최근 동종업계의 사업장 변경율이 증가 추세(전분기 대비 +12%)이므로, 인력 유출 방지를 위한 임금 경쟁력 개선을 권장드립니다. 또한 Nguyen Van A 근로자의 비자 만료가 4일 남았으므로 <strong>즉시 연장 신청</strong>을 진행하세요.",
  upcomingDeadlines: [
    {
      id: "d1",
      title: "비자 연장 신청",
      workerName: "Nguyen Van A",
      visaType: "E9",
      dDay: 4,
      urgency: "d7",
    },
    {
      id: "d2",
      title: "건강보험 취득신고",
      workerName: "Pham Thi B",
      visaType: "E9",
      dDay: 0,
      urgency: "overdue",
    },
    {
      id: "d3",
      title: "근로계약 갱신",
      workerName: "Rahman C",
      visaType: "H2",
      dDay: 21,
      urgency: "d30",
    },
    {
      id: "d4",
      title: "비자 만료",
      workerName: "Li Wei D",
      visaType: "E7",
      dDay: 45,
      urgency: "d30",
    },
    {
      id: "d5",
      title: "고용변동 신고",
      workerName: "Tran E",
      visaType: "E9",
      dDay: 58,
      urgency: "safe",
    },
  ],
};
