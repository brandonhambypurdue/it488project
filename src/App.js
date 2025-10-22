import './App.css';
import React, { useState, useEffect } from 'react';
import CalendarHolder from './components/calendarholder.js';
import HabitTracking from './components/habitList.js';
import Login from './components/loginPop.js';
import LogoutButton from './components/LogoutButton.js';
import GraphDisplay from './components/graphDisplay.js';
import DeleteAccountModal from './components/deleteAccountBtn.js';

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
  };

  // Handle logout
  const handleLogout = async () => {
    localStorage.removeItem('user');
    setUser(null);

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);

      await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include',
        signal: controller.signal,
      });

      clearTimeout(timeout);
    } catch (err) {
      console.warn('Logout request failed or timed out:', err);
    }
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

          <LogoutButton onLogout={handleLogout} />
          <DeleteAccountModal
            username={user.username}
            password={user.password}
            onTriggerLogin={() => {
              handleLogout(); // clear state
              // Login modal will auto-show since user becomes null
            }}
          />

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

