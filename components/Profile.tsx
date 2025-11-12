import React, { useState } from 'react';
import type { UserProfile, StandardMeal } from '../types';
import { MASTER_FOOD_CATEGORIES } from '../constants';
import { parseStandardMealDescription } from '../services/geminiService';
import MealSetupInput from './MealSetupInput';

interface ProfileProps {
  userProfile: UserProfile;
  onSave: (profile: UserProfile) => void;
  onBack: () => void;
  onLogout: () => void;
}
type MealKey = 'breakfast' | 'lunch' | 'dinner';

const InfoPill: React.FC<{ label: string, value: string | number }> = ({ label, value }) => (
    <div>
        <label className="text-xs text-white/80">{label}</label>
        <div className="bg-black/20 mt-1 p-3 rounded-xl text-center font-semibold">{value}</div>
    </div>
);

const MealPill: React.FC<{ label: string, value: string }> = ({ label, value }) => (
     <div>
        <label className="text-sm font-semibold text-white">{label}</label>
        <div className="bg-black/20 mt-1 p-3 rounded-xl text-sm text-white/90">{value}</div>
    </div>
);

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


const Profile: React.FC<ProfileProps> = ({ userProfile, onSave, onBack, onLogout }) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [profileData, setProfileData] = useState<UserProfile>(userProfile);
  const [mealDescriptions, setMealDescriptions] = useState({ 
      breakfast: userProfile.standardMeals.breakfast.map(m => m.name).join(', '),
      lunch: userProfile.standardMeals.lunch.map(m => m.name).join(', '),
      dinner: userProfile.standardMeals.dinner.map(m => m.name).join(', '),
  });
  const [isParsing, setIsParsing] = useState<Partial<Record<MealKey, boolean>>>({});
  
  const handleInputChange = (field: keyof UserProfile, value: string) => {
      setProfileData(prev => ({ ...prev, [field]: value }));
  }

  const handleSave = () => {
      const { name, age, weight, height, idealWeight } = profileData;
      if (!name || !age || !weight || !height || !idealWeight) {
          alert('Please fill all personal information fields.');
          return;
      }
      onSave(profileData);
      setIsEditMode(false);
  }
  
  const handleCancel = () => {
      setProfileData(userProfile);
      setIsEditMode(false);
  }

  const toggleCategory = (categoryName: string) => {
    setProfileData(prev => {
        const favoriteCategoryNames = prev.favoriteCategoryNames.includes(categoryName)
        ? prev.favoriteCategoryNames.filter(name => name !== categoryName)
        : [...prev.favoriteCategoryNames, categoryName];
        return { ...prev, favoriteCategoryNames };
    });
  };

  const handleParseMeal = async (mealType: MealKey) => {
    const description = mealDescriptions[mealType];
    if (!description) {
        setProfileData(prev => ({...prev, standardMeals: {...prev.standardMeals, [mealType]: []}}));
        return;
    };

    setIsParsing(prev => ({ ...prev, [mealType]: true }));
    const parsedItems = await parseStandardMealDescription(description);
    if (parsedItems) {
        setProfileData(prev => ({...prev, standardMeals: {...prev.standardMeals, [mealType]: parsedItems }}));
    } else {
        alert(`Could not analyze ${mealType}. Please try a different description.`);
    }
    setIsParsing(prev => ({ ...prev, [mealType]: false }));
  }
  
  const inputClasses = "w-full bg-pleasant-green-700/60 border-2 border-pleasant-green-500/60 rounded-lg p-2 text-sm text-white placeholder-pleasant-green-100/70 focus:outline-none focus:border-pleasant-green-200 transition";

  return (
    <div className="min-h-screen text-white p-4">
      <header className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
            <button onClick={isEditMode ? handleCancel : onBack} className="text-white/80 hover:text-white transition">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <h1 className="text-2xl font-bold">Profile</h1>
        </div>
        <div className="flex items-center gap-4">
            {isEditMode ? (
                <button onClick={handleSave} className="flex items-center gap-1 text-white/80 hover:text-white transition font-bold">
                    Save
                </button>
            ) : (
                <button onClick={() => setIsEditMode(true)} className="flex items-center gap-1 text-white/80 hover:text-white transition">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
                    Edit
                </button>
            )}
            <button onClick={onLogout} className="text-white/80 hover:text-white transition">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" /></svg>
            </button>
        </div>
      </header>

      <div className="max-w-xl mx-auto space-y-8">
        <div className="bg-pleasant-green-700/50 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/20 space-y-4">
            <h2 className="font-semibold text-lg">Personal Information</h2>
            {isEditMode ? (
                <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-xs">Name</label><input type="text" value={profileData.name} onChange={e => handleInputChange('name', e.target.value)} className={inputClasses} /></div>
                    <div><label className="text-xs">Age</label><input type="number" value={profileData.age} onChange={e => handleInputChange('age', e.target.value)} className={inputClasses} /></div>
                    <div><label className="text-xs">Weight (kg)</label><input type="number" value={profileData.weight} onChange={e => handleInputChange('weight', e.target.value)} className={inputClasses} /></div>
                    <div><label className="text-xs">Height (cm)</label><input type="number" value={profileData.height} onChange={e => handleInputChange('height', e.target.value)} className={inputClasses} /></div>
                    <div><label className="text-xs">Ideal Wt. (kg)</label><input type="number" value={profileData.idealWeight} onChange={e => handleInputChange('idealWeight', e.target.value)} className={inputClasses} /></div>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-4">
                    <InfoPill label="Name" value={profileData.name} />
                    <InfoPill label="Age" value={`${profileData.age} years`} />
                    <InfoPill label="Weight" value={`${profileData.weight} kg`} />
                    <InfoPill label="Height" value={`${profileData.height} cm`} />
                    <InfoPill label="Ideal Weight" value={`${profileData.idealWeight} kg`} />
                    <InfoPill label="Goal" value={`${profileData.dailyCalorieGoal} kcal`} /> 
                </div>
            )}
        </div>

        <div className="bg-pleasant-green-700/50 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/20 space-y-4">
            <h2 className="font-semibold text-lg">Standard Meals</h2>
            {isEditMode ? (
                <div className="space-y-4">
                    <MealSetup mealType="breakfast" title="Usual Breakfast" mealDescriptions={mealDescriptions} setMealDescriptions={setMealDescriptions} standardMeals={profileData.standardMeals} handleParseMeal={handleParseMeal} isParsing={!!isParsing.breakfast} />
                    <MealSetup mealType="lunch" title="Usual Lunch" mealDescriptions={mealDescriptions} setMealDescriptions={setMealDescriptions} standardMeals={profileData.standardMeals} handleParseMeal={handleParseMeal} isParsing={!!isParsing.lunch} />
                    <MealSetup mealType="dinner" title="Usual Dinner" mealDescriptions={mealDescriptions} setMealDescriptions={setMealDescriptions} standardMeals={profileData.standardMeals} handleParseMeal={handleParseMeal} isParsing={!!isParsing.dinner} />
                </div>
            ) : (
                <div className="space-y-3">
                    <MealPill label="Breakfast" value={profileData.standardMeals.breakfast.map(m => m.name).join(', ') || 'Not set'} />
                    <MealPill label="Lunch" value={profileData.standardMeals.lunch.map(m => m.name).join(', ') || 'Not set'} />
                    <MealPill label="Dinner" value={profileData.standardMeals.dinner.map(m => m.name).join(', ') || 'Not set'} />
                </div>
            )}
        </div>

         <div className="bg-pleasant-green-700/50 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/20 space-y-4">
            <h2 className="font-semibold text-lg">Favorite Categories</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {MASTER_FOOD_CATEGORIES.flatMap(g=>g.items).map(cat => (
                    <button key={cat.name} type="button" onClick={() => isEditMode && toggleCategory(cat.name)} className={`p-2 rounded-lg text-left transition-all duration-200 ${profileData.favoriteCategoryNames.includes(cat.name) ? 'bg-white text-pleasant-green-800' : 'bg-black/20'} ${isEditMode ? 'cursor-pointer hover:scale-105' : 'cursor-default'}`}>
                        <span className="text-xl block">{cat.emoji}</span>
                        <span className="font-semibold text-xs">{cat.name}</span>
                    </button>
                ))}
            </div>
             {!isEditMode && <p className="text-xs text-white/70 text-center">Click 'Edit' above to change your favorites.</p>}
        </div>
      </div>
    </div>
  );
};

export default Profile;