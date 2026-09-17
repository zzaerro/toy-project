/**
 * data/i2710-raw.csv(식약처 I2710 건강기능식품 품목분류정보 원본)를
 * lib/data/ingredients.generated.json으로 정제한다.
 *
 * 실행: bun run scripts/build-ingredients-data.ts
 *
 * 원본 CSV를 다시 받으려면(09~19시에는 JSON 호출이 막히므로 파일 경로를 쓴다):
 *   curl -s -o data/i2710-raw.csv.gz "http://openapi.foodsafetykorea.go.kr/api/<인증키>/I2710/file" \
 *     && gzip -d data/i2710-raw.csv.gz
 * 인증키는 절대 커밋하지 않는다.
 */
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { categoriesMatchingText } from "../lib/data/functionality-categories";

const RAW_CSV_PATH = path.join(process.cwd(), "data", "i2710-raw.csv");
const OUTPUT_PATH = path.join(
  process.cwd(),
  "lib",
  "data",
  "ingredients.generated.json"
);

type RawRow = {
  PRDCT_NM: string;
  IFTKN_ATNT_MATR_CN: string;
  PRIMARY_FNCLTY: string;
  DAY_INTK_LOWLIMIT: string;
  DAY_INTK_HIGHLIMIT: string;
  INTK_UNIT: string;
  INTK_MEMO: string;
  SKLL_IX_IRDNT_RAWMTRL: string;
  CRET_DTM: string;
  LAST_UPDT_DTM: string;
};

