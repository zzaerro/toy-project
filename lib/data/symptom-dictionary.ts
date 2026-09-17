/**
 * 일상어 증상 표현을 기능성 범주로 잇는 사전.
 * 여기 없는 표현은 연결에 실패한 것으로 본다(스펙의 '남은 위험' 참고).
 */
export type SymptomEntry = {
  categoryId: string;
  keywords: string[];
};

export const SYMPTOM_DICTIONARY: SymptomEntry[] = [
  {
    categoryId: "sleep",
    keywords: ["불면", "수면", "잠을", "잠이 안", "잠들기 힘들"],
  },
  {
    categoryId: "eye",
    keywords: ["눈이 침침", "눈이 뻑뻑", "안구건조", "눈의 피로", "침침"],
  },
  { categoryId: "fatigue", keywords: ["피곤", "피로", "무기력", "기운이 없"] },
  { categoryId: "joint", keywords: ["관절", "무릎", "삐걱"] },
  {
    categoryId: "liver",
    keywords: ["간 수치", "간이 안 좋", "숙취", "음주", "술을 많이"],
  },
  { categoryId: "skin", keywords: ["피부", "건조", "각질"] },
  { categoryId: "circulation", keywords: ["혈액순환", "혈행", "손발이 차"] },
  { categoryId: "bodyfat", keywords: ["체지방", "다이어트", "살이 찌"] },
  { categoryId: "immune", keywords: ["면역", "감기", "잔병치레"] },
  { categoryId: "gut", keywords: ["변비", "배변", "장이 안 좋"] },
  { categoryId: "bloodsugar", keywords: ["혈당", "당뇨"] },
  { categoryId: "cholesterol", keywords: ["콜레스테롤", "고지혈"] },
  { categoryId: "bloodpressure", keywords: ["혈압"] },
  { categoryId: "bone", keywords: ["뼈", "골다공증", "골밀도"] },
  { categoryId: "menopause", keywords: ["갱년기", "폐경"] },
  { categoryId: "memory", keywords: ["기억력", "건망증", "깜빡"] },
  { categoryId: "stress", keywords: ["스트레스", "긴장", "예민"] },
  { categoryId: "gum", keywords: ["잇몸", "치은"] },
  { categoryId: "urinary", keywords: ["요로", "방광염"] },
  { categoryId: "nose", keywords: ["코막힘", "비염", "콧물"] },
  { categoryId: "prostate", keywords: ["전립선"] },
  { categoryId: "antioxidant", keywords: ["항산화", "노화가 걱정"] },
  { categoryId: "stomach", keywords: ["속쓰림", "위가 안 좋", "소화불량"] },
  { categoryId: "muscle", keywords: ["근력", "근육", "운동능력"] },
  { categoryId: "hair", keywords: ["탈모", "머릿결", "모발"] },
  { categoryId: "maleFertility", keywords: ["정자", "남성 생식"] },
  { categoryId: "bladder", keywords: ["배뇨", "소변을 자주"] },
  { categoryId: "legs", keywords: ["다리가 붓", "종아리가 붓"] },
  { categoryId: "teeth", keywords: ["충치", "치아"] },
  { categoryId: "vaginal", keywords: ["질염", "질 건강"] },
];

export function matchSymptomToCategoryId(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  for (const entry of SYMPTOM_DICTIONARY) {
    if (entry.keywords.some((keyword) => trimmed.includes(keyword))) {
      return entry.categoryId;
    }
  }
  return null;
}
