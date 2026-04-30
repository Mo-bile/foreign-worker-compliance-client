import type { ComplianceReportResponse } from "@/types/report";

export const mockComplianceReport: ComplianceReportResponse = {
  id: "rpt-2026-03",
  title: "2026년 3월 준수 현황 월간 리포트",
  period: "안산제조 주식회사 · 2026.03.01 ~ 2026.03.24 · 자동 생성",
  score: 73,
  scoreChange: 4,
  aiSummary:
    '<p>이번 달 종합 점수는 <strong class="text-signal-orange">73점</strong>으로 전월 대비 <strong class="text-signal-green">4점 상승</strong>했습니다. 보험 관련 의무사항 이행이 우수하나, 비자 연장 및 건강보험 처리 지연 건에 대한 즉각적인 조치가 필요합니다.</p>',
  completed: [
    {
      id: "c1",
      title: "Tran E 고용변동 신고",
      description: "외국인 고용변동 신고 완료",
      status: "done",
      date: "03.05",
    },
    {
      id: "c2",
      title: "Rahman C 건강보험 취득신고",
      description: "건강보험 자격취득 신고 완료",
      status: "done",
      date: "03.10",
    },
    {
      id: "c3",
      title: "분기 산재보험 정산",
      description: "2026년 1분기 산재보험료 정산 완료",
      status: "done",
      date: "03.15",
    },
    {
      id: "c4",
      title: "사회보장협정 확인",
      description: "한-캄보디아 사회보장협정 적용 확인",
      status: "done",
      date: "03.18",
    },
    {
      id: "c5",
      title: "Li Wei D 근로계약 갱신",
      description: "근로계약 갱신 완료 (2026.04~2027.03)",
      status: "done",
      date: "03.20",
    },
  ],
  pending: [
    {
      id: "p1",
      title: "Nguyen Van A 비자 연장",
      description: "E-9 비자 만료 임박 — 즉시 연장 신청 필요",
      status: "miss",
      badge: { text: "D-4", color: "red" },
    },
    {
      id: "p2",
      title: "Pham Thi B 건강보험 취득신고",
      description: "입사 후 14일 초과 — 즉시 신고 필요",
      status: "miss",
      badge: { text: "지연", color: "red" },
    },
    {
      id: "p3",
      title: "최저임금 대응 (3건)",
      description: "7월 시행 전 근로계약서 갱신 필요",
      status: "pending",
      badge: { text: "D-99", color: "orange" },
    },
  ],
  legalChanges: [
    {
      title: "최저임금법 시행령 개정",
      description: "시간급 10,030원 → 10,360원 변경, E-9 근로자 3명 계약서 갱신 필요",
      color: "red",
    },
    {
      title: "고용허가제 시행규칙 개정",
      description: "사업장 변경 사유 확대, 직접 조치 불필요하나 모니터링 권장",
      color: "orange",
    },
  ],
  upcoming: [
    {
      title: "Li Wei D 비자 만료",
      description: "2026.04.15 만료 — 연장 신청 준비",
      urgency: "urgent",
    },
    {
      title: "Rahman C 근로계약 만료",
      description: "2026.04.30 만료 — 갱신 여부 결정 필요",
      urgency: "warning",
    },
    {
      title: "분기 보험료 납부",
      description: "2026.04.10 마감 — 2분기 산재보험료",
      urgency: "normal",
    },
  ],
};