export type Ingredient = {
  id: string;
  name: string;
  functionalityClaims: string[];
  dailyIntakeOptions: string[];
  precaution: string | null;
  indicatorIngredients: string[];
  /** 품목명의 인정번호에서 읽은 인정 연도. 없으면 null(고시형이거나 번호 표기가 없는 자료). */
  approvedYear: number | null;
  /**
   * 정렬 전용 연도: approvedYear가 있으면 그대로, 없으면 데이터 등록일(CRET_DTM)의 연도로
   * 대체한다. 등록일은 인정일과 다르므로 화면에 노출하지 않고 '먼저 인정받은 순' 정렬의
   * 근사치로만 쓴다(스펙 '확정된 제약' 참고).
   */
  sortYear: number;
  categoryIds: string[];
};

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  // 유니코드 코드포인트 단위로 순회(서로게이트 쌍 안전)
  const chars = Array.from(text);
  for (let i = 0; i < chars.length; i++) {
    const c = chars[i];
    if (inQuotes) {
      if (c === '"') {
        if (chars[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
      continue;
    }
    if (c === '"') {
      inQuotes = true;
      continue;
    }
    if (c === ",") {
      row.push(field);
      field = "";
      continue;
    }
    if (c === "\r") {
      continue;
    }
    if (c === "\n") {
      row.push(field);
      field = "";
      rows.push(row);
      row = [];
      continue;
    }
    field += c;
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.length > 1 || (r.length === 1 && r[0] !== ""));
}

function toRows(csvText: string): RawRow[] {
  const stripped = csvText.replace(/^﻿/, "");
  const table = parseCsv(stripped);
  const header = table[0];
  return table.slice(1).map((cols) => {
    const obj: Record<string, string> = {};
    header.forEach((key, idx) => {
      obj[key] = cols[idx] ?? "";
    });
    return obj as unknown as RawRow;
  });
}

const RECOGNITION_NUMBER_RE = /\(제\s*(\d{4})-\d+\s*호\)/;

function cleanName(rawName: string): string {
  return rawName.replace(RECOGNITION_NUMBER_RE, "").trim();
}

function extractYear(rawName: string): number | null {
  const m = rawName.match(RECOGNITION_NUMBER_RE);
  return m ? Number(m[1]) : null;
}

/** '(국문) ... (영문) ...' 형태에서 국문만 남긴다. */
function extractKoreanOnly(text: string): string {
  let t = text.trim();
  if (t.includes("(국문)")) {
    t = t.split("(국문)", 2)[1] ?? t;
    if (t.includes("(영문)")) {
      t = t.split("(영문)", 2)[0] ?? t;
    }
  }
  return t.trim();
}

/**
 * 줄 앞의 표시 기호("-", "·", "①", "(1)", "(가)" 등)를 뗀다. 같은 성분의 여러 행이
 * 이 기호 유무만 다를 뿐 같은 문구를 반복하는 경우가 있어(예: 헛개나무과병추출분말),
 * 이 기호를 남겨두면 중복 제거(Set)가 서로 다른 문자열로 보고 놓친다.
 */
const LEADING_MARKER_RE =
  /^(?:[-·‧•]|\(?[0-9]+\)?[.)]?|[①-⑳]|\([가-힣]\))\s*/;

/** "(생리활성기능 2등급)", "(기타기능II)" 같은 분류 각주. 문구의 핵심 내용이 아니다. */
const TRAILING_ANNOTATION_RE =
  /[\(（][^()（）]*(?:등급|기타\s*기능)[^()（）]*[\)）]\s*\.?\s*$/;

/** 한 줄 안에서 "① ... ② ..."처럼 이어붙은 여러 항목을 가르는 경계(선행 쉼표는 선택). */
const INLINE_ITEM_BOUNDARY_RE = /,?\s*(?=[①-⑳])/;

function stripLeadingMarker(line: string): string {
  return line.replace(LEADING_MARKER_RE, "").trim();
}

function stripTrailingAnnotation(line: string): string {
  return line.replace(TRAILING_ANNOTATION_RE, "").trim();
}

/** 표시/중복 제거 공용 정리: 앞 기호·뒤 각주를 떼고 내부 공백을 한 칸으로 모은다. */
function cleanItem(text: string): string {
  return stripTrailingAnnotation(stripLeadingMarker(text)).replace(
    /\s+/g,
    " "
  );
}

/**
 * 중복 제거 키: 표기(공백, 앞뒤 기호, 분류 각주) 차이는 같은 문구로 본다.
 * "관절 및 연골건강..."과 "관절 및 연골 건강...(생리활성기능 2등급)"처럼 내용이 같으면
 * 공백 유무·각주 유무만 다른 행이 여러 개 있어(같은 성분의 다른 업체 승인 등), 이 차이까지
 * 지워야 실제 중복이 하나로 합쳐진다.
 */
function dedupKey(text: string): string {
  return cleanItem(text).replace(/\s+/g, "");
}

/**
 * 여러 줄 문구를 항목 단위로 나눈다(기능성 문구·섭취 시 주의사항 공용).
 * 줄바꿈뿐 아니라 "①…②…"처럼 한 줄에 여러 항목이 이어붙은 경우도 가른다.
 */
function splitLines(text: string): string[] {
  if (!text.trim()) return [];
  return text
    .split(/\n+/)
    .flatMap((line) => line.split(INLINE_ITEM_BOUNDARY_RE))
    .map((p) => cleanItem(p))
    .filter(Boolean);
}

/** Map을 Set처럼 쓰되, 표기만 다른 중복은 먼저 나온 표시 문구를 그대로 유지한다. */
function addUnique(map: Map<string, string>, text: string): void {
  const key = dedupKey(text);
  if (key && !map.has(key)) {
    map.set(key, cleanItem(text));
  }
}

function formatDailyIntake(row: RawRow): string | null {
  const low = row.DAY_INTK_LOWLIMIT?.trim();
  const high = row.DAY_INTK_HIGHLIMIT?.trim();
  const unit = row.INTK_UNIT?.trim() ?? "";
  if (!low && !high) return null;
  if (low === high) return `${low}${unit}`;
  if (!low) return `${high}${unit}`;
  if (!high) return `${low}${unit}`;
  return `${low}~${high}${unit}`;
}

function build(): void {
  const csvText = readFileSync(RAW_CSV_PATH, "utf-8");
  const rows = toRows(csvText);

  const byName = new Map<
    string,
    {
      claims: Map<string, string>;
      dailyIntakes: Set<string>;
      precautions: Map<string, string>;
      indicators: Set<string>;
      years: number[];
      cretYears: number[];
      categoryIds: Set<string>;
    }
  >();

  for (const row of rows) {
    const name = cleanName(row.PRDCT_NM);
    if (!name) continue;
    const year = extractYear(row.PRDCT_NM);
    const cretYear = Number(row.CRET_DTM?.slice(0, 4)) || null;
    const koreanFnclty = extractKoreanOnly(row.PRIMARY_FNCLTY);
    const claims = splitLines(koreanFnclty);
    const categoryIds = categoriesMatchingText(koreanFnclty);
    const dailyIntake = formatDailyIntake(row);
    const precautionLines = splitLines(row.IFTKN_ATNT_MATR_CN?.trim() ?? "");
    const indicator = row.SKLL_IX_IRDNT_RAWMTRL?.trim();

    if (!byName.has(name)) {
      byName.set(name, {
        claims: new Map(),
        dailyIntakes: new Set(),
        precautions: new Map(),
        indicators: new Set(),
        years: [],
        cretYears: [],
        categoryIds: new Set(),
      });
    }
    const entry = byName.get(name)!;
    claims.forEach((c) => addUnique(entry.claims, c));
    if (dailyIntake) entry.dailyIntakes.add(dailyIntake);
    precautionLines.forEach((p) => addUnique(entry.precautions, p));
    if (indicator) entry.indicators.add(indicator);
    if (year !== null) entry.years.push(year);
    if (cretYear !== null) entry.cretYears.push(cretYear);
    categoryIds.forEach((id) => entry.categoryIds.add(id));
  }

  const ingredients: Ingredient[] = Array.from(byName.entries()).map(
    ([name, data], idx) => {
      const approvedYear =
        data.years.length > 0 ? Math.min(...data.years) : null;
      const sortYear =
        approvedYear ??
        (data.cretYears.length > 0 ? Math.min(...data.cretYears) : 9999);
      return {
        id: `ing-${idx}-${name}`,
        name,
        functionalityClaims: Array.from(data.claims.values()),
        dailyIntakeOptions: Array.from(data.dailyIntakes),
        precaution:
          data.precautions.size > 0
            ? Array.from(data.precautions.values()).join("\n")
            : null,
        indicatorIngredients: Array.from(data.indicators),
        approvedYear,
        sortYear,
        categoryIds: Array.from(data.categoryIds),
      };
    }
  );

  writeFileSync(OUTPUT_PATH, JSON.stringify(ingredients, null, 2), "utf-8");
  console.log(
    `raw rows: ${rows.length}, unique ingredients: ${ingredients.length} -> ${OUTPUT_PATH}`
  );
}

build();
