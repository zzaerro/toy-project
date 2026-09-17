import { expect, test } from "@playwright/test";

test("홈 화면이 열리고 증상 입력 폼과 진단 안내가 보인다", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle("증상으로 성분 찾기");
  await expect(
    page.getByRole("heading", { level: 1, name: "증상으로 성분 찾기" })
  ).toBeVisible();
  await expect(
    page.getByText("진단이 아닙니다", { exact: true })
  ).toBeVisible();
});

test("증상을 입력해 찾으면 해석한 범주와 성분 결과가 보인다", async ({
  page,
}) => {
  await page.goto("/");

  await page.getByLabel("증상").fill("잠을 잘 못 잔다");
  await page.getByRole("button", { name: "찾기" }).click();

  await expect(page.getByText("서비스의 해석입니다")).toBeVisible();
  await expect(page.getByText("감태추출물")).toBeVisible();
});

test("다룰 수 없는 증상은 연결 실패와 범주 목록을 보여준다", async ({
  page,
}) => {
  await page.goto("/");

  await page.getByLabel("증상").fill("우주선이 고장났다");
  await page.getByRole("button", { name: "찾기" }).click();

  await expect(page.getByText("연결에 실패했습니다")).toBeVisible();
});
