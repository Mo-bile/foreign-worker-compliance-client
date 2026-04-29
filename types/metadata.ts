export interface NationalityItem {
  readonly code: string;
  readonly koreanName: string;
  readonly socialSecurityAgreement: boolean;
}

export interface RegionItem {
  readonly code: string;
  readonly koreanName: string;
}

export interface IndustryCategoryItem {
  readonly code: string;
  readonly koreanName: string;
}

export interface VisaTypeItem {
  readonly code: string;
  readonly description: string;
}

export interface ScoringPolicyItem {
  readonly code: string;
  readonly displayName: string;
  readonly points: number;
  readonly type: "BONUS" | "DEDUCTION";
  readonly applicableIndustry: string | null;
  readonly mutualExclusionGroup: string | null;
}

export interface ScoringPolicyGroup {
  readonly code: string;
  readonly displayName: string;
}

export interface MetadataResponse {
  readonly nationalities: readonly NationalityItem[];
  readonly regions: readonly RegionItem[];
  readonly industryCategories: readonly IndustryCategoryItem[];
  readonly visaTypes: readonly VisaTypeItem[];
  readonly scoringPolicies: readonly ScoringPolicyItem[];
  readonly scoringPolicyGroups: readonly ScoringPolicyGroup[];
}
