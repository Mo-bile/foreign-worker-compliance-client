import type {
  SimulationResultResponse,
  SimulationResponse,
  SimulationVerdict,
  SimStatItem,
  AnalysisSection,
  NationalityAnalysis,
  RecommendationItem,
  QuotaAnalysis,
  CompetitionAnalysis,
  NationalityAnalysisResult,
  SignalColor,
} from "@/types/simulator";
import type { Nationality } from "@/types/api";
import type { DataSource } from "@/types/shared";

// ─── Constants ───────────────────────────────────────────────────

const VERDICT_TEXT: Record<SimulationVerdict, string> = {
  HIGH: "높음",
  MEDIUM: "보통",
  LOW: "낮음",
};

const COMPETITION_LABEL: Record<CompetitionAnalysis["competitionLevel"], string> = {
  HIGH: "치열",
  MEDIUM: "보통",
  LOW: "낮음",
};

const COMPETITION_COLOR: Record<CompetitionAnalysis["competitionLevel"], SignalColor> = {
  HIGH: "red",
  MEDIUM: "orange",
  LOW: "green",
};

const QUOTA_DATA_SOURCES: readonly DataSource[] = [
  { name: "고용노동부", dataId: "15002263" },
  { name: "한국산업인력공단", dataId: "AK102" },
];

const COMPETITION_DATA_SOURCES: readonly DataSource[] = [
  { name: "고용노동부", dataId: "15002263" },
];

const DATA_SOURCE_COUNT = new Set(
  [...QUOTA_DATA_SOURCES, ...COMPETITION_DATA_SOURCES].map((s) => s.dataId),
).size;

// ─── Verdict ─────────────────────────────────────────────────────

function deriveVerdict(
  quotaSufficient: boolean,
  competitionLevel: CompetitionAnalysis["competitionLevel"],
): SimulationVerdict {
  if (!quotaSufficient) return "LOW";
  if (competitionLevel === "LOW") return "HIGH";
  return "MEDIUM";
}

// ─── Stats ───────────────────────────────────────────────────────

function buildAllocationStat(quota: QuotaAnalysis): SimStatItem {
  const sufficient = quota.quotaSufficient;
  return {
    label: "배정 가능성",
    value: sufficient ? "높음" : "낮음",
    subText: sufficient ? `쿼터 여유 ${quota.remainingQuota.toLocaleString("ko-KR")}명` : "쿼터 부족",
    color: sufficient ? "green" : "red",
  };
}

function buildCompetitionStat(competition: CompetitionAnalysis): SimStatItem {
  return {
    label: "지역 경쟁도",
    value: COMPETITION_LABEL[competition.competitionLevel],
    subText: `밀집도 상위 ${competition.densityRank}%`,
    color: COMPETITION_COLOR[competition.competitionLevel],
  };
}

const DURATION_MAP = {
  HIGH_H1: "5~7개월",
  HIGH_H2: "4~6개월",
  OTHER_H1: "3~5개월",
  OTHER_H2: "2~4개월",
} as const;

function buildDurationStat(competition: CompetitionAnalysis, desiredTiming: string): SimStatItem {
  const half = desiredTiming.endsWith("H1") ? "H1" : "H2";
  const intensity = competition.competitionLevel === "HIGH" ? "HIGH" : "OTHER";
  const key = `${intensity}_${half}` as keyof typeof DURATION_MAP;

  return {
    label: "예상 소요기간",
    value: DURATION_MAP[key],
    subText: "내국인 구인노력 포함",
    color: intensity === "HIGH" ? "orange" : "blue",
  };
}

// ─── Analysis Sections ───────────────────────────────────────────

function buildQuotaSection(quota: QuotaAnalysis, aiInsight: string): AnalysisSection {
  const sufficient = quota.quotaSufficient;
  return {
    id: "quota",
    icon: "BarChart3",
    title: "쿼터 분석",
    badge: {
      text: sufficient ? "여유" : "부족",
      color: sufficient ? "green" : "red",
    },
    dataRows: [
      { key: "업종별 배정 쿼터", value: `${quota.industryQuota.toLocaleString("ko-KR")}명` },
      { key: "현재 배정 인원", value: `${quota.currentAllocated.toLocaleString("ko-KR")}명` },
      { key: "잔여 쿼터", value: `${quota.remainingQuota.toLocaleString("ko-KR")}명` },
    ],
    progress: {
      label: "소진율",
      value: Math.round(quota.utilizationRate),
      level: quota.utilizationRate >= 80 ? "high" : quota.utilizationRate >= 50 ? "mid" : "low",
    },
    dataSources: QUOTA_DATA_SOURCES,
    aiInsight,
  };
}

