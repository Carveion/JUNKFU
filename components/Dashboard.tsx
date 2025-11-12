import React, { useState, useMemo } from 'react';
import type { UserProfile, FoodEntry } from '../types';
import { MealType } from '../types';
import AddFoodModal from './AddFoodModal';

interface DashboardProps {
  userProfile: UserProfile;
  foodLog: FoodEntry[];
  currentDate: Date;
  changeDate: (offset: number) => void;
  addFoodEntry: (entry: Omit<FoodEntry, 'id' | 'timestamp'>) => void;
  editFoodEntry: (entry: FoodEntry) => void;
  deleteFoodEntry: (entryId: string) => void;
  onNavigateToProfile: () => void;
  onBackToLogin: () => void;
}

const DateChanger: React.FC<{ currentDate: Date, changeDate: (offset: number) => void }> = ({ currentDate, changeDate }) => {
    const isToday = new Date().toDateString() === currentDate.toDateString();
    return (
        <div className="flex items-center justify-center gap-4 text-white">
            <button onClick={() => changeDate(-1)} className="p-2 rounded-full bg-black/10 hover:bg-black/20 transition">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
            </button>
            <h3 className="font-bold text-lg text-center">
                {isToday ? "Today" : currentDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
            </h3>
            <button onClick={() => changeDate(1)} disabled={isToday} className="p-2 rounded-full bg-black/10 hover:bg-black/20 transition disabled:opacity-50">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
            </button>
        </div>
    );
}

const Dashboard: React.FC<DashboardProps> = ({ userProfile, foodLog, currentDate, changeDate, addFoodEntry, editFoodEntry, deleteFoodEntry, onNavigateToProfile, onBackToLogin }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<FoodEntry | null>(null);
  const [initialMealType, setInitialMealType] = useState<MealType | null>(null);

  const totalCaloriesConsumed = useMemo(() => {
    return foodLog.reduce((sum, entry) => sum + entry.calories, 0);
  }, [foodLog]);
  
  const caloriesRemaining = userProfile.dailyCalorieGoal - totalCaloriesConsumed;
  const progressPercentage = Math.min(100, (totalCaloriesConsumed / userProfile.dailyCalorieGoal) * 100);
  const overGoal = caloriesRemaining < 0;

  const handleOpenAddModal = (mealType: MealType) => {
    setInitialMealType(mealType);
    setEditingEntry(null);
    setIsModalOpen(true);
  }

  const handleOpenEditModal = (entry: FoodEntry) => {
    setEditingEntry(entry);
    setInitialMealType(null);
    setIsModalOpen(true);
  }
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingEntry(null);
    setInitialMealType(null);
  }
  
  const entriesByMeal = useMemo(() => {
    return foodLog.reduce((acc, entry) => {
      (acc[entry.mealType] = acc[entry.mealType] || []).push(entry);
      return acc;
    }, {} as Record<MealType, FoodEntry[]>);
  }, [foodLog]);

  return (
    <div className="min-h-screen text-white font-sans p-4 space-y-6 pb-24">
      <header className="flex justify-between items-center">
        <div className="flex items-center gap-2">
            <button onClick={onBackToLogin} className="w-10 h-10 bg-black/10 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/10 hover:bg-black/20 transition">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <h1 className="text-2xl font-display tracking-tight">JUNKFU.</h1>
        </div>
        <button onClick={onNavigateToProfile} className="w-10 h-10 bg-black/10 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/10">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
        </button>
      </header>
      
      <DateChanger currentDate={currentDate} changeDate={changeDate} />

      <div className="bg-pleasant-green-700/50 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/20 space-y-4">
        <div className="flex justify-between items-baseline">
            <p className="font-semibold">Today's Calories</p>
            <p className="text-sm text-white/80">{currentDate.toLocaleDateString(undefined, { weekday: 'long' })}</p>
        </div>
        <div className="text-4xl font-bold">
            <span className={overGoal ? 'text-red-400' : 'text-white'}>{totalCaloriesConsumed}</span>
            <span className="text-3xl text-white/60"> / {userProfile.dailyCalorieGoal} kcal</span>
        </div>
        <div className="w-full bg-black/20 rounded-full h-2.5">
            <div className={`${overGoal ? 'bg-red-500' : 'bg-white'} h-2.5 rounded-full transition-all duration-500`} style={{ width: `${progressPercentage}%` }}></div>
        </div>
        <p className={`text-sm font-semibold ${overGoal ? 'text-red-400' : 'text-white/80'}`}>{overGoal ? `${Math.abs(caloriesRemaining)} kcal over goal!` : `${caloriesRemaining} kcal remaining`}</p>
      </div>
      
      <button onClick={() => setIsModalOpen(true)} className="w-full bg-white text-pleasant-green-700 font-bold py-4 rounded-2xl text-lg flex items-center justify-center gap-2 hover:bg-pleasant-green-100 transition duration-300 transform hover:scale-105 shadow-lg">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
        Track Food
      </button>

      <div className="bg-pleasant-green-700/50 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/20 space-y-4">
        <h3 className="font-semibold text-lg">Food Log</h3>
        {Object.values(MealType).map(meal => (
            <div key={meal}>
                <div className="flex justify-between items-center mb-2">
                    <h4 className="font-bold">{meal}</h4>
                    <button onClick={() => handleOpenAddModal(meal)} className="w-7 h-7 bg-black/10 rounded-full flex items-center justify-center hover:bg-black/20 transition">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                    </button>
                </div>
                {entriesByMeal[meal]?.length > 0 ? (
                    <div className="space-y-2">
                        {entriesByMeal[meal].map(entry => (
                            <div key={entry.id} className="bg-black/10 p-3 rounded-lg flex justify-between items-center">
                                <div>
                                    <p className="font-semibold">{entry.name}</p>
                                    <p className="text-xs text-white/80">
                                      {entry.quantity_label}
                                      {entry.assumedGrams && ` (approx. ${entry.assumedGrams}g)`}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold">{entry.calories} kcal</p>
                                    <div className="flex gap-2 justify-end text-xs">
                                        <button onClick={() => handleOpenEditModal(entry)} className="text-pleasant-green-300 hover:underline">Edit</button>
                                        <button onClick={() => deleteFoodEntry(entry.id)} className="text-red-400 hover:underline">Delete</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-white/70 italic">No entries for {meal}.</p>
                )}
            </div>
        ))}
      </div>
      
      <p className="text-center text-xs text-white/70 mt-4">Disclaimer: Calorie counts are estimates and may vary.</p>
      
      {isModalOpen && <AddFoodModal onClose={handleCloseModal} onAddFood={addFoodEntry} onEditFood={editFoodEntry} userProfile={userProfile} entryToEdit={editingEntry} initialMealType={initialMealType}/>}
    </div>
  );
};

export default Dashboard;