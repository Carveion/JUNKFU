import React, { useState, useEffect, useMemo } from 'react';
import { MealType, FoodEntry, UserProfile, Quantity, StandardMeal, Category } from '../types';
import { QUANTITY_MULTIPLIERS, MASTER_FOOD_CATEGORIES } from '../constants';
import { getCaloriesForFood } from '../services/geminiService';


interface AddFoodModalProps {
  onClose: () => void;
  onAddFood: (entry: Omit<FoodEntry, 'id'|'timestamp'>) => void;
  onEditFood: (entry: FoodEntry) => void;
  userProfile: UserProfile;
  entryToEdit: FoodEntry | null;
  initialMealType: MealType | null;
}

const allCategoriesFlat = MASTER_FOOD_CATEGORIES.flatMap(g => g.items);

const LoadingIndicator: React.FC = () => (
    <div className="flex items-center justify-center space-x-2">
        <div className="w-2 h-2 rounded-full bg-white animate-pulse [animation-delay:-0.3s]"></div>
        <div className="w-2 h-2 rounded-full bg-white animate-pulse [animation-delay:-0.15s]"></div>
        <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
    </div>
);

type ActiveTab = 'quick' | 'category' | 'custom';

const AddFoodModal: React.FC<AddFoodModalProps> = ({ onClose, onAddFood, onEditFood, userProfile, entryToEdit, initialMealType }) => {
  const [mealType, setMealType] = useState<MealType>(MealType.Breakfast);
  const [activeTab, setActiveTab] = useState<ActiveTab>('quick');
  
  const [selectedQuickAdd, setSelectedQuickAdd] = useState<StandardMeal | null>(null);
  const [quickAddQuantity, setQuickAddQuantity] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  
  const [quantityMode, setQuantityMode] = useState<'serving' | 'pcs'>('serving');
  const [servingQuantity, setServingQuantity] = useState<Quantity>('Medium');
  const [numericQuantity, setNumericQuantity] = useState<number | string>(1);

  const [customDescription, setCustomDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const SERVING_GRAMS: Record<Quantity, string> = {
    'Small': '~75g',
    'Medium': '~150g',
    'Large': '~225g',
    'Extra Large': '~300g'
  };
  
  const { favoriteCategories, otherCategories } = useMemo(() => {
    const favorites = allCategoriesFlat.filter(c => userProfile.favoriteCategoryNames.includes(c.name));
    const others = allCategoriesFlat.filter(c => !userProfile.favoriteCategoryNames.includes(c.name));
    return { favoriteCategories: favorites, otherCategories: others };
  }, [userProfile.favoriteCategoryNames]);

  useEffect(() => {
    if (entryToEdit) {
      // This is a simplified edit flow. For a full implementation, more state would need to be restored.
      setMealType(entryToEdit.mealType);
      if (entryToEdit.isCustom) {
        setActiveTab('custom');
        setCustomDescription(entryToEdit.name);
      } else {
        setActiveTab('category');
        const cat = allCategoriesFlat.find(c => c.name === entryToEdit.name);
        setSelectedCategory(cat || null);
        if (typeof entryToEdit.quantity === 'number') {
            setQuantityMode('pcs');
            setNumericQuantity(entryToEdit.quantity);
        } else {
            setQuantityMode('serving');
            setServingQuantity(entryToEdit.quantity);
        }
      }
    } else if (initialMealType) {
      setMealType(initialMealType);
    }
  }, [entryToEdit, initialMealType, userProfile.standardMeals]);
  
  const handleTabClick = (tab: ActiveTab) => {
    setActiveTab(tab);
    setSelectedCategory(null);
    setSelectedQuickAdd(null);
    setCustomDescription('');
    setQuickAddQuantity(1);
  }

  const handleSelectQuickAdd = (item: StandardMeal) => {
      setSelectedQuickAdd(item);
      setQuickAddQuantity(1);
  }

  const handleSave = async () => {
    let finalEntry: Omit<FoodEntry, 'id'|'timestamp'> | null = null;
    
    if (activeTab === 'custom' && customDescription.trim()) {
        setIsAnalyzing(true);
        const result = await getCaloriesForFood(customDescription);
        if(result) {
            finalEntry = {
                name: result.foodName, calories: result.calories, baseCalories: result.calories,
                quantity: 1, quantityUnit: 'pcs', quantity_label: `1 serving`,
                mealType, isCustom: true, assumedGrams: result.assumedGrams
            };
        } else {
            alert("Could not analyze food. Please try a different description.");
        }
        setIsAnalyzing(false);
    } else if (activeTab === 'category' && selectedCategory) {
        let calories = selectedCategory.calories;
        let quantity_label = 'Medium';
        let quantity: Quantity | number = 'Medium';
        let quantityUnit: 'serving' | 'pcs' = 'serving';

        if(quantityMode === 'serving') {
            calories = Math.round(selectedCategory.calories * QUANTITY_MULTIPLIERS[servingQuantity]);
            quantity_label = servingQuantity;
            quantity = servingQuantity;
        } else { // pcs
            calories = Math.round(selectedCategory.calories * Number(numericQuantity));
            quantity_label = `${numericQuantity} pcs`;
            quantity = Number(numericQuantity);
            quantityUnit = 'pcs';
        }
        finalEntry = { name: selectedCategory.name, calories, baseCalories: selectedCategory.calories, quantity, quantityUnit, quantity_label, mealType, isCustom: false };
    } else if (activeTab === 'quick' && selectedQuickAdd) {
        const totalCalories = Math.round(selectedQuickAdd.calories * quickAddQuantity);
        finalEntry = { name: selectedQuickAdd.name, calories: totalCalories, baseCalories: selectedQuickAdd.calories, quantity: quickAddQuantity, quantityUnit: 'pcs', quantity_label: `${quickAddQuantity} x ${selectedQuickAdd.name}`, mealType, isCustom: false };
    }
    
    if (finalEntry) {
        if (entryToEdit) {
            onEditFood({ ...finalEntry, id: entryToEdit.id, timestamp: entryToEdit.timestamp });
        } else {
            onAddFood(finalEntry);
        }
        onClose();
    }
  };

  const isSaveDisabled = (activeTab === 'quick' && !selectedQuickAdd) || (activeTab === 'category' && !selectedCategory) || (activeTab === 'custom' && !customDescription.trim());

  const TabButton: React.FC<{tabId: ActiveTab, children: React.ReactNode}> = ({tabId, children}) => (
    <button onClick={() => handleTabClick(tabId)} className={`flex-1 p-2 rounded-full text-sm font-semibold transition ${activeTab === tabId ? 'bg-white text-pleasant-green-700' : 'bg-transparent text-white/70 hover:bg-black/10'}`}>
        {children}
    </button>
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="bg-pleasant-green-700 w-full max-w-md rounded-3xl shadow-2xl p-6 text-white border border-white/20 space-y-5">
        <div className="flex justify-between items-start">
            <h2 className="text-2xl font-bold">{entryToEdit ? 'Edit Entry' : 'Track Your Meal'}</h2>
            <button onClick={onClose} className="text-3xl text-white/70 hover:text-white">&times;</button>
        </div>
        
        <div>
            <label className="text-sm font-semibold mb-2 block">Meal Type</label>
            <div className="grid grid-cols-4 gap-2">
                 {Object.values(MealType).map(type => (
                    <button key={type} onClick={() => setMealType(type)} className={`p-2 rounded-full text-sm font-semibold transition ${mealType === type ? 'bg-white text-pleasant-green-700' : 'bg-black/20 hover:bg-black/30'}`}>
                        {type}
                    </button>
                 ))}
            </div>
        </div>
        
        <div className="p-1 bg-black/20 rounded-full flex gap-1">
            <TabButton tabId="quick">Quick Add</TabButton>
            <TabButton tabId="category">Categories</TabButton>
            <TabButton tabId="custom">Custom AI</TabButton>
        </div>

        <div className="min-h-[200px]">
        {activeTab === 'quick' && (
            <div className="space-y-2 max-h-56 overflow-y-auto">
                <h3 className="font-semibold text-sm text-white/80">Your Standard Meals</h3>
                {Object.values(userProfile.standardMeals).flat().length === 0 && <p className="text-sm text-white/60 italic text-center py-8">No standard meals set up yet.</p>}
                {Object.entries(userProfile.standardMeals).map(([meal, items]) => items.length > 0 && (
                    <div key={meal}>
                         <h4 className="text-xs font-bold uppercase text-white/50">{meal}</h4>
                         {items.map(item => (
                             <div key={item.name} className={`w-full text-left p-3 rounded-lg mt-1 transition flex flex-col ${selectedQuickAdd?.name === item.name ? 'bg-pleasant-green-500' : 'bg-black/20'}`}>
                                <button onClick={() => handleSelectQuickAdd(item)} className="w-full">
                                     <div className="flex justify-between">
                                         <span>{item.name}</span>
                                         <span className="font-semibold">{item.calories} kcal</span>
                                     </div>
                                 </button>
                                 {selectedQuickAdd?.name === item.name && (
                                     <div className="flex items-center justify-center gap-4 mt-3 pt-3 border-t border-white/10">
                                         <button onClick={() => setQuickAddQuantity(q => Math.max(1, q - 1))} className="w-8 h-8 rounded-full bg-black/20 font-bold text-lg">-</button>
                                         <span className="font-bold text-lg w-10 text-center">{quickAddQuantity}</span>
                                         <button onClick={() => setQuickAddQuantity(q => q + 1)} className="w-8 h-8 rounded-full bg-black/20 font-bold text-lg">+</button>
                                     </div>
                                 )}
                             </div>
                         ))}
                    </div>
                ))}
            </div>
        )}
        {activeTab === 'category' && (
             <div className="space-y-4 max-h-56 overflow-y-auto pr-2">
                <div>
                    <h3 className="font-semibold text-sm text-white/80 mb-2">Favorites</h3>
                    <div className="grid grid-cols-3 gap-2">
                        {favoriteCategories.map(cat => (
                            <button key={cat.name} onClick={() => setSelectedCategory(cat)} className={`p-2 rounded-lg text-center transition flex flex-col justify-center items-center h-24 ${selectedCategory?.name === cat.name ? 'bg-pleasant-green-500' : 'bg-black/20 hover:bg-black/30'}`}>
                                {cat.emoji && <span className="text-2xl block">{cat.emoji}</span>}
                                <span className="text-xs font-semibold mt-1">{cat.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
                 <div>
                    <h3 className="font-semibold text-sm text-white/80 mb-2 mt-2">All Categories</h3>
                    <div className="grid grid-cols-3 gap-2">
                        {otherCategories.map(cat => (
                            <button key={cat.name} onClick={() => setSelectedCategory(cat)} className={`p-2 rounded-lg text-center transition flex flex-col justify-center items-center h-24 ${selectedCategory?.name === cat.name ? 'bg-pleasant-green-500' : 'bg-black/20 hover:bg-black/30'}`}>
                                {cat.emoji && <span className="text-2xl block">{cat.emoji}</span>}
                                <span className="text-xs font-semibold mt-1">{cat.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        )}
        {activeTab === 'custom' && (
            <div>
                 <textarea
                    value={customDescription}
                    onChange={e => setCustomDescription(e.target.value)}
                    placeholder="e.g., Two large samosas with chutney"
                    rows={3}
                    className="w-full bg-black/20 border-2 border-transparent rounded-lg p-3 text-white placeholder-white/60 focus:outline-none focus:border-pleasant-green-400 transition"
                />
                <button onClick={handleSave} className="mt-3 w-full flex items-center justify-center gap-2 bg-pleasant-green-500 text-white font-bold p-3 rounded-lg hover:bg-pleasant-green-400 transition animate-pulse disabled:opacity-50" disabled={!customDescription.trim() || isAnalyzing}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v1h-2V4H7v1H5V4zM6 7v1h8V7H6zM3 9a2 2 0 012-2h10a2 2 0 012 2v7a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /></svg>
                    {isAnalyzing ? <LoadingIndicator/> : 'Analyze'}
                </button>
            </div>
        )}
        </div>
        
        {activeTab === 'category' && selectedCategory && (
            <div>
                <label className="text-sm font-semibold mb-2 block">Quantity for <span className="font-bold">{selectedCategory.name}</span></label>
                <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => setQuantityMode('serving')} className={`p-2 rounded-full text-sm font-semibold transition ${quantityMode === 'serving' ? 'bg-white text-pleasant-green-700' : 'bg-black/20 hover:bg-black/30'}`}>Serving</button>
                    <button onClick={() => setQuantityMode('pcs')} className={`p-2 rounded-full text-sm font-semibold transition ${quantityMode === 'pcs' ? 'bg-white text-pleasant-green-700' : 'bg-black/20 hover:bg-black/30'}`}>Pieces</button>
                </div>
                 <div className="mt-2">
                    {quantityMode === 'serving' && (
                        <div className="grid grid-cols-4 gap-2">
                            {(Object.keys(SERVING_GRAMS) as Quantity[]).map(q => (
                                <button key={q} onClick={() => setServingQuantity(q)} className={`p-2 rounded-lg text-sm font-semibold transition ${servingQuantity === q ? 'bg-pleasant-green-500 text-white' : 'bg-black/20 hover:bg-black/30'}`}>
                                    {q}
                                    <span className="text-xs block text-white/60">{SERVING_GRAMS[q]}</span>
                                </button>
                            ))}
                        </div>
                    )}
                     {quantityMode === 'pcs' && (
                        <input
                            type="number"
                            value={numericQuantity}
                            onChange={e => setNumericQuantity(e.target.value)}
                            className="w-full p-2 bg-black/20 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-pleasant-green-400"
                            placeholder="e.g., 2"
                        />
                    )}
                </div>
            </div>
        )}
        
        {activeTab !== 'custom' && (
            <div className="flex gap-3 pt-4">
                <button onClick={onClose} className="flex-1 p-3 bg-black/20 rounded-full text-sm font-semibold hover:bg-black/30 transition">Cancel</button>
                <button onClick={handleSave} className="flex-1 p-3 bg-white text-pleasant-green-700 rounded-full text-sm font-semibold hover:bg-pleasant-green-100 transition disabled:opacity-50" disabled={isSaveDisabled}>
                    {entryToEdit ? 'Save Changes' : 'Add Entry'}
                </button>
            </div>
        )}

      </div>
    </div>
  );
};

export default AddFoodModal;
