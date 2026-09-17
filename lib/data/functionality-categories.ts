/**
 * 식약처 I2710 데이터의 '기능성' 문구를 30개 남짓한 고정 범주로 묶는 사전.
 * keywords는 공백을 제거한 뒤 부분 문자열로 매칭한다(표기 변형에 강함).
 * 출처: docs/specs/symptom-ingredient-lookup/spec.md의 '확정된 제약'.
 */
export type FunctionalityCategory = {
  id: string;
  label: string;
  keywords: string[];
};

export const FUNCTIONALITY_CATEGORIES: FunctionalityCategory[] = [
  { id: "sleep", label: "수면", keywords: ["수면"] },
  {
    id: "eye",
    label: "눈 건강",
    keywords: ["눈건강", "눈의피로", "건조한눈", "황반색소"],
  },
  { id: "fatigue", label: "피로", keywords: ["피로"] },
  { id: "joint", label: "관절·연골 건강", keywords: ["관절", "연골"] },
  {
    id: "liver",
    label: "간 건강",
    keywords: ["간건강", "간손상", "간을보호", "간보호"],
  },
  { id: "skin", label: "피부 건강", keywords: ["피부"] },
  {
    id: "circulation",
    label: "혈행 개선",
    keywords: ["혈행", "혈액흐름", "혈소판응집", "혈관이완", "혈관벽"],
  },
  { id: "bodyfat", label: "체지방 감소", keywords: ["체지방"] },
  { id: "immune", label: "면역 기능", keywords: ["면역"] },
  {
    id: "gut",
    label: "장·배변 건강",
    keywords: ["배변활동", "장건강", "유익균", "장내"],
  },
  { id: "bloodsugar", label: "혈당 조절", keywords: ["혈당"] },
  {
    id: "cholesterol",
    label: "콜레스테롤·중성지질 개선",
    keywords: ["콜레스테롤", "중성지질", "중성지방"],
  },
  { id: "bloodpressure", label: "혈압 조절", keywords: ["혈압"] },
  {
    id: "bone",
    label: "뼈 건강",
    keywords: ["뼈건강", "골다공증", "뼈의구성", "뼈형성", "뼈와치아"],
  },
  { id: "menopause", label: "갱년기 건강", keywords: ["갱년기"] },
  {
    id: "memory",
    label: "기억력·인지 기능",
    keywords: ["기억력", "인지기능", "인지력", "인지능력"],
  },
  {
    id: "stress",
    label: "스트레스·긴장 완화",
    keywords: ["스트레스", "긴장완화"],
  },
  { id: "gum", label: "잇몸 건강", keywords: ["잇몸"] },
  { id: "urinary", label: "요로 건강", keywords: ["요로"] },
  {
    id: "nose",
    label: "코 상태 개선",
    keywords: ["코상태", "코막힘", "코가려움"],
  },
  { id: "prostate", label: "전립선 건강", keywords: ["전립선"] },
  { id: "antioxidant", label: "항산화", keywords: ["항산화"] },
  {
    id: "stomach",
    label: "위 건강",
    keywords: ["위건강", "위불편감", "위점막"],
  },
  {
    id: "muscle",
    label: "근력·운동수행능력",
    keywords: ["근력", "운동수행능력", "운동능력", "지구력"],
  },
  { id: "hair", label: "모발 건강", keywords: ["모발"] },
  {
    id: "maleFertility",
    label: "남성 생식 건강",
    keywords: ["정자운동성"],
  },
  { id: "bladder", label: "배뇨 기능", keywords: ["배뇨기능"] },
  {
    id: "legs",
    label: "다리 불편감",
    keywords: ["다리의불편감", "다리불편감"],
  },
  {
    id: "teeth",
    label: "치아 건강",
    keywords: ["충치", "치아건강", "치아형성"],
  },
  {
    id: "vaginal",
    label: "질 건강",
    keywords: ["질내유익균", "질건강"],
  },
];

export function normalizeForMatch(text: string): string {
  return text.replace(/\s+/g, "");
}

export function categoriesMatchingText(text: string): string[] {
  const normalized = normalizeForMatch(text);
  return FUNCTIONALITY_CATEGORIES.filter((category) =>
    category.keywords.some((keyword) =>
      normalized.includes(normalizeForMatch(keyword))
    )
  ).map((category) => category.id);
}

export function getCategoryById(id: string): FunctionalityCategory | undefined {
  return FUNCTIONALITY_CATEGORIES.find((category) => category.id === id);
}
