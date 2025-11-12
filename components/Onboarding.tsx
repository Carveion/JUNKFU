import React, { useState } from 'react';
import type { UserProfile, StandardMeal } from '../types';
import { MASTER_FOOD_CATEGORIES } from '../constants';
import { parseStandardMealDescription } from '../services/geminiService';
import MealSetupInput from './MealSetupInput';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
  onBackToLogin: () => void;
}

type MealKey = 'breakfast' | 'lunch' | 'dinner';

const LoadingIndicator: React.FC = () => (
    <div className="flex items-center justify-center space-x-2">
        <div className="w-2 h-2 rounded-full bg-white animate-pulse [animation-delay:-0.3s]"></div>
        <div className="w-2 h-2 rounded-full bg-white animate-pulse [animation-delay:-0.15s]"></div>
        <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
    </div>
);

const MealSetup: React.FC<{ 
  mealType: MealKey;
  title: string;
  mealDescriptions: { breakfast: string; lunch: string; dinner: string; };
  setMealDescriptions: React.Dispatch<React.SetStateAction<{ breakfast: string; lunch: string; dinner: string; }>>;
  standardMeals: { breakfast: StandardMeal[]; lunch: StandardMeal[]; dinner: StandardMeal[]; };
  handleParseMeal: (mealType: MealKey) => void;
  isParsing: boolean;
}> = ({ mealType, title, mealDescriptions, setMealDescriptions, standardMeals, handleParseMeal, isParsing }) => (
    <div>
        <label className="block mb-1 text-sm font-bold text-white/90">{title}</label>
        <div className="flex gap-2">
            <MealSetupInput
              initialValue={mealDescriptions[mealType]}
              onValueChange={value => setMealDescriptions(prev => ({ ...prev, [mealType]: value }))}
              placeholder="e.g., Two eggs and a coffee"
              disabled={isParsing}
            />
            <button type="button" onClick={() => handleParseMeal(mealType)} disabled={isParsing} className="bg-pleasant-green-500/80 text-white font-bold px-4 rounded-lg text-sm hover:bg-pleasant-green-500 transition disabled:opacity-50 min-w-[80px]">
              {isParsing ? <LoadingIndicator/> : 'Analyze'}
            </button>
        </div>
        {standardMeals[mealType].length > 0 && (
            <div className="mt-2 space-y-1 text-xs text-white">
                {standardMeals[mealType].map((item, index) => (
                    <div key={index} className="flex justify-between items-center bg-black/10 p-1.5 rounded">
                        <span>{item.name}</span>
                        <span className="font-semibold">{item.calories} cal</span>
                    </div>
                ))}
            </div>
        )}
    </div>
);


