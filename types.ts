export enum MealType {
  Breakfast = 'Breakfast',
  Lunch = 'Lunch',
  Dinner = 'Dinner',
  Snacks = 'Snacks',
}

export type Quantity = 'Small' | 'Medium' | 'Large' | 'Extra Large';

export interface StandardMeal {
  name: string;
  calories: number;
}

export interface UserProfile {
  name: string;
  age: number;
  weight: number; // in kg
  height: number; // in cm
  idealWeight: number; // in kg
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active';
  dailyCalorieGoal: number;
  favoriteCategoryNames: string[];
  standardMeals: {
    breakfast: StandardMeal[];
    lunch: StandardMeal[];
    dinner: StandardMeal[];
  };
}

export interface FoodEntry {
  id: string;
  name: string;
  calories: number; // The final, calculated calories
  baseCalories: number; // Calorie count for a 'Medium' serving or per item
  quantity: Quantity | number;
  quantityUnit: 'serving' | 'pcs' | 'g';
  quantity_label: string; // e.g., "Medium" or "2 pcs" or "100g"
  mealType: MealType;
  timestamp: string;
  isCustom: boolean; // Flag to identify AI-generated entries
  assumedGrams?: number; // AI's assumed serving size in grams
}

export interface Category {
    name: string;
    calories: number; // Represents a 'Medium' serving or per-item
    emoji: string;
}

export interface CategoryGroup {
  cuisine: string;
  items: Category[];
}
