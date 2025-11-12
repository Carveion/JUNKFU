import React, { useState, useEffect } from 'react';

interface MealSetupInputProps {
  initialValue: string;
  placeholder: string;
  disabled: boolean;
  onValueChange: (value: string) => void;
}

const MealSetupInput: React.FC<MealSetupInputProps> = ({ initialValue, placeholder, disabled, onValueChange }) => {
  const [inputValue, setInputValue] = useState(initialValue);

  useEffect(() => {
    if (initialValue !== inputValue) {
      setInputValue(initialValue);
    }
  }, [initialValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onValueChange(newValue);
  };

  return (
    <input 
      type="text" 
      value={inputValue}
      onChange={handleChange}
      placeholder={placeholder}
      className="w-full bg-pleasant-green-700/60 border-2 border-pleasant-green-500/60 rounded-lg p-2 text-white placeholder-pleasant-green-100/70 focus:outline-none focus:border-pleasant-green-200 transition"
      disabled={disabled}
    />
  );
};

export default MealSetupInput;