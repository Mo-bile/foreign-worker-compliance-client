import { z } from "zod";

// ─── Nationality ──────────────────────────────────────────
export const NATIONALITIES = [
  "VIETNAM",
  "PHILIPPINES",
  "INDONESIA",
  "CAMBODIA",
  "MYANMAR",
  "NEPAL",
  "BANGLADESH",
  "PAKISTAN",
  "THAILAND",
  "SRI_LANKA",
  "MONGOLIA",
  "KAZAKHSTAN",
  "KYRGYZSTAN",
  "UZBEKISTAN",
  "TAJIKISTAN",
  "CHINA",
  "USA",
  "CANADA",
  "AUSTRALIA",
  "NEW_ZEALAND",
  "JAPAN",
  "UK",
  "GERMANY",
  "FRANCE",
] as const;

export type Nationality = (typeof NATIONALITIES)[number];

export const NATIONALITY_LABELS: Record<Nationality, string> = {
  VIETNAM: "베트남",
  PHILIPPINES: "필리핀",
  INDONESIA: "인도네시아",
  CAMBODIA: "캄보디아",
  MYANMAR: "미얀마",
  NEPAL: "네팔",
  BANGLADESH: "방글라데시",
  PAKISTAN: "파키스탄",
  THAILAND: "태국",
  SRI_LANKA: "스리랑카",
  MONGOLIA: "몽골",
  KAZAKHSTAN: "카자흐스탄",
  KYRGYZSTAN: "키르기스스탄",
  UZBEKISTAN: "우즈베키스탄",
  TAJIKISTAN: "타지키스탄",
  CHINA: "중국",
  USA: "미국",
  CANADA: "캐나다",
  AUSTRALIA: "호주",
  NEW_ZEALAND: "뉴질랜드",
  JAPAN: "일본",
  UK: "영국",
  GERMANY: "독일",
  FRANCE: "프랑스",
};

// ─── VisaType ─────────────────────────────────────────────
export const VISA_TYPES = ["E9", "E8", "H2", "E7", "E7_4", "F2", "F5", "F6"] as const;
export type VisaType = (typeof VISA_TYPES)[number];

export const VISA_TYPE_LABELS: Record<VisaType, string> = {
  E9: "고용허가제 일반외국인",
  E8: "계절근로자",
  H2: "외국국적동포",
  E7: "전문직",
  E7_4: "숙련기능인력",
  F2: "거주",
  F5: "영주",
  F6: "결혼이민",
};

// ─── DeadlineType / DeadlineStatus ────────────────────────
export const DEADLINE_TYPES = [
  "VISA_EXPIRY",
  "INSURANCE_ENROLLMENT",
  "CHANGE_REPORT",
  "CONTRACT_RENEWAL",
] as const;
export type DeadlineType = (typeof DEADLINE_TYPES)[number];

export const DEADLINE_STATUSES = [
  "PENDING",
  "APPROACHING",
  "URGENT",
  "OVERDUE",
  "COMPLETED",
] as const;
export type DeadlineStatus = (typeof DEADLINE_STATUSES)[number];

// ─── Zod Schemas ──────────────────────────────────────────
const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const registerWorkerRequestSchema = z.object({
  name: z.string().min(1, "이름을 입력해주세요"),
  passportNumber: z.string().optional(),
  nationalityCode: z.enum(NATIONALITIES, { error: "국적을 선택해주세요" }),
  visaType: z.enum(VISA_TYPES, { error: "비자 유형을 선택해주세요" }),
  visaExpiryDate: z.string().regex(isoDateRegex, "날짜 형식: YYYY-MM-DD"),
  entryDate: z.string().regex(isoDateRegex, "날짜 형식: YYYY-MM-DD"),
  registrationNumber: z.string().optional(),
  contractStartDate: z.string().regex(isoDateRegex, "날짜 형식: YYYY-MM-DD"),
  contractEndDate: z
    .string()
    .regex(isoDateRegex, "날짜 형식: YYYY-MM-DD")
    .optional()
    .or(z.literal("")),
  workplaceId: z.number().int().positive("사업장 ID를 입력해주세요"),
  contactPhone: z.string().optional(),
  contactEmail: z.string().email("올바른 이메일 형식이 아닙니다").optional().or(z.literal("")),
});

export type RegisterWorkerRequest = z.infer<typeof registerWorkerRequestSchema>;

// ─── Response Types ───────────────────────────────────────
export interface InsuranceEligibilityDto {
  readonly insuranceType: string;
  readonly status: string;
  readonly reason: string;
}

export interface WorkerResponse {
  readonly id: number;
  readonly name: string;
  readonly nationality: string;
  readonly visaType: string;
  readonly visaExpiryDate: string;
  readonly status: string;
  readonly insuranceEligibilities: readonly InsuranceEligibilityDto[];
}

export interface ComplianceDeadlineResponse {
  readonly id: number;
  readonly workerId: number;
  readonly deadlineType: DeadlineType;
  readonly dueDate: string;
  readonly status: DeadlineStatus;
  readonly description: string;
}

export interface ErrorResponse {
  readonly status: number;
  readonly error: string;
  readonly message: string;
  readonly timestamp: string;
}
