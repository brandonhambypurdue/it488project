import './App.css';
import React, { useState, useEffect } from 'react';
import CalendarHolder from './components/calendarholder.js';
import HabitTracking from './components/habitList.js';
import Login from './components/loginPop.js';
import LogoutButton from './components/LogoutButton.js';
import GraphDisplay from './components/graphDisplay.js';

function App() {
  const [user, setUser] = useState(null);
  const [selectedHabit, setSelectedHabit] = useState('study');
  const [viewMode, setViewMode] = useState('daily');
  const [weeklySummary, setWeeklySummary] = useState({});
  const [dailyData, setDailyData] = useState([]);
  const [weekTotals, setWeekTotals] = useState([]);
  const [monthlyTotals, setMonthlyTotals] = useState({});

  // Restore user from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Handle login
  const handleLogin = (username, password) => {
    const userObj = { username, password };
    setUser(userObj);
    localStorage.setItem('user', JSON.stringify(userObj));
    console.log("👤 Logged in user:", userObj);
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST', credentials: 'include' });
    } catch (err) {
      console.error('Logout error:', err);
    }
    localStorage.removeItem('user');
    setUser(null); // ✅ This now triggers a full re-render
  };

  return (
    <div className="mainPage">
      {!user ? (
        <Login onLogin={handleLogin} />
      ) : (
        <>
          <h1 className="welcome">
            Good afternoon, <span>{user.username}</span>
          </h1>

          {/* ✅ Always passes fresh reference */}
          <LogoutButton onLogout={() => handleLogout()} />

          <CalendarHolder
            user={user}
            selectedHabit={selectedHabit}
            view={viewMode}
            onViewChange={setViewMode}
            setDailyData={setDailyData}
            setWeekTotals={setWeekTotals}
            setMonthlyTotals={setMonthlyTotals}
            dailyData={dailyData}
            monthlyTotals={monthlyTotals}
            weekTotals={weekTotals}
          />

          <HabitTracking
            onSelectHabit={setSelectedHabit}
            selectedHabit={selectedHabit}
          />

          <GraphDisplay
            username={user.username}
            password={user.password}
            selectedHabitName={selectedHabit?.name}
            selectedHabit={selectedHabit}
            view={viewMode}
            weeklySummary={weeklySummary}
            dailyData={dailyData}
            weekTotals={weekTotals}
            monthlyTotals={monthlyTotals}
          />
        </>
      )}
    </div>
  );
}

export default App;

