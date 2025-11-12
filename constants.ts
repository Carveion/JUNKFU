import { CategoryGroup, Quantity } from './types';

export const MASTER_FOOD_CATEGORIES: CategoryGroup[] = [
  {
    cuisine: 'General',
    items: [
      { name: 'Pizza Slice', calories: 285, emoji: '🍕' },
      { name: 'Burger', calories: 354, emoji: '🍔' },
      { name: 'Salad Bowl', calories: 150, emoji: '🥗' },
      { name: 'Sandwich/Wrap', calories: 300, emoji: '🥪' },
      { name: 'Fried Snack (Fries)', calories: 350, emoji: '🍟' },
      { name: 'Grilled Meat (Chicken)', calories: 250, emoji: '🍗' },
      { name: 'Steamed Veggies', calories: 100, emoji: '🥦' },
      { name: 'Soup Bowl', calories: 200, emoji: '🥣' },
      { name: 'Cereal Bowl', calories: 250, emoji: '🥣' },
      { name: 'Omelette (2 eggs)', calories: 180, emoji: '🍳' },
    ]
  },
  {
    cuisine: 'Indian',
    items: [
      { name: 'Veggie Curry', calories: 250, emoji: '🍛' },
      { name: 'Meat Curry (Chicken/Mutton)', calories: 400, emoji: '🥘' },
      { name: 'Rice Dish (Biryani)', calories: 450, emoji: '🍚' },
      { name: 'Lentil Dish (Dal)', calories: 200, emoji: '🍲' },
      { name: 'Flatbread (Roti/Naan)', calories: 150, emoji: '🫓' },
      { name: 'Dosa (Plain)', calories: 120, emoji: '🥞'},
      { name: 'Idli (2 pieces)', calories: 80, emoji: '⚪'},
      { name: 'Samosa (1 piece)', calories: 260, emoji: '🔺'},
      { name: 'Paneer Dish', calories: 350, emoji: '🧀'},
    ]
  },
  {
    cuisine: 'Asian',
    items: [
      { name: 'Noodle Soup (Ramen)', calories: 480, emoji: '🍜' },
      { name: 'Stir-fry Dish', calories: 380, emoji: '🥡' },
      { name: 'Sushi Roll (6 pieces)', calories: 250, emoji: '🍣' },
      { name: 'Dumplings (6 pieces)', calories: 290, emoji: '🥟' },
      { name: 'Fried Rice', calories: 400, emoji: '🍚' },
    ]
  },
  {
    cuisine: 'Italian',
    items: [
      { name: 'Pasta', calories: 350, emoji: '' },
      { name: 'Spaghetti', calories: 350, emoji: '' },
      { name: 'Lasagna', calories: 400, emoji: '' },
    ]
  },
  {
    cuisine: 'Snacks & Drinks',
    items: [
      { name: 'Sweet Snack (Doughnut)', calories: 250, emoji: '🍩' },
      { name: 'Sugary Drink (Soda)', calories: 150, emoji: '🥤' },
      { name: 'Coffee (Latte)', calories: 120, emoji: '☕' },
      { name: 'Fruit', calories: 80, emoji: '🍎' },
      { name: 'Yogurt Cup', calories: 150, emoji: '🍦' },
      { name: 'Protein Bar', calories: 200, emoji: '🍫' },
    ]
  }
];


export const QUANTITY_MULTIPLIERS: Record<Quantity, number> = {
  'Small': 0.75,
  'Medium': 1,
  'Large': 1.5,
  'Extra Large': 2,
};
