/**
 * 신체 응급 신호와 자해·자살 신호를 판별하는 키워드 사전.
 * 판별 우선순위: 자해·자살 > 신체 응급 > 기능성 범주 연결.
 * 출처: docs/specs/medical-safety-notice/spec.md의 '확정된 제약'.
 */
export type RedFlagStatus = "self-harm" | "emergency";

const SELF_HARM_KEYWORDS = ["죽고 싶다", "자살", "자해하고 싶다"];

const EMERGENCY_KEYWORDS = [
  // 가슴 통증·압박감
  "가슴이 아프다",
  "가슴 통증",
  "가슴이 답답하다",
  "가슴이 조이는",
  // 호흡곤란
  "숨쉬기 힘들다",
  "숨이 안 쉬어진다",
  "호흡곤란",
  // 신경학적 응급
  "말이 잘 안 나온다",
  "한쪽이 마비된다",
  "몸에 힘이 안 들어간다",
  "의식을 잃을 것 같다",
  // 심한 출혈
  "피가 멈추지 않는다",
  "많은 피가 난다",
  // 고열·경련
  "고열",
  "경련",
  "발작",
  // 극심한 두통
  "머리가 터질 것 같다",
  "극심한 두통",
];

export function matchRedFlag(input: string): RedFlagStatus | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  if (SELF_HARM_KEYWORDS.some((keyword) => trimmed.includes(keyword))) {
    return "self-harm";
  }
  if (EMERGENCY_KEYWORDS.some((keyword) => trimmed.includes(keyword))) {
    return "emergency";
  }
  return null;
}
