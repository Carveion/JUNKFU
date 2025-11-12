import React, { useState, useEffect } from 'react';
import { UserProfile, FoodEntry, MealType } from './types';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import Profile from './components/Profile';

type AppView = 'login' | 'onboarding' | 'dashboard' | 'profile';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [foodLog, setFoodLog] = useState<FoodEntry[]>([]);
  const [currentView, setCurrentView] = useState<AppView>('login');

  useEffect(() => {
    const storedLogin = localStorage.getItem('junkfu_isLoggedIn');
    if (storedLogin === 'true') {
      handleLoginSuccess();
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn && userProfile) {
      loadLogForDate(currentDate);
    }
  }, [currentDate, isLoggedIn, userProfile]);
  
  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    localStorage.setItem('junkfu_isLoggedIn', 'true');
    const storedProfile = localStorage.getItem('junkfu_userProfile');
    if (storedProfile) {
      const parsedProfile = JSON.parse(storedProfile);
      setUserProfile(parsedProfile);
      setCurrentView('dashboard');
      loadLogForDate(currentDate);
    } else {
      setCurrentView('onboarding');
    }
  }

  const getLogKeyForDate = (date: Date) => {
    return `junkfu_foodLog_${date.toISOString().split('T')[0]}`;
  }

  const loadLogForDate = (date: Date) => {
    const logKey = getLogKeyForDate(date);
    const storedLog = localStorage.getItem(logKey);
    if (storedLog) {
      setFoodLog(JSON.parse(storedLog));
    } else {
      setFoodLog([]);
    }
  };
  
  const saveLogForDate = (log: FoodEntry[], date: Date) => {
    const logKey = getLogKeyForDate(date);
    localStorage.setItem(logKey, JSON.stringify(log));
  }

  const handleOnboardingComplete = (profile: UserProfile) => {
    setUserProfile(profile);
    localStorage.setItem('junkfu_userProfile', JSON.stringify(profile));
    setCurrentDate(new Date());
    setFoodLog([]); // Start with a fresh log
    setCurrentView('dashboard');
  };
  
  const handleProfileUpdate = (profile: UserProfile) => {
    setUserProfile(profile);
    localStorage.setItem('junkfu_userProfile', JSON.stringify(profile));
    setCurrentView('dashboard');
  }

  const addFoodEntry = (entry: Omit<FoodEntry, 'id' | 'timestamp'>) => {
    const newEntry = {
      ...entry,
      id: `${new Date().getTime()}-${Math.random()}`,
      timestamp: new Date().toISOString(),
    }
    const updatedLog = [...foodLog, newEntry];
    setFoodLog(updatedLog);
    saveLogForDate(updatedLog, currentDate);
  };
  
  const editFoodEntry = (updatedEntry: FoodEntry) => {
    const updatedLog = foodLog.map(entry => entry.id === updatedEntry.id ? updatedEntry : entry);
    setFoodLog(updatedLog);
    saveLogForDate(updatedLog, currentDate);
  }

  const deleteFoodEntry = (entryId: string) => {
    const updatedLog = foodLog.filter(entry => entry.id !== entryId);
    setFoodLog(updatedLog);
    saveLogForDate(updatedLog, currentDate);
  }
  
  const handleLogout = () => {
    // Clear all app-related local storage
    Object.keys(localStorage).forEach(key => {
        if (key.startsWith('junkfu_')) {
            localStorage.removeItem(key);
        }
    });
    setUserProfile(null);
    setFoodLog([]);
    setIsLoggedIn(false);
    setCurrentView('login');
  }
  
  const changeDate = (offset: number) => {
    setCurrentDate(prevDate => {
        const newDate = new Date(prevDate);
        newDate.setDate(newDate.getDate() + offset);
        return newDate;
    });
  }

  const renderView = () => {
    let viewComponent;
    if (!isLoggedIn || currentView === 'login') {
        viewComponent = <Login onLogin={handleLoginSuccess} />;
    } else {
        switch(currentView) {
            case 'onboarding':
                viewComponent = <Onboarding onComplete={handleOnboardingComplete} onBackToLogin={handleLogout} />;
                break;
            case 'profile':
                viewComponent = userProfile ? <Profile userProfile={userProfile} onSave={handleProfileUpdate} onBack={() => setCurrentView('dashboard')} onLogout={handleLogout} /> : <Login onLogin={handleLoginSuccess} />;
                break;
            case 'dashboard':
            default:
                viewComponent = userProfile ? <Dashboard 
                    userProfile={userProfile} 
                    foodLog={foodLog} 
                    currentDate={currentDate}
                    changeDate={changeDate}
                    addFoodEntry={addFoodEntry}
                    editFoodEntry={editFoodEntry}
                    deleteFoodEntry={deleteFoodEntry}
                    onNavigateToProfile={() => setCurrentView('profile')}
                    onBackToLogin={handleLogout}
                /> : <Onboarding onComplete={handleOnboardingComplete} onBackToLogin={handleLogout} />;
                break;
        }
    }
    return <div key={currentView} className="animate-fadeIn">{viewComponent}</div>;
  }

  return <div className="antialiased text-white">{renderView()}</div>;
};

export default App;