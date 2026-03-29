import type { MetadataResponse } from "@/types/metadata";
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
};
