import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import { server } from "@/mocks/server";
import { apiClient, ApiError } from "@/lib/api-client";

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("apiClient", () => {
  it("GET_요청으로_JSON을_반환한다", async () => {
    const result = await apiClient.get<{ message: string }>("/test");
    expect(result).toHaveProperty("message", "ok");
  });

  it("POST_요청으로_데이터를_전송한다", async () => {
    const result = await apiClient.post<{ id: number }>("/test", { name: "test" });
    expect(result).toHaveProperty("id");
  });

  it("4xx_응답시_ApiError를_throw한다", async () => {
    await expect(apiClient.get("/test/404")).rejects.toThrow(ApiError);
    await expect(apiClient.get("/test/404")).rejects.toMatchObject({ status: 404 });
  });

  it("5xx_응답시_ApiError를_throw한다", async () => {
    await expect(apiClient.get("/test/500")).rejects.toThrow(ApiError);
    await expect(apiClient.get("/test/500")).rejects.toMatchObject({ status: 500 });
  });
});
