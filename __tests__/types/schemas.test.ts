import { describe, it, expect } from "vitest";
import {
  registerWorkerRequestSchema,
  type Nationality,
  type VisaType,
  NATIONALITIES,
  INSURANCE_STATUSES,
  DEADLINE_TYPES,
  VISA_TYPES,
  REGIONS,
  INDUSTRY_CATEGORIES,
} from "@/types/api";

describe("registerWorkerRequestSchema", () => {
  it("유효한_요청을_통과시킨다", () => {
    const valid = {
      name: "Nguyen Van A",
      dateOfBirth: "1990-05-15",
      nationalityCode: "VIETNAM" as Nationality,
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
      nationalityCode: "VIETNAM",
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
      nationalityCode: "VIETNAM",
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
      nationalityCode: "CHINA",
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
      nationalityCode: "VIETNAM",
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
      nationalityCode: "VIETNAM",
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
      nationalityCode: "VIETNAM",
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
      nationalityCode: "VIETNAM",
      visaType: "E9",
      visaExpiryDate: "2026-12-31",
      entryDate: "2024-01-15",
      contractStartDate: "2024-02-01",
      companyId: 1,
    };
    const result = registerWorkerRequestSchema.safeParse(invalid);
    expect(result.success).toBe(false);
  });
});

describe("enum 상수", () => {
  it("NATIONALITIES는_26개_값을_가진다", () => {
    expect(NATIONALITIES).toHaveLength(26);
  });

  it("VISA_TYPES는_8개_값을_가진다", () => {
    expect(VISA_TYPES).toHaveLength(8);
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

  it("DEADLINE_TYPES는_7개_값을_가지고_INSURANCE_ENROLLMENT를_포함하지_않는다", () => {
    expect(DEADLINE_TYPES).toHaveLength(7);
    expect(DEADLINE_TYPES).not.toContain("INSURANCE_ENROLLMENT");
  });
});
