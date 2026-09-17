import { fireEvent, render, screen } from "@testing-library/react";
import { expect, test } from "vitest";

import Home from "@/app/page";
import { MAX_RESULTS } from "@/lib/ingredients";

function search(input: string) {
  const field = screen.getByLabelText("증상");
  fireEvent.change(field, { target: { value: input } });
  fireEvent.click(screen.getByRole("button", { name: "찾기" }));
}

test("첫 화면에는 경고문이나 연결 실패 안내가 보이지 않는다", () => {
  render(<Home />);

  expect(
    screen.queryByText("영양 성분은 치료제가 아닙니다")
  ).not.toBeInTheDocument();
  expect(screen.queryByText("연결에 실패했습니다")).not.toBeInTheDocument();
});

test("'잠을 잘 못 잔다'를 입력하면 수면 범주로 해석하고, 경고문과 함께 성분을 최대 3개까지 보여준다", () => {
  render(<Home />);

  search("잠을 잘 못 잔다");

  expect(screen.getByText("영양 성분은 치료제가 아닙니다")).toBeInTheDocument();
  expect(screen.getByText("수면")).toBeInTheDocument();
  expect(screen.getByText(/서비스의 해석입니다/)).toBeInTheDocument();
  expect(screen.getByText(/먼저 인정받은 순으로/)).toBeInTheDocument();
  expect(screen.getByText("감태추출물")).toBeInTheDocument();
  expect(screen.getAllByText("인정된 기능성").length).toBeLessThanOrEqual(
    MAX_RESULTS
  );
  expect(screen.getByText("증상이 오래 계속된다면")).toBeInTheDocument();
});

test("다룰 수 없는 증상은 연결 실패와 전체 범주 목록을 보여주고, 경고문은 붙지 않는다", () => {
  render(<Home />);

  search("우주선이 고장났다");

  expect(screen.getByText("연결에 실패했습니다")).toBeInTheDocument();
  expect(screen.getByText("수면")).toBeInTheDocument();
  expect(
    screen.queryByText("영양 성분은 치료제가 아닙니다")
  ).not.toBeInTheDocument();
});

test("법정 응급증상 표현은 성분 결과 대신 병원·119 안내를 범주명과 함께 보여준다", () => {
  render(<Home />);

  search("가슴이 답답하고 숨쉬기 힘들다");

  expect(screen.getByText("병원 진료가 필요합니다")).toBeInTheDocument();
  expect(screen.getByText(/심혈관계 응급증상/)).toBeInTheDocument();
  expect(screen.getByText(/119에 연락하시기 바랍니다/)).toBeInTheDocument();
  expect(screen.queryByText("인정된 기능성")).not.toBeInTheDocument();
  expect(
    screen.queryByText("영양 성분은 치료제가 아닙니다")
  ).not.toBeInTheDocument();
});

test("정신과적 응급증상 표현은 법정 안내에 더해 자살예방상담전화 1393도 함께 보여준다", () => {
  render(<Home />);

  search("죽고 싶다");

  expect(screen.getByText("병원 진료가 필요합니다")).toBeInTheDocument();
  expect(screen.getByText(/정신과적 응급증상/)).toBeInTheDocument();
  expect(screen.getByText(/1393/)).toBeInTheDocument();
  expect(screen.queryByText("인정된 기능성")).not.toBeInTheDocument();
});

test("응급증상 표현과 기능성 범주 키워드가 함께 있어도 병원 안내를 우선 보여준다", () => {
  render(<Home />);

  search("가슴 통증이 있고 잠도 안 온다");

  expect(screen.getByText("병원 진료가 필요합니다")).toBeInTheDocument();
  expect(screen.queryByText("연결에 실패했습니다")).not.toBeInTheDocument();
});
