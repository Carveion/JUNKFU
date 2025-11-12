import React, { useState, useEffect } from 'react';
import { getCaloriesForFood } from '../services/geminiService';
import type { FoodEntry } from '../types';

interface CustomFoodFormProps {
  onAdd: (name: string, calories: number) => void;
  entryToEdit: FoodEntry | null;
}

const LoadingIndicator: React.FC = () => (
    <div className="flex items-center justify-center space-x-2">
        <div className="w-2 h-2 rounded-full bg-white animate-pulse [animation-delay:-0.3s]"></div>
        <div className="w-2 h-2 rounded-full bg-white animate-pulse [animation-delay:-0.15s]"></div>
        <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
    </div>
);

const CustomFoodForm: React.FC<CustomFoodFormProps> = ({ onAdd, entryToEdit }) => {
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (entryToEdit && entryToEdit.isCustom) {
      setDescription(entryToEdit.name);
    }
  }, [entryToEdit]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setError("Please enter a food description.");
      return;
    }
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await getCaloriesForFood(description);
      if (result) {
        onAdd(result.foodName, result.calories);
      } else {
        setError("Could not estimate calories. Please try a different description.");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="food-description" className="block mb-2 text-sm font-bold text-white/90">
          Describe your food (incl. quantity)
        </label>
        <textarea
          id="food-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g., 'Two large samosas with chutney' or 'A bowl of chicken noodle soup'"
          rows={3}
          className="w-full bg-brand-green-800/60 border-2 border-brand-green-600/60 rounded-lg p-3 text-white placeholder-brand-green-100/70 focus:outline-none focus:border-brand-green-200 transition"
          disabled={isLoading || !!entryToEdit}
        />
        {entryToEdit && <p className="text-xs text-white/70 mt-1">Editing the description/calories of an AI entry requires creating a new entry.</p>}
      </div>
      
      {error && <p className="text-red-300 text-sm">{error}</p>}

      {!entryToEdit && (
        <button 
            type="submit" 
            className="w-full bg-white text-brand-green-800 font-bold py-3 rounded-lg text-lg hover:bg-brand-green-100 transition duration-300 flex items-center justify-center disabled:opacity-50 min-h-[52px]"
            disabled={isLoading}
        >
            {isLoading ? <LoadingIndicator /> : 'Analyze & Add'}
        </button>
      )}
    </form>
  );
};

export default CustomFoodForm;