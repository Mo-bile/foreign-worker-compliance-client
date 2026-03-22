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

// ─── WorkerStatus ────────────────────────────────────────────
export const WORKER_STATUSES = ["ACTIVE", "INACTIVE", "TERMINATED"] as const;
export type WorkerStatus = (typeof WORKER_STATUSES)[number];

export const WORKER_STATUS_LABELS: Record<WorkerStatus, string> = {
  ACTIVE: "활성",
  INACTIVE: "비활성",
  TERMINATED: "퇴사",
};

// ─── Filter Utility Type ─────────────────────────────────────
export type FilterOption<T extends string> = T | "ALL";

// ─── InsuranceStatus ─────────────────────────────────────────
export const INSURANCE_STATUSES = ["의무", "임의", "면제"] as const;
export type InsuranceStatus = (typeof INSURANCE_STATUSES)[number];

// ─── Region ─────────────────────────────────────────────
export const REGIONS = [
  "SEOUL", "BUSAN", "DAEGU", "INCHEON", "GWANGJU", "DAEJEON", "ULSAN", "SEJONG",
  "GYEONGGI", "GANGWON", "CHUNGBUK", "CHUNGNAM", "JEONBUK", "JEONNAM",
  "GYEONGBUK", "GYEONGNAM", "JEJU",
] as const;
export type Region = (typeof REGIONS)[number];

export const REGION_LABELS: Record<Region, string> = {
  SEOUL: "서울", BUSAN: "부산", DAEGU: "대구", INCHEON: "인천",
  GWANGJU: "광주", DAEJEON: "대전", ULSAN: "울산", SEJONG: "세종",
  GYEONGGI: "경기", GANGWON: "강원", CHUNGBUK: "충북", CHUNGNAM: "충남",
  JEONBUK: "전북", JEONNAM: "전남", GYEONGBUK: "경북", GYEONGNAM: "경남",
  JEJU: "제주",
};

// ─── IndustryCategory ───────────────────────────────────
export const INDUSTRY_CATEGORIES = [
  "MANUFACTURING", "CONSTRUCTION", "AGRICULTURE", "FISHING",
  "SERVICE", "MINING", "ACCOMMODATION", "OTHER",
] as const;
export type IndustryCategory = (typeof INDUSTRY_CATEGORIES)[number];

export const INDUSTRY_CATEGORY_LABELS: Record<IndustryCategory, string> = {
  MANUFACTURING: "제조업", CONSTRUCTION: "건설업", AGRICULTURE: "농업",
  FISHING: "어업", SERVICE: "서비스업", MINING: "광업",
  ACCOMMODATION: "숙박업", OTHER: "기타",
};

// ─── Label Maps ──────────────────────────────────────────────
export const DEADLINE_TYPE_LABELS: Record<DeadlineType, string> = {
  VISA_EXPIRY: "비자 만료",
  INSURANCE_ENROLLMENT: "보험 가입",
  CHANGE_REPORT: "변경 신고",
  CONTRACT_RENEWAL: "계약 갱신",
};

export const DEADLINE_STATUS_LABELS: Record<DeadlineStatus, string> = {
  PENDING: "대기",
  APPROACHING: "임박",
  URGENT: "긴급",
  OVERDUE: "초과",
  COMPLETED: "완료",
};

// ─── Zod Schemas ──────────────────────────────────────────
const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;

// ─── Company Schemas ─────────────────────────────────────
export const createCompanyRequestSchema = z.object({
  name: z.string().min(1, "회사명을 입력해주세요"),
  businessNumber: z.string().regex(/^\d{3}-\d{2}-\d{5}$/, "사업자번호 형식: xxx-xx-xxxxx"),
  region: z.enum(REGIONS, { error: "지역을 선택해주세요" }),
  subRegion: z.string().optional(),
  industryCategory: z.enum(INDUSTRY_CATEGORIES, { error: "업종을 선택해주세요" }),
  industrySubCategory: z.string().optional(),
  employeeCount: z.number().int().min(1, "1명 이상이어야 합니다"),
  foreignWorkerCount: z.number().int().min(0, "0명 이상이어야 합니다"),
  address: z.string().min(1, "주소를 입력해주세요"),
  contactPhone: z.string().min(1, "연락처를 입력해주세요"),
}).refine((d) => d.foreignWorkerCount <= d.employeeCount, {
  message: "외국인 근로자 수는 총 직원 수를 초과할 수 없습니다",
  path: ["foreignWorkerCount"],
});

export type CreateCompanyRequest = z.infer<typeof createCompanyRequestSchema>;

export const updateCompanyRequestSchema = z.object({
  name: z.string().min(1, "회사명을 입력해주세요"),
  region: z.enum(REGIONS, { error: "지역을 선택해주세요" }),
  subRegion: z.string().optional(),
  industryCategory: z.enum(INDUSTRY_CATEGORIES, { error: "업종을 선택해주세요" }),
  industrySubCategory: z.string().optional(),
  employeeCount: z.number().int().min(1, "1명 이상이어야 합니다"),
  foreignWorkerCount: z.number().int().min(0, "0명 이상이어야 합니다"),
  address: z.string().min(1, "주소를 입력해주세요"),
  contactPhone: z.string().min(1, "연락처를 입력해주세요"),
}).refine((d) => d.foreignWorkerCount <= d.employeeCount, {
  message: "외국인 근로자 수는 총 직원 수를 초과할 수 없습니다",
  path: ["foreignWorkerCount"],
});

export type UpdateCompanyRequest = z.infer<typeof updateCompanyRequestSchema>;

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
export interface CompanyResponse {
  readonly id: number;
  readonly name: string;
  readonly businessNumber: string;
  readonly region: Region;
  readonly regionName: string;
  readonly subRegion: string | null;
  readonly industryCategory: IndustryCategory;
  readonly industryCategoryName: string;
  readonly industrySubCategory: string | null;
  readonly employeeCount: number;
  readonly foreignWorkerCount: number;
  readonly address: string;
  readonly contactPhone: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface InsuranceEligibilityDto {
  readonly insuranceType: string;
  readonly status: InsuranceStatus;
  readonly reason: string;
}

export interface WorkerResponse {
  readonly id: number;
  readonly name: string;
  readonly nationality: Nationality;
  readonly visaType: VisaType;
  readonly visaExpiryDate: string;
  readonly status: WorkerStatus;
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
