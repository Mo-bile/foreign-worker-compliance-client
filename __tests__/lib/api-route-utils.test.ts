import { describe, it, expect, vi } from "vitest";
import { NextResponse } from "next/server";
import { z } from "zod";
import { handleRouteError, parseRequestBody, validateSchema } from "@/lib/api-route-utils";
import { ApiError } from "@/lib/api-client";

describe("handleRouteError", () => {
  it("ApiError이면_해당_status와_message를_반환한다", () => {
    const error = new ApiError(404, "Not Found", "사업장을 찾을 수 없습니다");
    const res = handleRouteError(error, "GET /api/companies/1");
    expect(res.status).toBe(404);
  });

  it("일반_에러이면_500과_기본_메시지를_반환한다", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const res = handleRouteError(new Error("unknown"), "GET /api/workers");
    expect(res.status).toBe(500);
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
    expect((result as NextResponse).status).toBe(400);
  });
});

describe("validateSchema", () => {
  const schema = z.object({ name: z.string().min(1, "이름은 필수입니다") });

  it("유효한_데이터면_data를_반환한다", () => {
    const result = validateSchema(schema, { name: "test" });
    expect(result).not.toBeInstanceOf(NextResponse);
    expect((result as { data: { name: string } }).data).toEqual({ name: "test" });
  });

  it("유효하지_않은_데이터면_400_NextResponse를_반환한다", () => {
    const result = validateSchema(schema, { name: "" });
    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(400);
  });
});
