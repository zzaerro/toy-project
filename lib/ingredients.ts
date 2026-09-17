import rawIngredients from "@/lib/data/ingredients.generated.json";
import {
  FUNCTIONALITY_CATEGORIES,
  getCategoryById,
} from "@/lib/data/functionality-categories";
import { matchSymptomToCategoryId } from "@/lib/data/symptom-dictionary";
import {
  matchEmergencyCategory,
  type EmergencyMatch,
} from "@/lib/data/red-flag-dictionary";

export type Ingredient = {
  id: string;
  name: string;
  functionalityClaims: string[];
  dailyIntakeOptions: string[];
  precaution: string | null;
  indicatorIngredients: string[];
  approvedYear: number | null;
  sortYear: number;
  categoryIds: string[];
};

export type CategorySummary = { id: string; label: string };

export const MAX_RESULTS = 3;

const INGREDIENTS = rawIngredients as Ingredient[];

export type SymptomSearchResult =
  | {
      status: "matched";
      category: CategorySummary;
      ingredients: Ingredient[];
      totalMatched: number;
    }
  | {
      status: "unmatched";
      availableCategories: CategorySummary[];
    }
  | { status: "emergency"; category: EmergencyMatch };

export function searchIngredientsBySymptom(input: string): SymptomSearchResult {
  const emergency = matchEmergencyCategory(input);
  if (emergency) {
    return { status: "emergency", category: emergency };
  }

  const categoryId = matchSymptomToCategoryId(input);
  if (!categoryId) {
    return {
      status: "unmatched",
      availableCategories: FUNCTIONALITY_CATEGORIES.map((c) => ({
        id: c.id,
        label: c.label,
      })),
    };
  }

  const category = getCategoryById(categoryId);
  const matched = INGREDIENTS.filter((ing) =>
    ing.categoryIds.includes(categoryId)
  ).sort((a, b) => a.sortYear - b.sortYear);

  return {
    status: "matched",
    category: { id: categoryId, label: category?.label ?? categoryId },
    ingredients: matched.slice(0, MAX_RESULTS),
    totalMatched: matched.length,
  };
}
