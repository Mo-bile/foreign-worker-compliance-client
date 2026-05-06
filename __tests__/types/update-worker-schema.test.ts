import { describe, expect, it } from "vitest";
import { updateWorkerRequestSchema } from "@/types/api";

const baseValid = {
  name: "NGUYEN",
  koreanName: "응우옌",
  dateOfBirth: "1995-03-15",
  contactPhone: "010-0000-0000",
  contactEmail: "a@b.com",
  nationality: "VIETNAM" as const,
  visaType: "E9" as const,
  visaExpiryDate: "2027-12-31",
  contractStartDate: "2025-03-01",
  contractEndDate: "",
  jobPosition: "",
  passportNumber: "M12345678",
  registrationNumber: "950315-1234567",
  entryDate: "2024-06-15",
};

describe("updateWorkerRequestSchema", () => {
  it("3필드_정상값을_통과시킨다", () => {
    expect(updateWorkerRequestSchema.safeParse(baseValid).success).toBe(true);
  });

  it("기존_숫자형_registrationNumber도_통과시킨다", () => {
    const result = updateWorkerRequestSchema.safeParse({
      ...baseValid,
      registrationNumber: "12345678901",
    });
    expect(result.success).toBe(true);
  });

  it("registrationNumber가_빈_문자열이면_통과하고_undefined로_정리된다", () => {
    const result = updateWorkerRequestSchema.safeParse({
      ...baseValid,
      registrationNumber: "",
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.registrationNumber).toBeUndefined();
  });

  it("registrationNumber가_정규식과_불일치하면_실패", () => {
    const result = updateWorkerRequestSchema.safeParse({
      ...baseValid,
      registrationNumber: "950315-12345",
    });
    expect(result.success).toBe(false);
  });

  it("entryDate가_ISO_형식이_아니면_실패", () => {
    const result = updateWorkerRequestSchema.safeParse({
      ...baseValid,
      entryDate: "2024/06/15",
    });
    expect(result.success).toBe(false);
  });

  it("passportNumber가_빈_문자열이면_실패", () => {
    const result = updateWorkerRequestSchema.safeParse({
      ...baseValid,
      passportNumber: "",
    });
    expect(result.success).toBe(false);
  });
});
