import './App.css';
import './components/displayDateTime.js';
import React, { useState, useEffect } from 'react';
import CalendarHolder from './components/calendarholder.js';
import HabitTracking from './components/habitList.js';
import Login from './components/loginPop.js';
import LogoutButton from './components/LogoutButton.js';
import GraphDisplay from './components/graphDisplay.js';

function App() {
  const [showSettings, setShowSettings] = useState(false);
  const [weekTotals, setWeekTotals] = useState([0, 0, 0, 0, 0]);
  const [monthlyTotals, setMonthlyTotals] = useState({});
  const [user, setUser] = useState(null);
  const [selectedHabit, setSelectedHabit] = useState('study');
  const [viewMode, setViewMode] = useState('daily');
  const [habitData, setHabitData] = useState([]);
  
  const [weeklySummary, setWeeklySummary] = useState({
  
 
  });

  // Restore user from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  // Handle login
  const handleLogin = (username, habits, password) => {
    const userObj = { username, password };
    setUser(userObj);
    setHabitData(habits);
    localStorage.setItem('user', JSON.stringify(userObj));
  };

  // Bubble up credentials from CalendarHolder
  const handleCredentials = (creds) => {
    setUser(creds);
    localStorage.setItem('user', JSON.stringify(creds));
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST', credentials: 'include' });
    } catch (err) {
      console.error('Logout error:', err);
    }
    localStorage.removeItem('user');
    setUser(null);
  };

  useEffect(() => {
    console.log('📌 Selected Habit:', selectedHabit);
  }, [selectedHabit]);

  return (
    <div className="mainPage">
      {!user ? (
        <Login onLogin={handleLogin} />
      ) : (
        <>
        <h1 className="welcome">Good afternoon, <span>{user.username}</span></h1>
          <LogoutButton onLogout={handleLogout} />

          <CalendarHolder
            user={user}
            selectedHabit={selectedHabit}
            onHabitsFetched={setHabitData}
            onCredentials={handleCredentials}
            onMonthlyTotals={setMonthlyTotals}
            view={viewMode}
            habitData={habitData}
            onViewChange={setViewMode}
            weekTotals={weekTotals}
            weeklySummary={weeklySummary} // ✅ passes full weekly data
          />

          <HabitTracking
            onSelectHabit={setSelectedHabit}
            selectedHabit={selectedHabit}
          />

          <GraphDisplay
            username={user?.username}
            password={user?.password}
            selectedHabit={selectedHabit}
            view={viewMode}
            habitData={habitData}
            setWeekTotals={setWeekTotals} 
            monthlyTotals={monthlyTotals}
            setWeeklySummary={setWeeklySummary} // ✅ emits weekly data
          />
        </>
      )}
    </div>
  );
}

export default App;

