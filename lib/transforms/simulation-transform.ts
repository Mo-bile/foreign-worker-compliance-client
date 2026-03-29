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
  AiInsightsResponse,
  SignalColor,
} from "@/types/simulator";
import type { Nationality } from "@/types/api";
import type { DataSource } from "@/types/shared";

// ─── Constants ───────────────────────────────────────────────────

type CompetitionLevel = "HIGH" | "MEDIUM" | "LOW";

const VERDICT_TEXT: Record<SimulationVerdict, string> = {
  HIGH: "높음",
  MEDIUM: "보통",
  LOW: "낮음",
};

const COMPETITION_LABEL: Record<CompetitionLevel, string> = {
  HIGH: "치열",
  MEDIUM: "보통",
  LOW: "낮음",
};

const COMPETITION_COLOR: Record<CompetitionLevel, SignalColor> = {
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

const DURATION_MAP = {
  HIGH_H1: "5~7개월",
  HIGH_H2: "4~6개월",
  OTHER_H1: "3~5개월",
  OTHER_H2: "2~4개월",
} as const;

// ─── Helpers ─────────────────────────────────────────────────────

function normalizeCompetitionLevel(level: string): CompetitionLevel {
  const upper = level.toUpperCase();
  if (upper === "HIGH" || upper === "MEDIUM" || upper === "LOW") return upper;
  return "MEDIUM";
}

// ─── Verdict ─────────────────────────────────────────────────────

function deriveVerdict(
  quotaSufficient: boolean,
  competitionLevel: CompetitionLevel,
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
    subText: sufficient
      ? `쿼터 여유 ${quota.remainingQuota.toLocaleString("ko-KR")}명`
      : "쿼터 부족",
    color: sufficient ? "green" : "red",
  };
}

function buildCompetitionStat(
  competition: CompetitionAnalysis,
  level: CompetitionLevel,
): SimStatItem {
  const sharePercent = Math.round(competition.regionalShare * 100);
  return {
    label: "지역 경쟁도",
    value: COMPETITION_LABEL[level],
    subText: `지역 점유율 ${sharePercent}%`,
    color: COMPETITION_COLOR[level],
  };
}

function buildDurationStat(level: CompetitionLevel, desiredTiming: string): SimStatItem {
  const half = desiredTiming.endsWith("H1") ? "H1" : "H2";
  const intensity = level === "HIGH" ? "HIGH" : "OTHER";
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
      { key: "업종별 배정 쿼터", value: `${quota.annualQuota.toLocaleString("ko-KR")}명` },
      { key: "현재 배정 인원", value: `${quota.currentWorkerCount.toLocaleString("ko-KR")}명` },
      { key: "잔여 쿼터", value: `${quota.remainingQuota.toLocaleString("ko-KR")}명` },
    ],
    progress: {
      label: "소진율",
      value: Math.round(quota.exhaustionRate),
      level: quota.exhaustionRate >= 80 ? "high" : quota.exhaustionRate >= 50 ? "mid" : "low",
    },
    dataSources: QUOTA_DATA_SOURCES,
    aiInsight,
  };
}

function buildCompetitionSection(
  competition: CompetitionAnalysis,
  level: CompetitionLevel,
  aiInsight: string,
): AnalysisSection {
  const sharePercent = Math.round(competition.regionalShare * 100);
  return {
    id: "competition",
    icon: "Factory",
    title: "지역 경쟁도 분석",
    badge: {
      text: COMPETITION_LABEL[level],
      color: COMPETITION_COLOR[level],
    },
    dataRows: [
      {
        key: "지역 외국인 근로자",
        value: `${competition.regionalWorkerCount.toLocaleString("ko-KR")}명`,
      },
      {
        key: "전국 외국인 근로자",
        value: `${competition.nationalWorkerCount.toLocaleString("ko-KR")}명`,
      },
      { key: "지역 점유율", value: `${sharePercent}%` },
    ],
    progress: {
      label: "경쟁 강도",
      value: sharePercent,
      level: sharePercent >= 70 ? "high" : sharePercent >= 40 ? "mid" : "low",
    },
    dataSources: COMPETITION_DATA_SOURCES,
    aiInsight,
  };
}

// ─── Nationality ─────────────────────────────────────────────────

const AVG_INDUSTRY_SHARE = 10;

function mapNationality(raw: NationalityAnalysisResult | null): NationalityAnalysis | null {
  if (raw === null) return null;

  const diff = raw.industryShareRate - AVG_INDUSTRY_SHARE;
  const trend: "up" | "down" | "stable" =
    diff > 5 ? "up" : diff < -5 ? "down" : "stable";

  return {
    nationality: raw.nationality as Nationality,
    percentage: raw.industryShareRate,
    avgPercentage: AVG_INDUSTRY_SHARE,
    trend,
  };
}

// ─── Recommendations ─────────────────────────────────────────────

function buildRecommendations(
  insights: AiInsightsResponse,
): readonly RecommendationItem[] {
  const items: RecommendationItem[] = insights.actionItems.map((text) => ({ text }));

  if (items.length === 0) {
    items.push({
      text: "내국인 구인노력 의무기간 14일을 우선 이행하세요",
      linkText: "워크넷 바로가기",
      href: "https://www.work.go.kr",
    });
  }

  return items;
}

// ─── Main Transform ──────────────────────────────────────────────

export function transformSimulationResult(raw: SimulationResultResponse): SimulationResponse {
  const { quotaAnalysis, competitionAnalysis, nationalityAnalysis, aiInsights } = raw;
  const level = normalizeCompetitionLevel(competitionAnalysis.competitionLevel);
  const verdict = deriveVerdict(quotaAnalysis.quotaSufficient, level);

  return {
    id: String(raw.id),
    verdict,
    verdictText: VERDICT_TEXT[verdict],
    summary: aiInsights.overallVerdict,
    analyzedAt: raw.createdAt,
    dataSourceCount: DATA_SOURCE_COUNT,
    stats: {
      allocation: buildAllocationStat(quotaAnalysis),
      competition: buildCompetitionStat(competitionAnalysis, level),
      duration: buildDurationStat(level, raw.desiredTiming),
    },
    analyses: [
      buildQuotaSection(quotaAnalysis, aiInsights.quotaInsight),
      buildCompetitionSection(competitionAnalysis, level, aiInsights.competitionInsight),
    ],
    nationality: mapNationality(nationalityAnalysis),
    recommendations: buildRecommendations(aiInsights),
  };
}
