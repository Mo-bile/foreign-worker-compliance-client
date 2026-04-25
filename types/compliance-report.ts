import { z } from "zod";

const yearMonthRegex = /^\d{4}-(0[1-9]|1[0-2])$/;
const complianceScoreSchema = z.number().min(0).max(100);

export const complianceReportSchema = z.object({
  yearMonth: z.string().regex(yearMonthRegex, "날짜 형식: YYYY-MM"),
  monthlyComplianceScore: complianceScoreSchema,
  breakdown: z.object({
    insurance: complianceScoreSchema,
    deadline: complianceScoreSchema,
  }),
  monthToMonthChange: z.number().nullable(),
  snapshottedAt: z.string(),
});

export type ComplianceReport = z.infer<typeof complianceReportSchema>;
