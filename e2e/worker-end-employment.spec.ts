import { test, expect } from "@playwright/test";

test.describe("워커 고용종료 lifecycle 회귀 방지 (PR-γ)", () => {
  test("ACTIVE_워커_고용종료_처리_플로우_토스트에_4대보험_안내_포함", async ({ page }) => {
    await page.goto("/workers/1");
    await page.getByRole("button", { name: "고용종료 처리" }).click();
    await expect(page.getByRole("alertdialog")).toBeVisible();

    await page.getByLabel("종료 사유").click();
    await page.getByRole("option", { name: "계약만료" }).click();
    await page.getByRole("button", { name: "고용종료 처리" }).last().click();

    await expect(page.getByText(/고용변동신고 D\+15 데드라인/)).toBeVisible();
    await expect(page.getByText(/4대보험 자격상실 신고도 잊지 마세요/)).toBeVisible();
  });

  test("REVIEW_REQUIRED_워커_안내_박스_노출_및_고용종료_확정_액션_진입", async ({ page }) => {
    await page.goto("/workers/3");
    await expect(page.getByText("계약종료일이 지난 근로자입니다.")).toBeVisible();
    await expect(page.getByText("시스템 자동 추론값")).toBeVisible();

    await page.getByRole("button", { name: "고용종료 확정" }).click();
    await expect(page.getByRole("alertdialog")).toBeVisible();
  });

  test("ENDED_워커_edit_페이지는_계약_필드와_제출이_disabled", async ({ page }) => {
    await page.goto("/workers/6/edit");

    await expect(page.getByLabel("계약 종료일")).toBeDisabled();
    await expect(page.getByRole("button", { name: /^수정$/ })).toBeDisabled();
    await expect(page.getByText(/고용종료된 근로자입니다.*복원.*실행/)).toBeVisible();
  });
});