function buildCompetitionSection(
  competition: CompetitionAnalysis,
  aiInsight: string,
): AnalysisSection {
  return {
    id: "competition",
    icon: "Factory",
    title: "지역 경쟁도 분석",
    badge: {
      text: COMPETITION_LABEL[competition.competitionLevel],
      color: COMPETITION_COLOR[competition.competitionLevel],
    },
    dataRows: [
      { key: "동일 지역 신청 사업장", value: `${competition.regionApplicants.toLocaleString("ko-KR")}개` },
      { key: "밀집도 순위", value: `상위 ${competition.densityRank}%` },
      { key: "사업장당 평균 신청", value: `${competition.avgApplicationRate}배` },
    ],
    progress: {
      label: "경쟁 강도",
      value: competition.densityRank,
      level:
        competition.densityRank >= 70 ? "high" : competition.densityRank >= 40 ? "mid" : "low",
    },
    dataSources: COMPETITION_DATA_SOURCES,
    aiInsight,
  };
}

// ─── Nationality ─────────────────────────────────────────────────

const TREND_THRESHOLD = 5;

function mapNationality(raw: NationalityAnalysisResult | null): NationalityAnalysis | null {
  if (raw === null || !raw.available) return null;

  const diff = raw.industryShareRate - raw.requestedShareRate;
  const trend: "up" | "down" | "stable" =
    diff > TREND_THRESHOLD ? "up" : diff < -TREND_THRESHOLD ? "down" : "stable";

  return {
    nationality: raw.nationality as Nationality,
    percentage: raw.industryShareRate,
    avgPercentage: raw.requestedShareRate,
    trend,
  };
}

// ─── AI Report Parsing ───────────────────────────────────────────

interface ParsedReport {
  readonly summary: string;
  readonly quotaInsight: string;
  readonly competitionInsight: string;
}

function parseAiReport(aiReport: string): ParsedReport {
  const sections = aiReport.split(/^##\s+/m).filter(Boolean);

  if (sections.length < 2) {
    console.warn(
      `[parseAiReport] Unexpected AI report format: expected >=2 sections, got ${sections.length}. ` +
        `Report preview: "${aiReport.slice(0, 100)}"`,
    );
    const trimmed = aiReport.trim() || "분석 요약을 불러올 수 없습니다";
    return { summary: trimmed, quotaInsight: trimmed, competitionInsight: trimmed };
  }

  const summarySection = sections[0]!;
  const summaryLines = summarySection.split("\n").filter((l) => l.trim());
  const summary = summaryLines.length > 1 ? summaryLines.slice(1).join(" ").trim() : summaryLines[0]?.trim() ?? aiReport.trim();

  const detailSection = sections[1] ?? "";
  const detailText = detailSection.split("\n").filter((l) => l.trim()).slice(1).join(" ").trim();

  return {
    summary,
    quotaInsight: detailText || summary,
    competitionInsight: detailText || summary,
  };
}

// ─── Recommendations ─────────────────────────────────────────────

function buildRecommendations(
  quota: QuotaAnalysis,
  competition: CompetitionAnalysis,
): readonly RecommendationItem[] {
  const items: RecommendationItem[] = [
    {
      text: "내국인 구인노력 의무기간 14일을 우선 이행하세요",
      linkText: "워크넷 바로가기",
      href: "https://www.work.go.kr",
    },
  ];

  if (!quota.quotaSufficient) {
    items.push({
      text: "현재 쿼터가 부족한 상태입니다. 다음 배정 시기를 확인하세요",
    });
  }

  if (competition.competitionLevel === "HIGH") {
    items.push({
      text: "경쟁이 치열한 지역입니다. 서류를 미리 준비하면 처리 기간을 단축할 수 있습니다",
      linkText: "서류 목록 보기",
      href: "/documents",
    });
  } else {
    items.push({
      text: "필요 서류를 미리 준비하면 처리 기간을 단축할 수 있습니다",
      linkText: "서류 목록 보기",
      href: "/documents",
    });
  }

  items.push(
    {
      text: "관할 고용센터에 사전 상담을 신청하세요",
      linkText: "고용센터 찾기",
      href: "https://www.ei.go.kr",
    },
    {
      text: "E-9 비자 발급까지 평균 3~5개월이 소요됩니다",
    },
  );

  return items;
}

// ─── Main Transform ──────────────────────────────────────────────

export function transformSimulationResult(raw: SimulationResultResponse): SimulationResponse {
  const { quotaAnalysis, competitionAnalysis, nationalityAnalysis, aiReport } = raw;
  const verdict = deriveVerdict(quotaAnalysis.quotaSufficient, competitionAnalysis.competitionLevel);
  const parsed = parseAiReport(aiReport);

  return {
    id: raw.id,
    verdict,
    verdictText: VERDICT_TEXT[verdict],
    summary: parsed.summary,
    analyzedAt: raw.createdAt,
    dataSourceCount: DATA_SOURCE_COUNT,
    stats: {
      allocation: buildAllocationStat(quotaAnalysis),
      competition: buildCompetitionStat(competitionAnalysis),
      duration: buildDurationStat(competitionAnalysis, raw.desiredTiming),
    },
    analyses: [
      buildQuotaSection(quotaAnalysis, parsed.quotaInsight),
      buildCompetitionSection(competitionAnalysis, parsed.competitionInsight),
    ],
    nationality: mapNationality(nationalityAnalysis),
    recommendations: buildRecommendations(quotaAnalysis, competitionAnalysis),
  };
}
