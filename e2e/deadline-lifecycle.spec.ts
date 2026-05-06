import { expect, test } from "@playwright/test";

test.describe("PR-FE-all: 데드라인 lifecycle", () => {
  test("출국만기보험_데드라인_완료_후_다음_cycle이_upcoming_목록에_표시된다", async ({
    page,
  }) => {
    await page.goto("/deadlines");

    const workerGroup = page.getByRole("button", { name: /Nguyen Van A.*임박/ });
    if ((await workerGroup.getAttribute("aria-expanded")) !== "true") {
      await workerGroup.click();
    }
    const targetRow = page.getByRole("row").filter({ hasText: "출국만기보험" }).first();
    await targetRow.getByRole("button", { name: "완료" }).click();

    await page.getByLabel("완료일").fill("2026-05-06");
    await page.getByLabel("증권번호").fill("POL-LIFECYCLE-E2E");
    await page.getByLabel("갱신 만료일").fill("2027-05-06");
    await page.getByRole("button", { name: "완료" }).click();

    await expect(page.getByText(/다음 기한이.*자동 생성/)).toBeVisible();
    if ((await workerGroup.getAttribute("aria-expanded")) !== "true") {
      await workerGroup.click();
    }
    await expect(page.getByText("출국만기보험 (다음 cycle)")).toBeVisible();
  });
});
