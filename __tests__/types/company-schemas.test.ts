import { describe, it, expect } from "vitest";
import {
  REGIONS,
  REGION_LABELS,
  INDUSTRY_CATEGORIES,
  INDUSTRY_CATEGORY_LABELS,
  createCompanyRequestSchema,
  updateCompanyRequestSchema,
  type Region,
  type IndustryCategory,
} from "@/types/api";

describe("Region enum", () => {
  it("17개_지역을_가진다", () => {
    expect(REGIONS).toHaveLength(17);
  });

  it("모든_지역에_한글_라벨이_있다", () => {
    for (const region of REGIONS) {
      expect(REGION_LABELS[region]).toBeDefined();
      expect(typeof REGION_LABELS[region]).toBe("string");
    }
  });
});

describe("IndustryCategory enum", () => {
  it("8개_업종을_가진다", () => {
    expect(INDUSTRY_CATEGORIES).toHaveLength(8);
  });

  it("모든_업종에_한글_라벨이_있다", () => {
    for (const cat of INDUSTRY_CATEGORIES) {
      expect(INDUSTRY_CATEGORY_LABELS[cat]).toBeDefined();
    }
  });
});

describe("createCompanyRequestSchema", () => {
  const validRequest = {
    name: "테스트 회사",
    businessNumber: "123-45-67890",
    region: "SEOUL" as Region,
    industryCategory: "MANUFACTURING" as IndustryCategory,
    employeeCount: 50,
    foreignWorkerCount: 10,
    address: "서울시 강남구",
    contactPhone: "02-1234-5678",
  };

  it("유효한_요청을_통과시킨다", () => {
    const result = createCompanyRequestSchema.safeParse(validRequest);
    expect(result.success).toBe(true);
  });

  it("사업자번호_형식이_틀리면_실패한다", () => {
    const result = createCompanyRequestSchema.safeParse({
      ...validRequest,
      businessNumber: "12345678",
    });
    expect(result.success).toBe(false);
  });

  it("외국인근로자수가_총직원수를_초과하면_실패한다", () => {
    const result = createCompanyRequestSchema.safeParse({
      ...validRequest,
      employeeCount: 10,
      foreignWorkerCount: 20,
    });
    expect(result.success).toBe(false);
  });

  it("선택필드_없이도_통과한다", () => {
    const result = createCompanyRequestSchema.safeParse(validRequest);
    expect(result.success).toBe(true);
  });

  it("선택필드_포함시에도_통과한다", () => {
    const result = createCompanyRequestSchema.safeParse({
      ...validRequest,
      subRegion: "강남구",
      industrySubCategory: "전자부품",
    });
    expect(result.success).toBe(true);
  });
});

describe("updateCompanyRequestSchema", () => {
  it("businessNumber_없이_통과한다", () => {
    const result = updateCompanyRequestSchema.safeParse({
      name: "수정된 회사",
      region: "BUSAN",
      industryCategory: "CONSTRUCTION",
      employeeCount: 30,
      foreignWorkerCount: 5,
      address: "부산시 해운대구",
      contactPhone: "051-1234-5678",
    });
    expect(result.success).toBe(true);
  });
});
