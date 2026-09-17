import { describe, expect, it } from "vitest";

import {
  MAX_RESULTS,
  searchIngredientsBySymptom,
  type SymptomSearchResult,
} from "@/lib/ingredients";
import rawIngredients from "@/lib/data/ingredients.generated.json";
import { FUNCTIONALITY_CATEGORIES } from "@/lib/data/functionality-categories";

function assertMatched(
  result: SymptomSearchResult
): asserts result is Extract<SymptomSearchResult, { status: "matched" }> {
  expect(result.status).toBe("matched");
}

function assertUnmatched(
  result: SymptomSearchResult
): asserts result is Extract<SymptomSearchResult, { status: "unmatched" }> {
  expect(result.status).toBe("unmatched");
}

describe("searchIngredientsBySymptom", () => {
  it("'잠을 잘 못 잔다'는 수면 범주로 해석되고, 먼저 인정받은 성분부터 최대 3개까지 보인다", () => {
    const result = searchIngredientsBySymptom("잠을 잘 못 잔다");
    assertMatched(result);

    expect(result.category.label).toBe("수면");
    expect(result.ingredients).toHaveLength(MAX_RESULTS);
    expect(result.totalMatched).toBeGreaterThan(MAX_RESULTS);

    const names = result.ingredients.map((i) => i.name);
    expect(names[0]).toBe("감태추출물");

    // 감태추출물(2015년 인정)이 상추추출물(2025년 인정)보다 앞에 있어야 한다.
    const 감태Index = names.indexOf("감태추출물");
    const 상추Index = names.indexOf("상추추출물");
    if (감태Index !== -1 && 상추Index !== -1) {
      expect(감태Index).toBeLessThan(상추Index);
    }

    // 결과는 정렬 기준(연도 오름차순)을 지켜야 한다.
    const years = result.ingredients.map((i) => i.sortYear);
    expect(years).toEqual([...years].sort((a, b) => a - b));
  });

  it("관련 성분이 3개보다 적으면 있는 만큼만 보이고 전체 개수로 부족함을 알 수 있다", () => {
    // 데이터상 'legs'(다리 불편감) 범주는 1건뿐이다.
    const result = searchIngredientsBySymptom("다리가 붓는다");
    assertMatched(result);

    expect(result.category.id).toBe("legs");
    expect(result.ingredients.length).toBeLessThan(MAX_RESULTS);
    expect(result.ingredients.length).toBe(result.totalMatched);
  });

  it("사전에 없는 표현은 연결 실패로 처리하고, 다룰 수 있는 범주 전체를 알려준다", () => {
    const result = searchIngredientsBySymptom("우주선이 고장났다");
    assertUnmatched(result);

    expect(result.availableCategories.length).toBe(
      FUNCTIONALITY_CATEGORIES.length
    );
  });

  it("빈 입력은 연결 실패로 처리한다", () => {
    const result = searchIngredientsBySymptom("   ");
    assertUnmatched(result);
  });

  it("같은 이름의 성분은 데이터 전체에서 단 하나만 존재한다", () => {
    const names = (rawIngredients as { name: string }[]).map((i) => i.name);
    const unique = new Set(names);
    expect(unique.size).toBe(names.length);
  });

  it("30개 남짓한 기능성 범주 각각에 걸리는 성분이 하나 이상 있다", () => {
    for (const category of FUNCTIONALITY_CATEGORIES) {
      const count = (
        rawIngredients as { categoryIds: string[] }[]
      ).filter((i) => i.categoryIds.includes(category.id)).length;
      expect(count).toBeGreaterThan(0);
    }
  });
});
