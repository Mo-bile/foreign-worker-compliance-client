import { z } from "zod";
import { signalColorSchema } from "./shared";

export const LEGAL_CATEGORIES = [
  "IMMIGRATION",
  "LABOR",
  "WAGE_RETIREMENT",
  "SAFETY",
  "INSURANCE",
] as const;

export const LEGAL_CHANGE_TYPES = ["AMENDMENT", "ENFORCEMENT"] as const;

export const IMPACT_LEVELS = ["HIGH", "MEDIUM", "LOW"] as const;

export const DISPLAY_STATUSES = [
  "UPCOMING",
  "RECENTLY_EFFECTIVE",
  "IN_FORCE",
  "ARCHIVED",
  "UNVERIFIED",
] as const;

export const SOURCE_TYPES = [
  "LAW",
  "ENFORCEMENT_DECREE",
  "ENFORCEMENT_RULE",
  "NOTICE",
  "POLICY_NOTICE",
  "PRESS_RELEASE",
  "GUIDANCE",
  "CASELAW_RISK",
] as const;

export const legalCategorySchema = z.enum(LEGAL_CATEGORIES);

export const legalChangeTypeSchema = z.enum(LEGAL_CHANGE_TYPES);

export const impactLevelSchema = z.enum(IMPACT_LEVELS);

export const displayStatusSchema = z.enum(DISPLAY_STATUSES);

export const sourceTypeSchema = z.enum(SOURCE_TYPES);

export const legalBadgeSchema = z.object({
  text: z.string(),
  color: signalColorSchema,
});

export const legalActionSchema = z.object({
  label: z.string(),
  primary: z.boolean(),
});

export type LegalBadge = z.infer<typeof legalBadgeSchema>;
export type LegalAction = z.infer<typeof legalActionSchema>;

export const legalChangeSchema = z.object({
  id: z.number(),
  title: z.string(),
  lawName: z.string(),
  category: legalCategorySchema,
  changeType: legalChangeTypeSchema,
  effectiveDate: z.string(),
  summary: z.string(),
  severity: impactLevelSchema,
  acknowledged: z.boolean().nullable(),
  displayStatus: displayStatusSchema,
  sourceType: sourceTypeSchema,
  officialSourceUrl: z.string().url().nullable(),
  icon: z.string(),
  detectedDate: z.string(),
  dDay: z.number().nullable(),
  badge: legalBadgeSchema,
  description: z.string().optional(),
});

export const legalChangesResponseSchema = z.array(legalChangeSchema);

export const legalImpactSchema = z.object({
  level: impactLevelSchema,
  actions: z.array(legalActionSchema),
  description: z.string(),
});

export type LegalCategory = z.infer<typeof legalCategorySchema>;
export type LegalChangeType = z.infer<typeof legalChangeTypeSchema>;
export type ImpactLevel = z.infer<typeof impactLevelSchema>;
export type DisplayStatus = z.infer<typeof displayStatusSchema>;
export type SourceType = z.infer<typeof sourceTypeSchema>;
export type LegalChange = z.infer<typeof legalChangeSchema>;
export type LegalChangesResponse = z.infer<typeof legalChangesResponseSchema>;
export type LegalImpact = z.infer<typeof legalImpactSchema>;
