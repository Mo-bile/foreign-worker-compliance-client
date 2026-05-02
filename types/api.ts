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
  "EAST_TIMOR",
  "LAOS",
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
  EAST_TIMOR: "동티모르",
  LAOS: "라오스",
};

// ─── VisaType ─────────────────────────────────────────────
export const VISA_TYPES = ["E9", "E8", "H2", "E7", "E7_4", "F2", "F5", "F6"] as const;
export type VisaType = (typeof VISA_TYPES)[number];

export const VISA_TYPE_LABELS: Record<VisaType, string> = {
  E9: "비전문취업",
  E8: "계절근로",
  H2: "방문취업",
  E7: "특정활동",
  E7_4: "숙련기능",
  F2: "거주",
  F5: "영주",
  F6: "결혼이민",
};

export const VISA_TYPE_SHORT: Record<VisaType, string> = {
  E9: "E-9",
  E8: "E-8",
  H2: "H-2",
  E7: "E-7",
  E7_4: "E-7-4",
  F2: "F-2",
  F5: "F-5",
  F6: "F-6",
};

// ─── DeadlineType / DeadlineStatus ────────────────────────
export const DEADLINE_TYPES = [
  "VISA_EXPIRY",
  "NATIONAL_PENSION_ENROLLMENT",
  "HEALTH_INSURANCE_ENROLLMENT",
  "EMPLOYMENT_INSURANCE_ENROLLMENT",
  "INDUSTRIAL_ACCIDENT_ENROLLMENT",
  "CHANGE_REPORT",
  "CONTRACT_RENEWAL",
  "EXIT_GUARANTEE_INSURANCE",
  "WAGE_GUARANTEE_INSURANCE",
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

// ─── WorkerStatus ────────────────────────────────────────────
export const WORKER_STATUSES = ["ACTIVE", "INACTIVE"] as const;
export type WorkerStatus = (typeof WORKER_STATUSES)[number];

export const WORKER_STATUS_LABELS: Record<WorkerStatus, string> = {
  ACTIVE: "재직중",
  INACTIVE: "퇴사",
};

// ─── Filter Utility Type ─────────────────────────────────────
export type FilterOption<T extends string> = T | "ALL";

// ─── InsuranceStatus ─────────────────────────────────────────
export const INSURANCE_STATUSES = [
  "MANDATORY",
  "FULL_MANDATORY",
  "AUTO_BENEFITS_OPT_IN",
  "OPTIONAL_ON_APPLICATION",
  "EXEMPT",
] as const;
export type InsuranceStatus = (typeof INSURANCE_STATUSES)[number];
export const INSURANCE_STATUS_LABELS: Record<InsuranceStatus, string> = {
  MANDATORY: "의무가입",
  FULL_MANDATORY: "전부 의무적용",
  AUTO_BENEFITS_OPT_IN: "자동가입(급여신청형)",
  OPTIONAL_ON_APPLICATION: "신청시가입",
  EXEMPT: "가입제외",
};

export const INSURANCE_TYPE_LABELS: Record<string, string> = {
  NATIONAL_PENSION: "국민연금",
  HEALTH_INSURANCE: "건강보험",
  EMPLOYMENT_INSURANCE: "고용보험",
  INDUSTRIAL_ACCIDENT: "산재보험",
};

// ─── Region ─────────────────────────────────────────────
export const REGIONS = [
  "SEOUL",
  "BUSAN",
  "DAEGU",
  "INCHEON",
  "GWANGJU",
  "DAEJEON",
  "ULSAN",
  "SEJONG",
  "GYEONGGI",
  "GANGWON",
  "CHUNGBUK",
  "CHUNGNAM",
  "JEONBUK",
  "JEONNAM",
  "GYEONGBUK",
  "GYEONGNAM",
  "JEJU",
] as const;
export type Region = (typeof REGIONS)[number];

export const REGION_LABELS: Record<Region, string> = {
  SEOUL: "서울",
  BUSAN: "부산",
  DAEGU: "대구",
  INCHEON: "인천",
  GWANGJU: "광주",
  DAEJEON: "대전",
  ULSAN: "울산",
  SEJONG: "세종",
  GYEONGGI: "경기",
  GANGWON: "강원",
  CHUNGBUK: "충북",
  CHUNGNAM: "충남",
  JEONBUK: "전북",
  JEONNAM: "전남",
  GYEONGBUK: "경북",
  GYEONGNAM: "경남",
  JEJU: "제주",
};

// ─── IndustryCategory ───────────────────────────────────
export const INDUSTRY_CATEGORIES = [
  "MANUFACTURING",
  "CONSTRUCTION",
  "AGRICULTURE",
  "FISHING",
  "SERVICE",
  "MINING",
  "TRANSPORTATION",
  "ACCOMMODATION",
  "OTHER",
] as const;
export type IndustryCategory = (typeof INDUSTRY_CATEGORIES)[number];

export const INDUSTRY_CATEGORY_LABELS: Record<IndustryCategory, string> = {
  MANUFACTURING: "제조업",
  CONSTRUCTION: "건설업",
  AGRICULTURE: "농업",
  FISHING: "어업",
  SERVICE: "서비스업",
  MINING: "광업",
  TRANSPORTATION: "운수업",
  ACCOMMODATION: "숙박업",
  OTHER: "기타",
};

// ─── Label Maps ──────────────────────────────────────────────
export const DEADLINE_TYPE_LABELS: Record<DeadlineType, string> = {
  VISA_EXPIRY: "비자 만료",
  NATIONAL_PENSION_ENROLLMENT: "국민연금 취득신고",
  HEALTH_INSURANCE_ENROLLMENT: "건강보험 취득신고",
  EMPLOYMENT_INSURANCE_ENROLLMENT: "고용보험 취득신고",
  INDUSTRIAL_ACCIDENT_ENROLLMENT: "산재보험 취득신고",
  CHANGE_REPORT: "고용변동신고 (15일 이내)",
  CONTRACT_RENEWAL: "계약 갱신",
  EXIT_GUARANTEE_INSURANCE: "출국만기보험",
  WAGE_GUARANTEE_INSURANCE: "임금체불보증보험",
};

export const DEADLINE_STATUS_LABELS: Record<DeadlineStatus, string> = {
  PENDING: "대기",
  APPROACHING: "임박",
  URGENT: "긴급",
  OVERDUE: "기한초과",
  COMPLETED: "완료",
};

// ─── Zod Schemas ──────────────────────────────────────────
const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;

// ─── Company Schemas ─────────────────────────────────────
export const companyBaseFields = z.object({
  name: z.string().min(1, "회사명을 입력해주세요"),
  region: z.enum(REGIONS, { error: "지역을 선택해주세요" }),
  subRegion: z.string().optional(),
  industryCategory: z.enum(INDUSTRY_CATEGORIES, { error: "업종을 선택해주세요" }),
  industrySubCategory: z.string().optional(),
  employeeCount: z.number().int().min(1, "1명 이상이어야 합니다"),
  domesticInsuredCount: z.number().int().min(0, "0명 이상이어야 합니다").optional(),
  foreignWorkerCount: z.number().int().min(0, "0명 이상이어야 합니다"),
  address: z.string().min(1, "주소를 입력해주세요"),
  contactPhone: z.string().min(1, "연락처를 입력해주세요"),
  contactEmail: z.string().email("올바른 이메일 형식이 아닙니다").optional().or(z.literal("")),
  averageForeignWorkerWage: z.number().positive("양수를 입력해주세요").optional(),
  recentYearTerminationCount: z.number().int().min(0, "0 이상이어야 합니다").optional(),
});

function refineWorkerCount<
  T extends z.ZodType<{ foreignWorkerCount: number; employeeCount: number }>,
>(schema: T) {
  return schema.refine((d) => d.foreignWorkerCount <= d.employeeCount, {
    message: "외국인 근로자 수는 총 직원 수를 초과할 수 없습니다",
    path: ["foreignWorkerCount"],
  });
}

export const createCompanyRequestSchema = refineWorkerCount(
  companyBaseFields.extend({
    businessNumber: z.string().regex(/^\d{3}-\d{2}-\d{5}$/, "사업자번호 형식: xxx-xx-xxxxx"),
  }),
);

export type CreateCompanyRequest = z.infer<typeof createCompanyRequestSchema>;

export const updateCompanyRequestSchema = refineWorkerCount(companyBaseFields);

export type UpdateCompanyRequest = z.infer<typeof updateCompanyRequestSchema>;

export const suggestWorkerKoreanNameRequestSchema = z.object({
  name: z.string().min(1, "이름을 입력해주세요"),
  nationalityCode: z.enum(NATIONALITIES, { error: "국적을 선택해주세요" }),
});

export type SuggestWorkerKoreanNameRequest = z.infer<
  typeof suggestWorkerKoreanNameRequestSchema
>;

export interface SuggestWorkerKoreanNameResponse {
  readonly koreanName: string;
}

export const registerWorkerRequestSchema = z.object({
  name: z.string().min(1, "이름을 입력해주세요"),
  koreanName: z.string().optional(),
  dateOfBirth: z
    .string()
    .regex(isoDateRegex, "날짜 형식: YYYY-MM-DD")
    .refine((val) => new Date(val) <= new Date(), "미래 날짜는 입력할 수 없습니다"),
  passportNumber: z.string().optional(),
  nationality: z.enum(NATIONALITIES, { error: "국적을 선택해주세요" }),
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
  companyId: z.number().int().positive("사업장을 선택해주세요"),
  contactPhone: z.string().optional(),
  contactEmail: z.string().email("올바른 이메일 형식이 아닙니다").optional().or(z.literal("")),
});

export type RegisterWorkerRequest = z.infer<typeof registerWorkerRequestSchema>;

export const updateWorkerRequestSchema = z
  .object({
    name: z.string().min(1, "이름을 입력해주세요"),
    koreanName: z.string().optional().or(z.literal("")),
    dateOfBirth: z.string().regex(isoDateRegex, "날짜 형식: YYYY-MM-DD"),
    contactPhone: z.string().optional().or(z.literal("")),
    contactEmail: z.string().email("올바른 이메일 형식이 아닙니다").optional().or(z.literal("")),
    nationality: z.enum(NATIONALITIES, { error: "국적을 선택해주세요" }),
    visaType: z.enum(VISA_TYPES, { error: "비자 유형을 선택해주세요" }),
    visaExpiryDate: z.string().regex(isoDateRegex, "날짜 형식: YYYY-MM-DD"),
    contractStartDate: z.string().regex(isoDateRegex, "날짜 형식: YYYY-MM-DD"),
    contractEndDate: z
      .string()
      .regex(isoDateRegex, "날짜 형식: YYYY-MM-DD")
      .optional()
      .or(z.literal("")),
    jobPosition: z.string().optional().or(z.literal("")),
  })
  .refine((d) => !d.contractEndDate || d.contractEndDate >= d.contractStartDate, {
    message: "계약 종료일은 시작일 이후여야 합니다",
    path: ["contractEndDate"],
  });

export type UpdateWorkerRequest = z.infer<typeof updateWorkerRequestSchema>;

// ─── Response Types ───────────────────────────────────────
export interface CompanyResponse {
  readonly id: number;
  readonly name: string;
  readonly businessNumber: string;
  readonly region: Region;
  readonly subRegion: string | null;
  readonly industryCategory: IndustryCategory;
  readonly industrySubCategory: string | null;
  readonly employeeCount: number;
  readonly domesticInsuredCount: number | null;
  readonly foreignWorkerCount: number;
  readonly address: string;
  readonly contactPhone: string;
  readonly contactEmail: string | null;
  readonly averageForeignWorkerWage: number | null;
  readonly recentYearTerminationCount: number | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface InsuranceEligibilityDto {
  readonly insuranceType: string;
  readonly status: InsuranceStatus;
  readonly reason: string;
  readonly note: string | null;
}

export interface WorkerResponse {
  readonly id: number;
  readonly name: string;
  readonly koreanName: string | null;
  readonly nationality: Nationality;
  readonly visaType: VisaType;
  readonly visaExpiryDate: string;
  readonly dateOfBirth: string;
  readonly status: WorkerStatus;
  readonly insuranceDisclaimer: string;
  readonly insuranceEligibilities: readonly InsuranceEligibilityDto[];
  readonly contractStartDate: string;
  readonly contractEndDate: string | null;
  readonly contactPhone: string | null;
  readonly contactEmail: string | null;
  readonly jobPosition: string | null;
  readonly passportNumber: string | null;
  readonly entryDate: string | null;
  readonly registrationNumber: string | null;
  readonly companyId: number;
}

export interface ComplianceDeadlineResponse {
  readonly id: number;
  readonly workerId: number;
  readonly workerName: string;
  readonly deadlineType: DeadlineType;
  readonly dueDate: string;
  readonly status: DeadlineStatus;
  readonly description: string;
}

export interface ErrorResponse {
  readonly status: number;
  readonly error: string;
  readonly message: string;
  readonly alertMessage?: string;
  readonly timestamp: string;
}
