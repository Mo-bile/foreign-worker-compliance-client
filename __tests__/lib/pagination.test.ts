import { describe, it, expect } from "vitest";
import { paginateItems, DEFAULT_PAGE_SIZE } from "@/lib/pagination";

describe("paginateItems", () => {
  const items = Array.from({ length: 55 }, (_, i) => ({ id: i + 1 }));

  it("첫_페이지_20건을_반환한다", () => {
    const result = paginateItems(items, 1);
    expect(result.items).toHaveLength(20);
    expect(result.items[0]).toEqual({ id: 1 });
    expect(result.items[19]).toEqual({ id: 20 });
    expect(result.totalItems).toBe(55);
    expect(result.totalPages).toBe(3);
    expect(result.currentPage).toBe(1);
    expect(result.pageSize).toBe(20);
  });

  it("마지막_페이지_나머지_항목을_반환한다", () => {
    const result = paginateItems(items, 3);
    expect(result.items).toHaveLength(15);
    expect(result.items[0]).toEqual({ id: 41 });
    expect(result.currentPage).toBe(3);
  });

  it("빈_배열이면_빈_결과를_반환한다", () => {
    const result = paginateItems([], 1);
    expect(result.items).toHaveLength(0);
    expect(result.totalItems).toBe(0);
    expect(result.totalPages).toBe(0);
    expect(result.currentPage).toBe(1);
  });

  it("페이지가_범위를_초과하면_마지막_유효_페이지로_클램핑한다", () => {
    const result = paginateItems(items, 99);
    expect(result.currentPage).toBe(3);
    expect(result.items).toHaveLength(15);
  });

  it("페이지가_1_미만이면_1로_클램핑한다", () => {
    const result = paginateItems(items, 0);
    expect(result.currentPage).toBe(1);
    expect(result.items[0]).toEqual({ id: 1 });
  });

  it("커스텀_pageSize를_사용한다", () => {
    const result = paginateItems(items, 1, 10);
    expect(result.items).toHaveLength(10);
    expect(result.totalPages).toBe(6);
    expect(result.pageSize).toBe(10);
  });

  it("DEFAULT_PAGE_SIZE는_20이다", () => {
    expect(DEFAULT_PAGE_SIZE).toBe(20);
  });
});
