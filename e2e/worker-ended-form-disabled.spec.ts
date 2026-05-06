import { expect, test } from "@playwright/test";

test.describe("PR-FE-all: ENDED 워커 폼 disabled", () => {
  test("ENDED_워커의_edit_페이지는_입력과_제출_버튼이_disabled", async ({ page }) => {
    await page.goto("/workers/6/edit");

    await expect(page.getByRole("textbox", { name: "이름", exact: true })).toBeDisabled();
    await expect(page.getByLabel("여권번호")).toBeDisabled();
    await expect(page.getByLabel("계약 종료일")).toBeDisabled();
    await expect(page.getByRole("button", { name: /^수정$/ })).toBeDisabled();
    await expect(page.getByText(/고용종료된 근로자입니다.*복원.*실행/)).toBeVisible();
  });
});
