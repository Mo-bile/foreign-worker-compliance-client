import type { BenchmarkResponse } from "@/types/benchmark";

export const mockBenchmarkResponse: BenchmarkResponse = {
  id: "bench-2026-q1",
  reportPeriod: "2026년 1분기",
  analyzedAt: "2026-03-15T09:00:00Z",
  dataSourceCount: 5,

  score: {
    total: 73,
    grade: "B+",
    change: 4,
    categories: [
      { label: "보험 가입", score: 92, color: "green" },
      { label: "데드라인", score: 65, color: "orange" },
      { label: "임금 경쟁력", score: 62, color: "yellow" },
    ],
  },

  aiSummary:
    '<p>귀사의 종합 컴플라이언스 점수는 <strong class="text-signal-orange">73점(B+)</strong>으로 양호한 수준입니다. 전 분기 대비 4점 상승하여 개선 추세를 보이고 있습니다.</p>' +
    '<p>주요 개선점: <strong class="text-signal-orange">데드라인 관리</strong>와 <strong class="text-signal-orange">임금 경쟁력</strong> 부문에서 집중 관리가 필요합니다.</p>' +
    "<p>강점: 보험 가입률이 92점으로 우수하며, 전체 외국인 근로자의 보험 가입이 적절히 관리되고 있습니다.</p>",

  quickActions: {
    urgent: {
      count: 2,
      items: [
        { text: "비자 만료 임박 근로자 1명 — 즉시 연장 신청 필요", href: "/workers" },
        { text: "산재보험 미가입 근로자 1명 — 즉시 가입 필요", href: "/workers" },
      ],
    },
    improvement: {
      count: 3,
      items: [
        { text: "임금 수준 조정 검토 대상 2명" },
        { text: "근로계약 갱신 예정 1명" },
        { text: "정기 안전교육 실시 권고" },
      ],
    },
  },

  wage: {
    title: "임금 경쟁력",
    icon: "💰",
    badge: { text: "하위 30%", color: "orange" },
    percentile: 30,
    medianPercentile: 50,
    percentileLabel: "경기도 안산시 식료품제조업 외국인 근로자 임금 분포",
    dataRows: [
      { key: "귀사 평균 임금", value: "220만원" },
      { key: "업종 중위 임금", value: "248만원" },
      { key: "임금 격차", value: "-28만원 (-11.3%)", color: "red" },
    ],
    dataSources: [
      { name: "고용노동부 임금정보", dataId: "MOEL-WAGE-2026Q1" },
      { name: "외국인력 실태조사", dataId: "KOSTAT-FW-2025" },
    ],
    aiInsight:
      '<p>귀사의 평균 임금은 동종업종 대비 <strong class="text-signal-red">하위 30%</strong> 수준입니다. ' +
      "임금 경쟁력이 낮을 경우 숙련 인력의 이탈 위험이 높아질 수 있으므로, " +
      "단계적 임금 인상 또는 복리후생 개선을 검토하시기 바랍니다.</p>",
  },

  attrition: {
    title: "인력 유출 위험",
    icon: "🚪",
    badge: { text: "보통", color: "orange" },
    riskLevel: "moderate",
    dataRows: [
      { key: "최근 6개월 이직률", value: "12.5%", color: "orange" },
      { key: "업종 평균 이직률", value: "8.2%" },
      { key: "근속 1년 미만 비율", value: "33.3%", color: "yellow" },
      { key: "계약 만료 예정(3개월)", value: "2명" },
    ],
    dataSources: [
      { name: "사업장 인사기록", dataId: "COMPANY-HR-2026Q1" },
      { name: "고용허가제 통계", dataId: "EPS-STAT-2025" },
    ],
    aiInsight:
      "<p>인력 유출 위험도가 <strong>보통</strong> 수준입니다. " +
      '최근 6개월 이직률이 업종 평균보다 <strong class="text-signal-orange">4.3%p 높으며</strong>, ' +
      "근속 1년 미만 비율이 33.3%로 신규 인력 정착에 주의가 필요합니다.</p>",
  },

  dependency: {
    title: "외국인 의존도",
    icon: "📊",
    badge: { text: "+4.6%p 높음", color: "yellow" },
    companyRatio: 26.7,
    industryRatio: 22.1,
    companyCount: 12,
    totalCount: 45,
    dataRows: [
      { key: "귀사 외국인 비율", value: "26.7%", color: "blue" },
      { key: "업종 평균 비율", value: "22.1%" },
      { key: "외국인 근로자 수", value: "12명 / 45명" },
    ],
    dataSources: [
      { name: "사업장 인사기록", dataId: "COMPANY-HR-2026Q1" },
      { name: "고용허가제 통계", dataId: "EPS-STAT-2025" },
    ],
    aiInsight:
      '<p>귀사의 외국인 의존도는 업종 평균 대비 <strong class="text-signal-yellow">4.6%p 높은</strong> 수준입니다. ' +
      "급격한 정책 변화나 쿼터 축소 시 인력 수급에 영향을 받을 수 있으므로, " +
      "내국인 채용 병행을 검토하시기 바랍니다.</p>",
  },

  trend: {
    title: "점수 추이",
    icon: "📈",
    badge: { text: "+4점 상승", color: "green" },
    months: [
      { month: "2026.01", total: 65, insurance: 83, deadline: 55, wage: 60 },
      { month: "2026.02", total: 69, insurance: 88, deadline: 60, wage: 62 },
      { month: "2026.03", total: 73, insurance: 92, deadline: 65, wage: 62 },
    ],
    dataRows: [
      { key: "3개월 평균", value: "69점" },
      { key: "최고점", value: "73점 (3월)" },
      { key: "최저점", value: "65점 (1월)" },
    ],
    dataSources: [
      { name: "CompliMate 분석 기록", dataId: "CM-ANALYSIS-2026Q1" },
    ],
    aiInsight:
      "<p>최근 3개월간 종합 점수가 <strong>꾸준히 상승</strong>하고 있습니다. " +
      '특히 보험 가입 부문이 <strong class="text-signal-green">83→92점</strong>으로 크게 개선되었으며, ' +
      "데드라인 관리도 점진적으로 나아지고 있습니다.</p>",
  },
};
