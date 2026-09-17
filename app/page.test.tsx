import { fireEvent, render, screen } from "@testing-library/react";
import { expect, test } from "vitest";

import Home from "@/app/page";
import { MAX_RESULTS } from "@/lib/ingredients";

function search(input: string) {
  const field = screen.getByLabelText("증상");
  fireEvent.change(field, { target: { value: input } });
  fireEvent.click(screen.getByRole("button", { name: "찾기" }));
}

test("첫 화면에서도 진단이 아니라는 안내 문구가 항상 보인다", () => {
  render(<Home />);

  expect(screen.getByText("진단이 아닙니다")).toBeInTheDocument();
});

test("첫 화면에서는 다룰 수 있는 기능성 범주 목록을 미리 보여주지 않는다", () => {
  render(<Home />);

  expect(screen.queryByText("연결에 실패했습니다")).not.toBeInTheDocument();
});

test("'잠을 잘 못 잔다'를 입력하면 수면 범주로 해석하고 성분을 최대 3개까지 보여준다", () => {
  render(<Home />);

  search("잠을 잘 못 잔다");

  expect(screen.getByText("수면")).toBeInTheDocument();
  expect(screen.getByText(/서비스의 해석입니다/)).toBeInTheDocument();
  expect(screen.getByText(/먼저 인정받은 순으로/)).toBeInTheDocument();
  expect(screen.getByText("감태추출물")).toBeInTheDocument();
  expect(screen.getAllByText("인정된 기능성").length).toBeLessThanOrEqual(
    MAX_RESULTS
  );
  // 진단 안내는 결과가 나온 뒤에도 여전히 보인다.
  expect(screen.getByText("진단이 아닙니다")).toBeInTheDocument();
});

test("다룰 수 없는 증상은 연결 실패와 전체 범주 목록을 보여준다", () => {
  render(<Home />);

  search("우주선이 고장났다");

  expect(screen.getByText("연결에 실패했습니다")).toBeInTheDocument();
  expect(screen.getByText("수면")).toBeInTheDocument();
});
