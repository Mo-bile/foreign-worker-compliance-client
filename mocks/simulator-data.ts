import type { SimulationResponse } from "@/types/simulator";

export const mockSimulationResponse: SimulationResponse = {
  id: "sim-mock-001",
  verdict: "HIGH",
  verdictText: "높음",
  summary:
    "현재 조건에서 E-9 근로자 배정 가능성이 높습니다. 해당 지역의 쿼터 여유분과 업종 수요를 고려할 때 신청 적기입니다.",
  analyzedAt: "2026-03-24T14:32:00Z",
  dataSourceCount: 4,
  stats: {
    allocation: {
      label: "배정 가능성",
      value: "높음",
      subText: "쿼터 여유 충분",
      color: "green",
    },
    competition: {
      label: "지역 경쟁도",
      value: "보통",
      subText: "밀집도 상위 35%",
      color: "orange",
    },
    duration: {
      label: "예상 소요기간",
      value: "3~5개월",
      subText: "내국인 구인노력 포함",
      color: "blue",
    },
  },
  analyses: [
    {
      id: "quota",
      icon: "BarChart3",
      title: "쿼터 분석",
      badge: { text: "여유", color: "green" },
      dataRows: [
        { key: "업종별 배정 쿼터", value: "4,200명" },
        { key: "현재 배정 인원", value: "2,856명" },
        { key: "잔여 쿼터", value: "1,344명" },
      ],
      progress: { label: "소진율", value: 68, level: "mid" },
      dataSources: [
        { name: "고용노동부", dataId: "15002263" },
        { name: "한국산업인력공단", dataId: "AK102" },
      ],
      aiInsight:
        "현재 소진율 <strong>68%</strong>는 양호한 수준입니다. 전년 동기 대비 소진 속도가 <em>12% 느려</em> 하반기 신청 시 배정 가능성이 높습니다.",
    },
    {
      id: "competition",
      icon: "Factory",
      title: "지역 경쟁도 분석",
      badge: { text: "보통", color: "orange" },
      dataRows: [
        { key: "동일 지역 신청 사업장", value: "127개" },
        { key: "밀집도 순위", value: "상위 35%" },
        { key: "사업장당 평균 신청", value: "1.4배" },
      ],
      progress: { label: "경쟁 강도", value: 35, level: "low" },
      dataSources: [{ name: "고용노동부", dataId: "15002263" }],
      aiInsight:
        "해당 지역은 경쟁 강도가 <strong>보통</strong> 수준입니다. 제조업 밀집 지역이나 최근 신규 사업장 유입이 <em>둔화</em>되어 배정에 유리합니다.",
    },
  ],
  nationality: {
    nationality: "VIETNAM",
    percentage: 32.4,
    avgPercentage: 28.7,
    trend: "up",
  },
  recommendations: [
    {
      text: "내국인 구인노력 의무기간 14일을 우선 이행하세요",
      linkText: "워크넷 바로가기",
      href: "https://www.work.go.kr",
    },
    {
      text: "필요 서류를 미리 준비하면 처리 기간을 단축할 수 있습니다",
      linkText: "서류 목록 보기",
      href: "/documents",
    },
    {
      text: "관할 고용센터에 사전 상담을 신청하세요",
      linkText: "고용센터 찾기",
      href: "https://www.ei.go.kr",
    },
    {
      text: "E-9 비자 발급까지 평균 3~5개월이 소요됩니다",
    },
  ],
};
