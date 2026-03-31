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
  readonly label: string;
  readonly score: number;
  readonly isDeduction: boolean;
}

export interface MetadataResponse {
  readonly nationalities: readonly NationalityItem[];
  readonly regions: readonly RegionItem[];
  readonly industryCategories: readonly IndustryCategoryItem[];
  readonly visaTypes: readonly VisaTypeItem[];
  readonly scoringPolicies: readonly ScoringPolicyItem[];
}
