import { describe, it, expect, vi } from "vitest";
import {
  registerWorkerRequestSchema,
  updateWorkerRequestSchema,
  createCompanyRequestSchema,
  updateCompanyRequestSchema,
  type Nationality,
  type VisaType,
  NATIONALITIES,
  WORKER_STATUSES,
  INSURANCE_STATUSES,
  DEADLINE_TYPES,
  VISA_TYPES,
  REGIONS,
  INDUSTRY_CATEGORIES,
  resolveWorkerStatusLabel,
  resolveWorkerStatusColor,
  WORKER_STATUS_COLORS,
  resolveWorkerStatusPriority,
  endEmploymentRequestSchema,
  EMPLOYMENT_END_REASONS,
  getKoreaTodayIsoDate,
} from "@/types/api";

function addDays(isoDate: string, days: number): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

describe("registerWorkerRequestSchema", () => {
  it("유효한_요청을_통과시킨다", () => {
    const valid = {
      name: "Nguyen Van A",
      dateOfBirth: "1990-05-15",
      nationality: "VIETNAM" as Nationality,
      visaType: "E9" as VisaType,
      visaExpiryDate: "2026-12-31",
      entryDate: "2024-01-15",
      contractStartDate: "2024-02-01",
      companyId: 1,
    };
    const result = registerWorkerRequestSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("이름이_비어있으면_실패한다", () => {
    const invalid = {
      name: "",
      dateOfBirth: "1990-01-01",
      nationality: "VIETNAM",
      visaType: "E9",
      visaExpiryDate: "2026-12-31",
      entryDate: "2024-01-15",
      contractStartDate: "2024-02-01",
      companyId: 1,
    };
    const result = registerWorkerRequestSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it("잘못된_비자유형이면_실패한다", () => {
    const invalid = {
      name: "Test",
      dateOfBirth: "1990-01-01",
      nationality: "VIETNAM",
      visaType: "INVALID",
      visaExpiryDate: "2026-12-31",
      entryDate: "2024-01-15",
      contractStartDate: "2024-02-01",
      companyId: 1,
    };
    const result = registerWorkerRequestSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it("선택_필드가_없어도_통과한다", () => {
    const valid = {
      name: "Test Worker",
      dateOfBirth: "1990-05-15",
      nationality: "CHINA",
      visaType: "H2",
      visaExpiryDate: "2027-06-30",
      entryDate: "2025-01-01",
      contractStartDate: "2025-02-01",
      companyId: 2,
    };
    const result = registerWorkerRequestSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("날짜_형식이_올바르지_않으면_실패한다", () => {
    const invalid = {
      name: "Test",
      dateOfBirth: "1990-01-01",
      nationality: "VIETNAM",
      visaType: "E9",
      visaExpiryDate: "31-12-2026",
      entryDate: "2024-01-15",
      contractStartDate: "2024-02-01",
      companyId: 1,
    };
    const result = registerWorkerRequestSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it("생년월일이_없으면_실패한다", () => {
    const invalid = {
      name: "Test",
      nationality: "VIETNAM",
      visaType: "E9",
      visaExpiryDate: "2026-12-31",
      entryDate: "2024-01-15",
      contractStartDate: "2024-02-01",
      companyId: 1,
    };
    const result = registerWorkerRequestSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it("생년월일이_유효하면_통과한다", () => {
    const valid = {
      name: "Test",
      dateOfBirth: "1990-01-01",
      nationality: "VIETNAM",
      visaType: "E9",
      visaExpiryDate: "2026-12-31",
      entryDate: "2024-01-15",
      contractStartDate: "2024-02-01",
      companyId: 1,
    };
    const result = registerWorkerRequestSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("생년월일이_미래면_실패한다", () => {
    const invalid = {
      name: "Test",
      dateOfBirth: "2999-01-01",
      nationality: "VIETNAM",
      visaType: "E9",
      visaExpiryDate: "2026-12-31",
      entryDate: "2024-01-15",
      contractStartDate: "2024-02-01",
      companyId: 1,
    };
    const result = registerWorkerRequestSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it("한글_이름이_있어도_등록_요청이_통과한다", () => {
    const valid = {
      name: "Nguyen Van A",
      koreanName: "응우옌 반 아",
      dateOfBirth: "1990-05-15",
      nationality: "VIETNAM" as Nationality,
      visaType: "E9" as VisaType,
      visaExpiryDate: "2026-12-31",
      entryDate: "2024-01-15",
      contractStartDate: "2024-02-01",
      companyId: 1,
    };

    const result = registerWorkerRequestSchema.safeParse(valid);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.koreanName).toBe("응우옌 반 아");
    }
  });
});

describe("updateWorkerRequestSchema", () => {
  it("한글_이름이_있어도_수정_요청이_통과한다", () => {
    const valid = {
      name: "Nguyen Van A",
      koreanName: "응우옌 반 아",
      dateOfBirth: "1990-05-15",
      contactPhone: "",
      contactEmail: "",
      nationality: "VIETNAM" as Nationality,
      visaType: "E9" as VisaType,
      visaExpiryDate: "2026-12-31",
      contractStartDate: "2024-02-01",
      contractEndDate: "",
      jobPosition: "",
    };

    const result = updateWorkerRequestSchema.safeParse(valid);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.koreanName).toBe("응우옌 반 아");
    }
  });

  it("한글_이름이_없어도_수정_요청이_통과한다", () => {
    const valid = {
      name: "Nguyen Van A",
      dateOfBirth: "1990-05-15",
      contactPhone: "",
      contactEmail: "",
      nationality: "VIETNAM" as Nationality,
      visaType: "E9" as VisaType,
      visaExpiryDate: "2026-12-31",
      contractStartDate: "2024-02-01",
      contractEndDate: "",
      jobPosition: "",
    };

    const result = updateWorkerRequestSchema.safeParse(valid);

    expect(result.success).toBe(true);
  });
});

describe("enum 상수", () => {
  it("NATIONALITIES는_26개_값을_가진다", () => {
    expect(NATIONALITIES).toHaveLength(26);
  });

  it("VISA_TYPES는_8개_값을_가진다", () => {
    expect(VISA_TYPES).toHaveLength(8);
  });

  it("WORKER_STATUSES는_4개_값을_가진다", () => {
    expect(WORKER_STATUSES).toHaveLength(4);
    expect(WORKER_STATUSES).toEqual(
      expect.arrayContaining(["UPCOMING", "ACTIVE", "ENDED", "REVIEW_REQUIRED"]),
    );
  });

  it("REGIONS는_17개_값을_가진다", () => {
    expect(REGIONS).toHaveLength(17);
  });

  it("INDUSTRY_CATEGORIES는_9개_값을_가진다", () => {
    expect(INDUSTRY_CATEGORIES).toHaveLength(9);
  });

  it("INSURANCE_STATUSES는_5개_값을_가진다", () => {
    expect(INSURANCE_STATUSES).toHaveLength(5);
  });

  it("DEADLINE_TYPES는_9개_값을_가지고_전용보험_2종을_포함한다", () => {
    expect(DEADLINE_TYPES).toHaveLength(9);
    expect(DEADLINE_TYPES).toContain("HEALTH_INSURANCE_ENROLLMENT");
    expect(DEADLINE_TYPES).toContain("EXIT_GUARANTEE_INSURANCE");
    expect(DEADLINE_TYPES).toContain("WAGE_GUARANTEE_INSURANCE");
  });
});

describe("resolveWorkerStatusLabel", () => {
  it("4가지_정의된_상태에_대한_라벨을_반환한다", () => {
    expect(resolveWorkerStatusLabel("UPCOMING")).toBe("입사 예정");
    expect(resolveWorkerStatusLabel("ACTIVE")).toBe("재직중");
    expect(resolveWorkerStatusLabel("ENDED")).toBe("고용종료");
    expect(resolveWorkerStatusLabel("REVIEW_REQUIRED")).toBe("확인 필요");
  });

  it("알_수_없는_상태는_확인_필요로_폴백하고_console_warn을_호출한다", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(resolveWorkerStatusLabel("MYSTERIOUS")).toBe("확인 필요");
    expect(warn).toHaveBeenCalledOnce();
    warn.mockRestore();
  });

  it("과거_INACTIVE_값도_확인_필요로_폴백한다_BE_FE_동기화_윈도우_방어", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(resolveWorkerStatusLabel("INACTIVE")).toBe("확인 필요");
    warn.mockRestore();
  });
});

describe("resolveWorkerStatusColor", () => {
  it("4가지_정의된_상태에_대한_색상_클래스를_반환한다", () => {
    expect(resolveWorkerStatusColor("UPCOMING")).toBe(WORKER_STATUS_COLORS.UPCOMING);
    expect(resolveWorkerStatusColor("ACTIVE")).toBe(WORKER_STATUS_COLORS.ACTIVE);
    expect(resolveWorkerStatusColor("ENDED")).toBe(WORKER_STATUS_COLORS.ENDED);
    expect(resolveWorkerStatusColor("REVIEW_REQUIRED")).toBe(
      WORKER_STATUS_COLORS.REVIEW_REQUIRED,
    );
  });

  it("알_수_없는_상태는_REVIEW_REQUIRED_색상으로_폴백한다", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    expect(resolveWorkerStatusColor("MYSTERIOUS")).toBe(WORKER_STATUS_COLORS.REVIEW_REQUIRED);
    warn.mockRestore();
  });
});

describe("resolveWorkerStatusPriority", () => {
  it("우선순위는_REVIEW_REQUIRED→UPCOMING→ACTIVE→ENDED_순서다", () => {
    expect(resolveWorkerStatusPriority("REVIEW_REQUIRED")).toBeLessThan(
      resolveWorkerStatusPriority("UPCOMING"),
    );
    expect(resolveWorkerStatusPriority("UPCOMING")).toBeLessThan(
      resolveWorkerStatusPriority("ACTIVE"),
    );
    expect(resolveWorkerStatusPriority("ACTIVE")).toBeLessThan(
      resolveWorkerStatusPriority("ENDED"),
    );
  });

  it("unknown은_REVIEW_REQUIRED보다도_위로_정렬된다", () => {
    expect(resolveWorkerStatusPriority("UNKNOWN")).toBeLessThan(
      resolveWorkerStatusPriority("REVIEW_REQUIRED"),
    );
  });
});

describe("createCompanyRequestSchema", () => {
  const valid = {
    name: "한국전자",
    businessNumber: "123-45-67890",
    region: "SEOUL" as const,
    industryCategory: "MANUFACTURING" as const,
    address: "서울시 강남구 테헤란로 123",
    contactPhone: "02-1234-5678",
  };

  it("필수_필드만으로_통과한다_employeeCount_없이도_OK", () => {
    const result = createCompanyRequestSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("foreignWorkerCount_필드는_더_이상_요구되지_않는다", () => {
    const withForeign = { ...valid, foreignWorkerCount: 5 };
    const result = createCompanyRequestSchema.safeParse(withForeign);
    expect(result.success).toBe(true); // unknown 필드는 무시됨 (Zod 기본 동작)
  });

  it("employeeCount_단독_입력해도_통과한다", () => {
    const withEmployee = { ...valid, employeeCount: 50 };
    const result = createCompanyRequestSchema.safeParse(withEmployee);
    expect(result.success).toBe(true);
  });

  it("domesticInsuredCount가_employeeCount를_초과하면_실패한다", () => {
    const invalid = { ...valid, employeeCount: 50, domesticInsuredCount: 60 };
    const result = createCompanyRequestSchema.safeParse(invalid);
    expect(result.success).toBe(false);
    if (!result.success) {
      const message = result.error.issues[0]?.message ?? "";
      expect(message).toContain("내국인 피보험자 수");
    }
  });

  it("둘_중_하나만_입력되면_refine_검증_생략", () => {
    const onlyDomestic = { ...valid, domesticInsuredCount: 100 };
    const onlyEmployee = { ...valid, employeeCount: 50 };
    expect(createCompanyRequestSchema.safeParse(onlyDomestic).success).toBe(true);
    expect(createCompanyRequestSchema.safeParse(onlyEmployee).success).toBe(true);
  });

  it("회사명_누락시_실패한다", () => {
    const invalid = { ...valid, name: "" };
    const result = createCompanyRequestSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it("사업자번호_형식이_틀리면_실패한다", () => {
    const invalid = { ...valid, businessNumber: "12345" };
    const result = createCompanyRequestSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });
});

describe("updateCompanyRequestSchema", () => {
  const valid = {
    name: "한국전자",
    region: "SEOUL" as const,
    industryCategory: "MANUFACTURING" as const,
    address: "서울시 강남구 테헤란로 123",
    contactPhone: "02-1234-5678",
  };

  it("businessNumber_없이_통과한다_update는_사업자번호_제외", () => {
    const result = updateCompanyRequestSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("foreignWorkerCount_필드는_요구되지_않는다", () => {
    const withForeign = { ...valid, foreignWorkerCount: 5 };
    expect(updateCompanyRequestSchema.safeParse(withForeign).success).toBe(true);
  });

  it("domesticInsuredCount가_employeeCount를_초과하면_실패한다", () => {
    const invalid = { ...valid, employeeCount: 50, domesticInsuredCount: 60 };
    const result = updateCompanyRequestSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });
});

describe("endEmploymentRequestSchema", () => {
  it("필수_필드만으로_통과한다", () => {
    expect(
      endEmploymentRequestSchema.safeParse({ endedAt: "2026-05-01", reason: "CONTRACT_EXPIRY" }).success,
    ).toBe(true);
  });

  it("WORKPLACE_CHANGE_사유_시_employerFault_undefined면_실패", () => {
    const result = endEmploymentRequestSchema.safeParse({
      endedAt: "2026-05-01",
      reason: "WORKPLACE_CHANGE",
    });
    expect(result.success).toBe(false);
  });

  it("WORKPLACE_CHANGE_사유_시_employerFault_null도_허용한다", () => {
    expect(
      endEmploymentRequestSchema.safeParse({
        endedAt: "2026-05-01",
        reason: "WORKPLACE_CHANGE",
        employerFault: null,
      }).success,
    ).toBe(true);
  });

  it("WORKPLACE_CHANGE_사유_시_employerFault_true_OK", () => {
    expect(
      endEmploymentRequestSchema.safeParse({
        endedAt: "2026-05-01",
        reason: "WORKPLACE_CHANGE",
        employerFault: true,
      }).success,
    ).toBe(true);
  });

  it("memo_500자_초과_시_실패한다", () => {
    expect(
      endEmploymentRequestSchema.safeParse({
        endedAt: "2026-05-01",
        reason: "OTHER",
        memo: "x".repeat(501),
      }).success,
    ).toBe(false);
  });

  it("잘못된_날짜_형식_실패한다", () => {
    expect(
      endEmploymentRequestSchema.safeParse({ endedAt: "2026/05/01", reason: "OTHER" }).success,
    ).toBe(false);
  });

  it("존재하지_않는_날짜는_실패한다", () => {
    expect(
      endEmploymentRequestSchema.safeParse({ endedAt: "2026-02-31", reason: "OTHER" }).success,
    ).toBe(false);
  });

  it("미래_종료일은_실패한다", () => {
    const tomorrow = addDays(getKoreaTodayIsoDate(), 1);
    expect(
      endEmploymentRequestSchema.safeParse({ endedAt: tomorrow, reason: "OTHER" }).success,
    ).toBe(false);
  });

  it("9가지_사유_모두_유효하다", () => {
    for (const reason of EMPLOYMENT_END_REASONS) {
      const data =
        reason === "WORKPLACE_CHANGE"
          ? { endedAt: "2026-05-01", reason, employerFault: null }
          : { endedAt: "2026-05-01", reason };
      expect(endEmploymentRequestSchema.safeParse(data).success).toBe(true);
    }
  });
});

describe("EMPLOYMENT_END_REASONS 상수", () => {
  it("9개_값을_가진다", () => {
    expect(EMPLOYMENT_END_REASONS).toHaveLength(9);
  });
});
