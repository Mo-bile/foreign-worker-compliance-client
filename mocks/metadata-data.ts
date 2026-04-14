import type { MetadataResponse, ScoringPolicyItem } from "@/types/metadata";
import {
  NATIONALITIES,
  NATIONALITY_LABELS,
  REGIONS,
  REGION_LABELS,
  INDUSTRY_CATEGORIES,
  INDUSTRY_CATEGORY_LABELS,
  VISA_TYPES,
  VISA_TYPE_LABELS,
} from "@/types/api";

export const MOCK_SCORING_POLICIES: readonly ScoringPolicyItem[] = [
  { code: "DEPOPULATION_AREA", label: "인구감소지역 소재 사업장", score: 5, isDeduction: false },
  { code: "PREMIUM_DORMITORY", label: "우수 기숙사 제공", score: 5, isDeduction: false },
  {
    code: "LABOR_LAW_COMPLIANCE",
    label: "최근 2년간 노동관계법 위반 없음",
    score: 3,
    isDeduction: false,
  },
  { code: "NEW_WORKPLACE", label: "외국인 고용이 처음인 사업장", score: 3, isDeduction: false },
  {
    code: "WORKER_DESERTION",
    label: "최근 1년 내 외국인 근로자 이탈 발생",
    score: 5,
    isDeduction: true,
  },
];

export const mockMetadata: MetadataResponse = {
  nationalities: NATIONALITIES.map((code) => ({
    code,
    koreanName: NATIONALITY_LABELS[code],
    socialSecurityAgreement: false,
  })),
  regions: REGIONS.map((code) => ({
    code,
    koreanName: REGION_LABELS[code],
  })),
  industryCategories: INDUSTRY_CATEGORIES.map((code) => ({
    code,
    koreanName: INDUSTRY_CATEGORY_LABELS[code],
  })),
  visaTypes: VISA_TYPES.map((code) => ({
    code,
    description: VISA_TYPE_LABELS[code],
  })),
  scoringPolicies: MOCK_SCORING_POLICIES,
};