const Onboarding: React.FC<OnboardingProps> = ({ onComplete, onBackToLogin }) => {
  const [step, setStep] = useState(1);
  
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [idealWeight, setIdealWeight] = useState('');
  const [activityLevel, setActivityLevel] = useState<'sedentary' | 'light' | 'moderate' | 'active'>('light');
  
  const [favoriteCategories, setFavoriteCategories] = useState<string[]>([]);

  const [mealDescriptions, setMealDescriptions] = useState({ breakfast: '', lunch: '', dinner: '' });
  const [standardMeals, setStandardMeals] = useState<{ breakfast: StandardMeal[], lunch: StandardMeal[], dinner: StandardMeal[] }>({ breakfast: [], lunch: [], dinner: [] });
  const [isParsing, setIsParsing] = useState<Partial<Record<MealKey, boolean>>>({});

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1 && (!name || !age || !weight || !height || !idealWeight)) {
        alert('Please fill all fields.');
        return;
    }
    if (step < 3) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const toggleCategory = (categoryName: string) => {
    setFavoriteCategories(prev => 
      prev.includes(categoryName)
        ? prev.filter(name => name !== categoryName)
        : [...prev, categoryName]
    );
  };
  
  const handleParseMeal = async (mealType: MealKey) => {
    const description = mealDescriptions[mealType];
    if (!description) return;

    setIsParsing(prev => ({ ...prev, [mealType]: true }));
    const parsedItems = await parseStandardMealDescription(description);
    if (parsedItems) {
        setStandardMeals(prev => ({...prev, [mealType]: parsedItems }));
    } else {
        alert(`Could not analyze ${mealType}. Please try a different description.`);
    }
    setIsParsing(prev => ({ ...prev, [mealType]: false }));
  }

  const calculateDailyCalorieGoal = (): number => {
    const currentWeightKg = parseFloat(weight);
    const targetWeightKg = parseFloat(idealWeight);
    const heightCm = parseFloat(height);
    const ageNum = parseInt(age);
    const bmr = 88.362 + (13.397 * currentWeightKg) + (4.799 * heightCm) - (5.677 * ageNum);
    const activityMultipliers = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725 };
    const maintenanceCalories = Math.round(bmr * activityMultipliers[activityLevel]);
    const weightDifference = targetWeightKg - currentWeightKg;
    if (weightDifference < -1) return maintenanceCalories - 500;
    if (weightDifference > 1) return maintenanceCalories + 500;
    return maintenanceCalories;
  };
  
  const handleSubmit = () => {
    const dailyCalorieGoal = calculateDailyCalorieGoal();
    onComplete({
      name,
      age: parseInt(age),
      weight: parseFloat(weight),
      height: parseFloat(height),
      idealWeight: parseFloat(idealWeight),
      activityLevel,
      dailyCalorieGoal,
      favoriteCategoryNames: favoriteCategories,
      standardMeals,
    });
  };

  const renderStep = () => {
    const inputClasses = "w-full bg-pleasant-green-700/60 border-2 border-pleasant-green-500/60 rounded-lg p-3 text-white placeholder-pleasant-green-100/70 focus:outline-none focus:border-pleasant-green-200 transition";

    switch(step) {
      case 1:
        return (
          <>
            <p className="text-white/80 mb-8 text-center">Let's set up your profile to get started.</p>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="What's your name?" className={inputClasses} />
            <div className="grid grid-cols-2 gap-4">
              <input type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="Age" className={inputClasses} />
              <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="Height (cm)" className={inputClasses} />
              <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="Weight (kg)" className={inputClasses} />
              <input type="number" value={idealWeight} onChange={(e) => setIdealWeight(e.target.value)} placeholder="Ideal Weight (kg)" className={inputClasses} />
            </div>
            <div>
              <label className="block mb-2 text-sm font-bold text-white/90">Activity Level</label>
              <select value={activityLevel} onChange={(e) => setActivityLevel(e.target.value as any)} className={`${inputClasses} appearance-none`} >
                <option value="sedentary">Sedentary</option>
                <option value="light">Lightly Active</option>
                <option value="moderate">Moderately Active</option>
                <option value="active">Very Active</option>
              </select>
            </div>
          </>
        );
      case 2:
        return (
            <>
                <p className="text-white/80 mb-6 text-center">Choose your favorite food categories for quick access later.</p>
                <div className="overflow-hidden">
                  <div className="space-y-4 max-h-80 overflow-y-auto pr-2 text-white">
                      {MASTER_FOOD_CATEGORIES.map(group => (
                          <div key={group.cuisine}>
                              <h3 className="font-bold mb-2">{group.cuisine}</h3>
                               <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                  {group.items.map(cat => (
                                      <button key={cat.name} type="button" onClick={() => toggleCategory(cat.name)} className={`p-3 rounded-lg text-center border-2 transition-all duration-200 ${favoriteCategories.includes(cat.name) ? 'bg-white text-pleasant-green-800 border-white scale-105' : 'bg-black/10 border-transparent hover:bg-black/20'}`}>
                                          {cat.emoji && <span className="text-3xl block mb-1">{cat.emoji}</span>}
                                          <span className="font-semibold text-sm">{cat.name}</span>
                                      </button>
                                  ))}
                              </div>
                          </div>
                      ))}
                  </div>
                </div>
            </>
        );
      case 3:
        return (
            <>
                <p className="text-white/80 mb-6 text-center">Describe your usual meals. We'll use AI to break them down for one-click logging.</p>
                <div className="space-y-4">
                  <MealSetup mealType="breakfast" title="Usual Breakfast" mealDescriptions={mealDescriptions} setMealDescriptions={setMealDescriptions} standardMeals={standardMeals} handleParseMeal={handleParseMeal} isParsing={!!isParsing.breakfast} />
                  <MealSetup mealType="lunch" title="Usual Lunch" mealDescriptions={mealDescriptions} setMealDescriptions={setMealDescriptions} standardMeals={standardMeals} handleParseMeal={handleParseMeal} isParsing={!!isParsing.lunch} />
                  <MealSetup mealType="dinner" title="Usual Dinner" mealDescriptions={mealDescriptions} setMealDescriptions={setMealDescriptions} standardMeals={standardMeals} handleParseMeal={handleParseMeal} isParsing={!!isParsing.dinner} />
                </div>
                <p className="text-center text-xs text-white/70 mt-4">Disclaimer: Calorie counts are estimates and may vary.</p>
            </>
        )
      default: return null;
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative">
       <button onClick={onBackToLogin} className="absolute top-6 left-6 text-white/80 hover:text-white transition z-10">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
      <div className="w-full max-w-lg">
        <h1 className="text-8xl sm:text-9xl font-display text-white tracking-tight mb-4 text-center leading-none">JUNKFU.</h1>
        <div className="bg-pleasant-green-700/50 backdrop-blur-xl rounded-2xl p-6 sm:p-8 shadow-2xl border border-white/20">
            <form onSubmit={handleNext} className="space-y-6">
            {renderStep()}
            <button type="submit" className="w-full bg-white text-pleasant-green-700 font-bold py-3 rounded-lg text-lg hover:bg-pleasant-green-100 transition duration-300 transform hover:scale-105">
                {step === 3 ? 'Finish Setup' : 'Continue'}
            </button>
            {step > 1 && <button type="button" onClick={() => setStep(step - 1)} className="w-full text-center mt-2 text-white/70 hover:text-white transition">Back</button>}
            </form>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;