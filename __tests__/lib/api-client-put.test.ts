import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import { server } from "@/mocks/server";
import { apiClient } from "@/lib/api-client";

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("apiClient.put", () => {
  it("PUT_요청으로_데이터를_전송한다", async () => {
    const result = await apiClient.put<{ id: number }>("/test/put", { name: "updated" });
    expect(result).toHaveProperty("id", 1);
  });
});
