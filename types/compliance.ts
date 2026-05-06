import { z } from "zod";
import type { DeadlineType } from "./api";

const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;
const isoDate = z.string().regex(isoDateRegex, "날짜 형식: YYYY-MM-DD");
const optionalEvidenceUrl = z
  .union([z.string().url("올바른 URL 형식이 아닙니다").max(512, "URL은 512자 이내"), z.literal("")])
  .optional()
  .transform((v) => v || undefined);

export const completeDeadlinePayloadSchema = z
  .object({
    completedAt: isoDate,
    nextDueDate: isoDate.optional(),
    renewedUntil: isoDate.optional(),
    referenceNumber: z.string().max(64, "증권번호는 64자 이내").optional(),
    evidenceUrl: optionalEvidenceUrl,
    note: z.string().max(1000, "메모는 1000자 이내").optional(),
  })
  .refine((d) => !d.nextDueDate || d.nextDueDate >= d.completedAt, {
    message: "다음 기한은 완료일 이후여야 합니다",
    path: ["nextDueDate"],
  })
  .refine((d) => !d.renewedUntil || d.renewedUntil >= d.completedAt, {
    message: "갱신 만료일은 완료일 이후여야 합니다",
    path: ["renewedUntil"],
  });

export interface CompleteDeadlinePayload {
  readonly completedAt: string;
  readonly nextDueDate?: string;
  readonly renewedUntil?: string;
  readonly referenceNumber?: string;
  readonly evidenceUrl?: string;
  readonly note?: string;
}

export type CompletionFieldKey =
  | "completedAt"
  | "nextDueDate"
  | "renewedUntil"
  | "referenceNumber"
  | "evidenceUrl"
  | "note";

export const DEADLINE_COMPLETION_FIELDS: Record<DeadlineType, readonly CompletionFieldKey[]> = {
  VISA_EXPIRY: ["completedAt", "nextDueDate", "note"],
  NATIONAL_PENSION_ENROLLMENT: ["completedAt", "referenceNumber", "note"],
  HEALTH_INSURANCE_ENROLLMENT: ["completedAt", "referenceNumber", "note"],
  EMPLOYMENT_INSURANCE_ENROLLMENT: ["completedAt", "referenceNumber", "note"],
  INDUSTRIAL_ACCIDENT_ENROLLMENT: ["completedAt", "referenceNumber", "note"],
  CHANGE_REPORT: ["completedAt", "note"],
  CONTRACT_RENEWAL: ["completedAt", "nextDueDate", "note"],
  EXIT_GUARANTEE_INSURANCE: [
    "completedAt",
    "referenceNumber",
    "renewedUntil",
    "evidenceUrl",
    "note",
  ],
  WAGE_GUARANTEE_INSURANCE: [
    "completedAt",
    "referenceNumber",
    "renewedUntil",
    "evidenceUrl",
    "note",
  ],
};

export interface CompleteDeadlineSummaryResponse {
  readonly deadlineId: number;
  readonly completedAt: string;
  readonly nextDeadlineId: number | null;
  readonly nextDeadlineDueDate: string | null;
  readonly nextDeadlineType: DeadlineType | null;
}

export const NEXT_DUE_DATE_LABEL: Partial<Record<DeadlineType, string>> = {
  VISA_EXPIRY: "새 비자 만료일",
  CONTRACT_RENEWAL: "새 계약 종료일",
};
