import { describe, it, expect } from "vitest";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";

describe("ERROR_MESSAGES", () => {
  it("모든_필수_키가_존재한다", () => {
    expect(ERROR_MESSAGES.SERVER_ERROR).toBe("서버 오류가 발생했습니다");
    expect(ERROR_MESSAGES.INVALID_REQUEST_FORMAT).toBe("잘못된 요청 형식입니다");
    expect(ERROR_MESSAGES.INVALID_INPUT).toBe("입력값이 올바르지 않습니다");
    expect(ERROR_MESSAGES.PAGE_REFRESH_SUFFIX).toBe("페이지를 새로고침해 주세요.");
  });

  it("as_const로_불변이다", () => {
    // @ts-expect-error — readonly check
    ERROR_MESSAGES.SERVER_ERROR = "changed";
  });
});
