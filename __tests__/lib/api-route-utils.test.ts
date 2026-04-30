import { describe, it, expect, vi } from "vitest";
import { NextResponse } from "next/server";
import { z } from "zod";
import { handleRouteError, parseRequestBody, validateSchema } from "@/lib/api-route-utils";
import { ApiError } from "@/lib/api-client";
import { ERROR_MESSAGES } from "@/lib/constants/error-messages";

describe("handleRouteError", () => {
  it("ApiError이면_해당_status와_message를_반환한다", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const error = new ApiError(404, "Not Found", "사업장을 찾을 수 없습니다");
    const res = handleRouteError(error, "GET /api/companies/1");
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.message).toBe("사업장을 찾을 수 없습니다");
    warnSpy.mockRestore();
  });

  it("ApiError의_alertMessage를_응답에_포함한다", async () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const error = new ApiError(
      500,
      "Internal Server Error",
      "사용자 안내 메시지",
      "사용자 안내 메시지",
      "서버 내부 오류",
    );
    const res = handleRouteError(error, "GET /api/test");
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json).toMatchObject({
      message: "서버 내부 오류",
      alertMessage: "사용자 안내 메시지",
    });
    errorSpy.mockRestore();
  });

  it("ApiError_5xx이면_console.error로_로깅한다", () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const error = new ApiError(502, "Bad Gateway", "백엔드 에러");
    handleRouteError(error, "GET /api/test");
    expect(errorSpy).toHaveBeenCalledWith(expect.stringContaining("Backend error: 502"));
    errorSpy.mockRestore();
  });

  it("ApiError_4xx이면_console.warn으로_로깅한다", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const error = new ApiError(400, "Bad Request", "잘못된 요청");
    handleRouteError(error, "POST /api/test");
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("Backend returned 400"));
    warnSpy.mockRestore();
  });

  it("일반_에러이면_500과_기본_메시지를_반환한다", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const res = handleRouteError(new Error("unknown"), "GET /api/workers");
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.message).toBe(ERROR_MESSAGES.SERVER_ERROR);
    expect(consoleSpy).toHaveBeenCalledWith(
      "[GET /api/workers] Unexpected error:",
      expect.any(Error),
    );
    consoleSpy.mockRestore();
  });
});

describe("parseRequestBody", () => {
  it("유효한_JSON이면_data를_반환한다", async () => {
    const body = JSON.stringify({ name: "test" });
    const request = new Request("http://localhost", {
      method: "POST",
      body,
      headers: { "Content-Type": "application/json" },
    });
    const result = await parseRequestBody(request);
    expect(result).not.toBeInstanceOf(NextResponse);
    expect((result as { data: unknown }).data).toEqual({ name: "test" });
  });

  it("JSON_파싱_실패시_400_NextResponse를_반환한다", async () => {
    const request = new Request("http://localhost", {
      method: "POST",
      body: "not json",
    });
    const result = await parseRequestBody(request);
    expect(result).toBeInstanceOf(NextResponse);
    const res = result as NextResponse;
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.message).toBe(ERROR_MESSAGES.INVALID_REQUEST_FORMAT);
  });
});

describe("validateSchema", () => {
  const schema = z.object({ name: z.string().min(1, "이름은 필수입니다") });

  it("유효한_데이터면_data를_반환한다", () => {
    const result = validateSchema(schema, { name: "test" });
    expect(result).not.toBeInstanceOf(NextResponse);
    expect((result as { data: { name: string } }).data).toEqual({ name: "test" });
  });

  it("유효하지_않은_데이터면_400과_에러_메시지를_반환한다", async () => {
    const result = validateSchema(schema, { name: "" });
    expect(result).toBeInstanceOf(NextResponse);
    const res = result as NextResponse;
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.message).toBe("이름은 필수입니다");
  });
});
