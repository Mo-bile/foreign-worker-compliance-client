import type { LegalChangesResponse, LegalImpact } from "@/types/legal";

export const mockLegalChangesResponse: LegalChangesResponse = {
  changes: [
    {
      id: "lc-1",
      title: "고용허가제 시행규칙 개정",
      icon: "📋",
      lawName: "외국인근로자의 고용 등에 관한 법률 시행규칙",
      effectiveDate: "2026-04-15",
      detectedDate: "2026-03-18",
      severity: "warning",
      status: "reference",
      badge: { text: "참고", color: "orange" },
      dDay: 22,
    },
    {
      id: "lc-2",
      title: "최저임금법 시행령 개정",
      icon: "⚖️",
      lawName: "최저임금법 시행령",
      effectiveDate: "2026-07-01",
      detectedDate: "2026-03-20",
      severity: "critical",
      status: "action_required",
      badge: { text: "조치 필요", color: "red" },
      dDay: 99,
    },
    {
      id: "lc-3",
      title: "한-캄보디아 사회보장협정",
      icon: "🌐",
      lawName: "사회보장협정",
      effectiveDate: "2026-03-01",
      detectedDate: "2026-02-15",
      severity: "resolved",
      status: "resolved",
      badge: { text: "확인 완료", color: "green" },
    },
  ],
  lastSyncedAt: "2026-03-24T06:00:00+09:00",
};

export const mockImpacts: Record<string, LegalImpact> = {
  "lc-1": {
    changeId: "lc-1",
    impacts: [
      "사업장 변경 사유가 확대되어 근로자의 이동 가능성 증가",
      "E-9/H-2 비자 근로자 11명 중 해당 사항 검토 필요",
      "직접적 조치 사항 없으나 주기적 점검 권장",
    ],
    aiAnalysis:
      '<p>이번 개정은 사업장 변경 사유를 확대하는 내용으로, 귀사에 <strong class="text-signal-orange">직접적인 리스크는 낮습니다</strong>. 다만, 근로 환경 개선을 통해 자발적 이직을 방지하는 것이 권장됩니다. 주기적인 근로조건 점검을 통해 사전 대응하시기 바랍니다.</p>',
    actions: [
      { label: "근로조건 점검 시작" },
      { label: "확인 완료 처리" },
    ],
  },
  "lc-2": {
    changeId: "lc-2",
    impacts: [
      "시간급 10,030원 → 10,360원 변경 (3.3% 인상)",
      "E-9 비자 근로자 3명의 현재 임금이 신규 최저임금 미달",
      "해당 근로자 근로계약서 갱신 필요",
    ],
    aiAnalysis:
      '<p>귀사 E-9 근로자 <strong class="text-signal-red">3명</strong>의 현재 시급이 개정 최저임금에 미달합니다. <strong class="text-signal-red">7월 1일</strong> 시행 전까지 근로계약서 갱신이 필요하며, 미이행 시 최저임금법 위반으로 <strong class="text-signal-red">벌칙 대상</strong>이 됩니다.</p>',
    actions: [
      { label: "계약서 갱신 시작", primary: true },
      { label: "영향 근로자 목록 보기" },
      { label: "확인 완료 처리" },
    ],
  },
};
