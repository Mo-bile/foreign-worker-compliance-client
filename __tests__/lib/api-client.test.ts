import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import { http, HttpResponse } from "msw";
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

  it("에러_응답의_alertMessage를_message보다_우선한다", async () => {
    server.use(
      http.get("http://localhost:8080/test/alert-message", () =>
        HttpResponse.json(
          {
            status: 500,
            error: "Internal Server Error",
            message: "서버 내부 오류",
            alertMessage: "사용자에게 보여줄 안내 문구",
            timestamp: new Date().toISOString(),
          },
          { status: 500 },
        ),
      ),
    );

    await expect(apiClient.get("/test/alert-message")).rejects.toThrow(
      "사용자에게 보여줄 안내 문구",
    );
    await expect(apiClient.get("/test/alert-message")).rejects.toMatchObject({
      status: 500,
      alertMessage: "사용자에게 보여줄 안내 문구",
      serverMessage: "서버 내부 오류",
    });
  });
});
