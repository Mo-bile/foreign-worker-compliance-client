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
  {
    code: "DEPOPULATION_AREA",
    displayName: "인구감소지역 소재 사업장",
    points: 5,
    type: "BONUS",
    applicableIndustry: null,
    mutualExclusionGroup: null,
  },
  {
    code: "DORMITORY_AGRICULTURE",
    displayName: "기숙사 제공(농업)",
    points: 20,
    type: "BONUS",
    applicableIndustry: "AGRICULTURE",
    mutualExclusionGroup: null,
  },
  {
    code: "EXCELLENT_DORMITORY",
    displayName: "우수기숙사 설치·운영",
    points: 10,
    type: "BONUS",
    applicableIndustry: null,
    mutualExclusionGroup: null,
  },
  {
    code: "LABOR_LAW_COMPLIANCE",
    displayName: "최근 2년간 노동관계법 위반 없음",
    points: 3,
    type: "BONUS",
    applicableIndustry: null,
    mutualExclusionGroup: null,
  },
  {
    code: "NEW_WORKPLACE",
    displayName: "외국인 고용이 처음인 사업장",
    points: 3,
    type: "BONUS",
    applicableIndustry: null,
    mutualExclusionGroup: null,
  },
  {
    code: "LONG_TENURE_UNDER_1Y",
    displayName: "장기근속 1년 미만",
    points: 3,
    type: "BONUS",
    applicableIndustry: null,
    mutualExclusionGroup: "LONG_TENURE",
  },
  {
    code: "LONG_TENURE_1Y_3Y",
    displayName: "장기근속 1~3년",
    points: 5,
    type: "BONUS",
    applicableIndustry: null,
    mutualExclusionGroup: "LONG_TENURE",
  },
  {
    code: "LONG_TENURE_OVER_3Y",
    displayName: "장기근속 3년 이상",
    points: 10,
    type: "BONUS",
    applicableIndustry: null,
    mutualExclusionGroup: "LONG_TENURE",
  },
  {
    code: "WORKER_DESERTION",
    displayName: "최근 1년 내 외국인 근로자 이탈 발생",
    points: 5,
    type: "DEDUCTION",
    applicableIndustry: null,
    mutualExclusionGroup: null,
  },
  {
    code: "LABOR_LAW_VIOLATION",
    displayName: "최근 2년 내 노동관계법 위반",
    points: 3,
    type: "DEDUCTION",
    applicableIndustry: null,
    mutualExclusionGroup: null,
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
