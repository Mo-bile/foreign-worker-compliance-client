import { describe, it, expect, vi, afterEach } from "vitest";
import { fetchApi, mutateApi, throwResponseError } from "@/lib/queries/query-utils";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

afterEach(() => {
  mockFetch.mockReset();
});

describe("throwResponseError", () => {
  it("JSON_응답의_alertMessage를_message보다_우선한다", async () => {
    const res = new Response(
      JSON.stringify({
        message: "서버 메시지",
        alertMessage: "사용자 안내 메시지",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
    await expect(throwResponseError(res, "fallback")).rejects.toThrow("사용자 안내 메시지");
  });

  it("JSON_응답의_message를_사용한다", async () => {
    const res = new Response(JSON.stringify({ message: "서버 에러" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
    await expect(throwResponseError(res, "fallback")).rejects.toThrow("서버 에러");
  });

  it("non-JSON_응답이면_fallback_메시지를_사용한다", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const res = new Response("<html>Bad Gateway</html>", {
      status: 502,
      headers: { "Content-Type": "text/html" },
    });
    await expect(throwResponseError(res, "데이터 로드 실패")).rejects.toThrow("데이터 로드 실패");
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining("Non-JSON error response"));
    warnSpy.mockRestore();
  });

  it("JSON_응답에_message_필드가_없으면_fallback을_사용한다", async () => {
    const res = new Response(JSON.stringify({ error: "something" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
    await expect(throwResponseError(res, "fallback")).rejects.toThrow("fallback");
  });

  it("에러에_status를_첨부한다", async () => {
    const res = new Response(JSON.stringify({ message: "err" }), { status: 404 });
    try {
      await throwResponseError(res, "fallback");
    } catch (error) {
      expect((error as Error & { status: number }).status).toBe(404);
    }
  });
});

describe("fetchApi", () => {
  it("성공시_JSON_데이터를_반환한다", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([{ id: 1 }]),
    });
    const result = await fetchApi<{ id: number }[]>("/api/test", "에러");
    expect(result).toEqual([{ id: 1 }]);
    expect(mockFetch).toHaveBeenCalledWith("/api/test");
  });

  it("실패시_에러를_던진다", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      headers: new Headers({ "Content-Type": "application/json" }),
      json: () => Promise.resolve({ message: "서버 에러" }),
    });
    await expect(fetchApi("/api/test", "fallback")).rejects.toThrow("서버 에러");
  });

  it("네트워크_에러시_errorMessage를_사용한다", async () => {
    mockFetch.mockRejectedValueOnce(new TypeError("Failed to fetch"));
    await expect(fetchApi("/api/test", "데이터 로드 실패")).rejects.toThrow("데이터 로드 실패");
  });

  it("성공_응답이_non-JSON이면_에러를_던진다", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.reject(new SyntaxError("Unexpected token")),
    });
    await expect(fetchApi("/api/test", "데이터 로드 실패")).rejects.toThrow(
      "데이터 로드 실패 (응답 형식 오류)",
    );
  });
});

describe("mutateApi", () => {
  it("성공시_JSON_데이터를_반환한다", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: 1 }),
    });
    const result = await mutateApi<{ id: number }>("/api/test", "POST", { name: "x" }, "에러");
    expect(result).toEqual({ id: 1 });
    expect(mockFetch).toHaveBeenCalledWith("/api/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "x" }),
    });
  });

  it("PUT_메서드도_지원한다", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: 1 }),
    });
    await mutateApi("/api/test/1", "PUT", { name: "y" }, "에러");
    expect(mockFetch).toHaveBeenCalledWith("/api/test/1", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "y" }),
    });
  });

  it("실패시_에러를_던진다", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      headers: new Headers({ "Content-Type": "application/json" }),
      json: () => Promise.resolve({ message: "잘못된 입력" }),
    });
    await expect(mutateApi("/api/test", "POST", {}, "fallback")).rejects.toThrow("잘못된 입력");
  });

  it("네트워크_에러시_errorMessage를_사용한다", async () => {
    mockFetch.mockRejectedValueOnce(new TypeError("Failed to fetch"));
    await expect(mutateApi("/api/test", "POST", {}, "저장 실패")).rejects.toThrow("저장 실패");
  });
});
