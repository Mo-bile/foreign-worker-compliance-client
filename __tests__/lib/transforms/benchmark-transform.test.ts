import { describe, it, expect } from "vitest";
import {
  transformBenchmarkResponse,
  transformBenchmarkList,
} from "@/lib/transforms/benchmark-transform";
import { mockBenchmarkResponse, mockBenchmarkList } from "@/mocks/benchmark-data";

describe("transformBenchmarkResponse", () => {
  it("유효한 데이터를 변환한다", () => {
    const result = transformBenchmarkResponse(mockBenchmarkResponse);
    expect(result.id).toBe(1);
    expect(result.managementScore).toBe(80);
    expect(result.wageAnalysis?.companyAvgWage).toBe(260);
  });

  it("잘못된 데이터에서 에러를 던진다", () => {
    expect(() => transformBenchmarkResponse({})).toThrow();
    expect(() => transformBenchmarkResponse(null)).toThrow();
  });
});

describe("transformBenchmarkList", () => {
  it("배열을 변환한다", () => {
    const result = transformBenchmarkList(mockBenchmarkList);
    expect(result).toHaveLength(3);
    expect(result[0].id).toBe(1);
  });

  it("빈 배열을 처리한다", () => {
    const result = transformBenchmarkList([]);
    expect(result).toEqual([]);
  });

  it("배열이 아닌 입력에서 에러를 던진다", () => {
    expect(() => transformBenchmarkList("not array")).toThrow("Expected array");
    expect(() => transformBenchmarkList(null)).toThrow("Expected array");
  });
});
