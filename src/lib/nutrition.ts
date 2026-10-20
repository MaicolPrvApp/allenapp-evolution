import type { Food, ID, Meal, MealPlan } from "../data/types";

export interface Macros { kcal: number; protein: number; carbs: number; fat: number }
export const ZERO: Macros = { kcal: 0, protein: 0, carbs: 0, fat: 0 };

export const add = (a: Macros, b: Macros): Macros => ({ kcal: a.kcal + b.kcal, protein: a.protein + b.protein, carbs: a.carbs + b.carbs, fat: a.fat + b.fat });

export function itemMacros(food: Food | undefined, grams: number): Macros {
  if (!food || !grams) return ZERO;
  const k = grams / 100;
  return { kcal: food.kcal * k, protein: food.protein * k, carbs: food.carbs * k, fat: food.fat * k };
}
export const mealMacros = (m: Meal, foods: Map<ID, Food>) => m.items.reduce((t, i) => add(t, itemMacros(foods.get(i.foodId), i.grams)), ZERO);
export const planMacros = (p: MealPlan, foods: Map<ID, Food>) => p.meals.reduce((t, m) => add(t, mealMacros(m, foods)), ZERO);

/** Ripartizione percentuale delle calorie tra i macronutrienti */
export function split(m: Macros) {
  const p = m.protein * 4, c = m.carbs * 4, f = m.fat * 9, t = p + c + f || 1;
  return { protein: (p / t) * 100, carbs: (c / t) * 100, fat: (f / t) * 100 };
}
