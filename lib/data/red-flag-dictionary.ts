/**
 * 응급의료에 관한 법률 시행규칙 별표1을 근거로 한 응급증상 판별 사전.
 * "1. 응급증상"(9개)과 "2. 응급증상에 준하는 증상"(7개)을 합쳐 겹치지 않는
 * 범주 이름 11개로 정리했다. 기존 기능성 범주 키워드와 겹치는 법정 단어
 * ("배뇨장애", "당뇨병" 등)는 더 구체적인 표현으로 대체했다.
 * 출처: docs/specs/medical-safety-notice/spec.md의 '확정된 제약'.
 */
export type EmergencyCategory = {
  id: string;
  label: string;
  keywords: string[];
  isMentalHealth?: boolean;
};

export const EMERGENCY_CATEGORIES: EmergencyCategory[] = [
  {
    id: "neuro",
    label: "신경학적 응급증상",
    keywords: [
      "의식을 잃을 것 같다",
      "정신을 잃었다",
      "의식이 없다",
      "말이 잘 안 나온다",
      "한쪽이 마비된다",
      "몸에 힘이 안 들어간다",
      "머리를 심하게 부딪혔다",
      "어지러워서 못 서겠다",
    ],
  },
  {
    id: "cardio",
    label: "심혈관계 응급증상",
    keywords: [
      "가슴이 아프다",
      "가슴 통증",
      "가슴이 답답하다",
      "가슴이 조이는",
      "숨쉬기 힘들다",
      "숨이 안 쉬어진다",
      "호흡곤란",
      "과호흡",
      "심장이 빠르게 뛴다",
      "쓰러졌다",
    ],
  },
  {
    id: "toxicMetabolic",
    label: "중독 및 대사장애",
    keywords: ["약을 많이 먹었다", "술을 너무 많이 마셔서 의식이 없다", "심한 탈수 증상"],
  },
  {
    id: "surgical",
    label: "외과적 응급증상",
    keywords: [
      "배가 갑자기 심하게 아프다",
      "심한 화상을 입었다",
      "찔렸다",
      "뼈가 부러진 것 같다",
      "교통사고를 당했다",
    ],
  },
  {
    id: "bleeding",
    label: "출혈",
    keywords: ["피가 멈추지 않는다", "많은 피가 난다", "피를 토한다", "각혈"],
  },
  {
    id: "eye",
    label: "안과적 응급증상",
    keywords: ["눈에 화학약품이 들어갔다", "갑자기 안 보인다", "시력을 잃었다"],
  },
  {
    id: "allergy",
    label: "알러지",
    keywords: ["알러지 반응으로 얼굴이 붓는다", "두드러기와 함께 얼굴이 붓는다"],
  },
  {
    id: "pediatric",
    label: "소아과적 응급증상",
    keywords: ["아이가 경련을 한다", "아이가 고열에 경련을 한다"],
  },
  {
    id: "mental",
    label: "정신과적 응급증상",
    keywords: ["죽고 싶다", "자살", "자해하고 싶다", "나를 해치고 싶다", "남을 해치고 싶다"],
    isMentalHealth: true,
  },
  {
    id: "obgyn",
    label: "산부인과적 응급증상",
    keywords: ["출산이 임박했다", "곧 아기가 나올 것 같다", "성폭력을 당했다"],
  },
  {
    id: "foreignBody",
    label: "이물에 의한 응급증상",
    keywords: ["목에 무언가 걸렸다", "코에 이물이 들어갔다", "귀에 이물이 들어갔다"],
  },
];

export type EmergencyMatch = {
  id: string;
  label: string;
  isMentalHealth: boolean;
};

export function matchEmergencyCategory(input: string): EmergencyMatch | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  for (const category of EMERGENCY_CATEGORIES) {
    if (category.keywords.some((keyword) => trimmed.includes(keyword))) {
      return {
        id: category.id,
        label: category.label,
        isMentalHealth: category.isMentalHealth ?? false,
      };
    }
  }
  return null;
}
