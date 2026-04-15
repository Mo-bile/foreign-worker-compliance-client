export type AiProgressVariant = "dashboard" | "benchmark" | "simulation";

export interface ProgressStep {
  readonly label: string;
  readonly sub: string;
  readonly icon: "database" | "brain" | "file";
}

export interface ProgressPreset {
  readonly front: readonly ProgressStep[];
  readonly middle: readonly ProgressStep[];
  readonly back: readonly ProgressStep[];
}

export const PHASE_RATIO = { front: 0.2, middle: 0.6, back: 0.2 } as const;

export const TOTAL_DURATION: Record<AiProgressVariant, number> = {
  simulation: 6000,
  benchmark: 12000,
  dashboard: 25000,
};

const COMMON_MIDDLE: readonly ProgressStep[] = [
  { label: "AI가 데이터 패턴을 분석하고 있습니다...", sub: "이상치 및 추세 탐지", icon: "brain" },
  { label: "리스크 요인을 평가하고 있습니다...", sub: "우선순위별 위험도 산정", icon: "brain" },
  { label: "관련 규정과 대조하고 있습니다...", sub: "고용허가제 기준 검토", icon: "brain" },
  { label: "유사 사업장 사례를 참고하고 있습니다...", sub: "동종업계 비교 분석", icon: "brain" },
  { label: "핵심 인사이트를 도출하고 있습니다...", sub: "주요 발견사항 정리", icon: "brain" },
];

const DASHBOARD_PRESET: ProgressPreset = {
  front: [
    { label: "근로자 현황을 조회하고 있습니다...", sub: "비자 유형별 분포 확인", icon: "database" },
    { label: "보험 가입 현황을 확인하고 있습니다...", sub: "4대보험 가입률 계산", icon: "database" },
    { label: "컴플라이언스 데드라인을 점검하고 있습니다...", sub: "비자 만료, 보험 가입 기한", icon: "database" },
    { label: "긴급 조치 항목을 집계하고 있습니다...", sub: "초과/임박 건 분류", icon: "database" },
  ],
  middle: COMMON_MIDDLE,
  back: [
    { label: "권장 조치 사항을 정리하고 있습니다...", sub: "긴급도 순 조치 목록", icon: "file" },
    { label: "인사이트 리포트를 작성하고 있습니다...", sub: "요약 + 리스크 + 조치", icon: "file" },
    { label: "마무리 중입니다...", sub: "최종 검토", icon: "file" },
  ],
};

const BENCHMARK_PRESET: ProgressPreset = {
  front: [
    { label: "사업장 임금 데이터를 수집하고 있습니다...", sub: "월 평균임금, 지급 현황", icon: "database" },
    { label: "동종업계 통계를 조회하고 있습니다...", sub: "지역×업종 기준 비교군 선정", icon: "database" },
    { label: "이직률 데이터를 분석하고 있습니다...", sub: "E-9 퇴사사유 분포 조회", icon: "database" },
    { label: "관리 실태 항목을 점검하고 있습니다...", sub: "체크리스트 기반 점수 산정", icon: "database" },
  ],
  middle: COMMON_MIDDLE,
  back: [
    { label: "4축 진단 결과를 종합하고 있습니다...", sub: "임금/안정성/관리/포지셔닝", icon: "file" },
    { label: "개선 방향을 도출하고 있습니다...", sub: "우선순위별 권장 사항", icon: "file" },
    { label: "진단 리포트를 작성하고 있습니다...", sub: "전문가 진단 형식 정리", icon: "file" },
    { label: "마무리 중입니다...", sub: "최종 검토", icon: "file" },
  ],
};

const SIMULATION_PRESET: ProgressPreset = {
  front: [
    { label: "고용 한도를 계산하고 있습니다...", sub: "내국인 피보험자 수 기반", icon: "database" },
    { label: "점수제 항목을 시뮬레이션하고 있습니다...", sub: "가점/감점 합산", icon: "database" },
    { label: "분기별 쿼터 현황을 조회하고 있습니다...", sub: "업종별 배정 규모 확인", icon: "database" },
    { label: "예상 소요기간을 추정하고 있습니다...", sub: "국적별 행정 소요일 계산", icon: "database" },
  ],
  middle: COMMON_MIDDLE,
  back: [
    { label: "시뮬레이션 결과를 생성하고 있습니다...", sub: "고용 가능성 판정", icon: "file" },
    { label: "대안 시나리오를 검토하고 있습니다...", sub: "조건 변경 시 결과 비교", icon: "file" },
    { label: "종합 분석을 작성하고 있습니다...", sub: "한도/점수/소요기간 정리", icon: "file" },
    { label: "마무리 중입니다...", sub: "최종 검토", icon: "file" },
  ],
};

export const AI_PROGRESS_PRESETS: Record<AiProgressVariant, ProgressPreset> = {
  dashboard: DASHBOARD_PRESET,
  benchmark: BENCHMARK_PRESET,
  simulation: SIMULATION_PRESET,
};
