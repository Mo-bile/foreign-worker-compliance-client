import { expect, test } from "@playwright/test";

test.describe("PR-FE-all: 워커 상세 완료 이력 탭", () => {
  test("데드라인_완료_후_워커_상세_완료_이력_탭에_즉시_표시된다", async ({ page }) => {
    await page.goto("/deadlines");

    const workerGroup = page.getByRole("button", { name: /Nguyen Van A.*임박/ });
    if ((await workerGroup.getAttribute("aria-expanded")) !== "true") {
      await workerGroup.click();
    }
    const targetRow = page.getByRole("row").filter({ hasText: "임금체불보증보험" }).first();
    await targetRow.getByRole("button", { name: "완료" }).click();
    await page.getByLabel("완료일").fill("2026-05-06");
    await page.getByLabel("증권번호").fill("HISTORY-E2E");
    await page.getByLabel("갱신 만료일").fill("2027-05-06");
    await page.getByRole("button", { name: "완료" }).click();
    await expect(page.getByText(/완료 처리되었습니다/)).toBeVisible();

    await page.goto("/workers/1");
    await page.getByRole("tab", { name: "완료 이력" }).click();

    await expect(page.getByText("HISTORY-E2E")).toBeVisible();
  });
});
