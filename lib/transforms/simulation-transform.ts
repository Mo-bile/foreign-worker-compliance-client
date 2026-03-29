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

// ─── AI Report Parsing ───────────────────────────────────────────

interface ParsedReport {
  readonly summary: string;
  readonly quotaInsight: string;
  readonly competitionInsight: string;
}

function parseAiReport(aiReport: string): ParsedReport {
  const sections = aiReport.split(/^#{2,3}\s+/m).filter(Boolean);

  if (sections.length < 2) {
    console.warn(
      `[parseAiReport] Unexpected AI report format: expected >=2 sections, got ${sections.length}. ` +
        `Report preview: "${aiReport.slice(0, 100)}"`,
    );
    const trimmed = aiReport.trim() || "분석 요약을 불러올 수 없습니다";
    return { summary: trimmed, quotaInsight: trimmed, competitionInsight: trimmed };
  }

  const firstContent = sections[0]!;
  const contentLines = firstContent
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  const summary =
    contentLines.length > 0 ? contentLines.join(" ") : aiReport.trim();

  const quotaSection = sections.find((s) => s.match(/쿼터|소진율|배정/));
  const competitionSection = sections.find((s) => s.match(/경쟁|지역|점유/));

  const extractContent = (section: string | undefined): string => {
    if (!section) return summary;
    const lines = section
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    return lines.slice(1).join(" ") || lines[0] || summary;
  };

  return {
    summary,
    quotaInsight: extractContent(quotaSection),
    competitionInsight: extractContent(competitionSection),
  };
}

// ─── Recommendations ─────────────────────────────────────────────

function buildRecommendations(
  quota: QuotaAnalysis,
  level: CompetitionLevel,
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

  if (level === "HIGH") {
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
  const level = normalizeCompetitionLevel(competitionAnalysis.competitionLevel);
  const verdict = deriveVerdict(quotaAnalysis.quotaSufficient, level);
  const parsed = parseAiReport(aiReport);

  return {
    id: String(raw.id),
    verdict,
    verdictText: VERDICT_TEXT[verdict],
    summary: parsed.summary,
    analyzedAt: raw.createdAt,
    dataSourceCount: DATA_SOURCE_COUNT,
    stats: {
      allocation: buildAllocationStat(quotaAnalysis),
      competition: buildCompetitionStat(competitionAnalysis, level),
      duration: buildDurationStat(level, raw.desiredTiming),
    },
    analyses: [
      buildQuotaSection(quotaAnalysis, parsed.quotaInsight),
      buildCompetitionSection(competitionAnalysis, level, parsed.competitionInsight),
    ],
    nationality: mapNationality(nationalityAnalysis),
    recommendations: buildRecommendations(quotaAnalysis, level),
  };
}
