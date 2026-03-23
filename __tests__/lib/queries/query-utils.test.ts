import { describe, it, expect, vi, afterEach } from "vitest";
import { fetchApi, mutateApi } from "@/lib/queries/query-utils";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

afterEach(() => {
  mockFetch.mockReset();
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
      json: () => Promise.resolve({ message: "서버 에러" }),
    });
    await expect(fetchApi("/api/test", "fallback")).rejects.toThrow("서버 에러");
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

  it("실패시_에러를_던진다", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ message: "잘못된 입력" }),
    });
    await expect(mutateApi("/api/test", "POST", {}, "fallback")).rejects.toThrow("잘못된 입력");
  });
});
