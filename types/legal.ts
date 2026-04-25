import { z } from "zod";

export const LEGAL_CATEGORIES = [
  "IMMIGRATION",
  "LABOR",
  "WAGE_RETIREMENT",
  "SAFETY",
  "INSURANCE",
] as const;

export const LEGAL_CHANGE_TYPES = ["AMENDMENT", "ENFORCEMENT"] as const;

export const IMPACT_LEVELS = ["HIGH", "MEDIUM", "LOW"] as const;

export const legalCategorySchema = z.enum(LEGAL_CATEGORIES);

export const legalChangeTypeSchema = z.enum(LEGAL_CHANGE_TYPES);

export const impactLevelSchema = z.enum(IMPACT_LEVELS);

export const legalChangeSchema = z.object({
  id: z.number(),
  title: z.string(),
  lawName: z.string(),
  category: legalCategorySchema,
  categoryName: z.string(),
  changeType: legalChangeTypeSchema,
  changeTypeName: z.string(),
  effectiveDate: z.string(),
  summary: z.string(),
  acknowledged: z.boolean().optional().default(false),
});

export const legalChangesResponseSchema = z.array(legalChangeSchema);

export const legalImpactSchema = z.object({
  level: impactLevelSchema,
  actions: z.array(z.string()),
  description: z.string(),
});

export type LegalCategory = z.infer<typeof legalCategorySchema>;
export type LegalChangeType = z.infer<typeof legalChangeTypeSchema>;
export type ImpactLevel = z.infer<typeof impactLevelSchema>;
export type LegalChange = z.infer<typeof legalChangeSchema>;
export type LegalChangesResponse = z.infer<typeof legalChangesResponseSchema>;
export type LegalImpact = z.infer<typeof legalImpactSchema>;
