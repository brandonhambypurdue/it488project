// App.js
import './App.css';
import './components/displayDateTime.js';
import React, { useState, useEffect } from 'react';
import TimeButtonGroup from './components/timetrack.js';
import AddButton from './components/additionButton.js';
import CalendarHolder from './components/calendarholder.js';
import HabitTracking from './components/habitList.js';
import ProgressGraph from './components/graph.js';
import Login from './components/loginPop.js';
import LogoutButton from './components/LogoutButton.js';
import GraphDisplay from './components/graphDisplay.js';

function App() {
  const [showSettings, setShowSettings] = useState(false);
  
  // Tracks logged-in user
  const [user, setUser] = useState(null);

  // Tracks which habit is selected (default: studying)
  const [selectedHabit, setSelectedHabit] = useState('study');
  const [viewMode, setViewMode] = useState('daily');

  // Stores full habit data for the logged-in user
  const [habitData, setHabitData] = useState([]);

  // Persist login across refreshes
  useEffect(() => {
    const savedUser = localStorage.getItem('username');
    if (savedUser) setUser(savedUser);
  }, []);

  // Handle login from Login component
  const handleLogin = (username) => {
    localStorage.setItem('username', username);
    setUser(username);
  };

  // Handle logout and clear session
  const handleLogout = async () => {
    try {
      await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include', // if using cookies/session
      });
    } catch (err) {
      console.error('Logout error:', err);
    }

    localStorage.removeItem('username');
    setUser(null);
  };
  useEffect(() => {
  console.log('Habit Data in App:', habitData);
}, [habitData]);


  return (
    <div className="mainPage">
      {!user ? (
        // Show login screen only
        <Login onLogin={handleLogin} />
      ) : (
        // Show full dashboard once logged in
        <>
          <h1 className="welcome">
            Good afternoon, <span>{user}</span>
          </h1>

          <LogoutButton onLogout={handleLogout} />

          <AddButton />
          
      <CalendarHolder
       username={user}
       selectedHabit={selectedHabit}
       onHabitsFetched={setHabitData}
       view={viewMode}
       onViewChange={setViewMode}
         />
          <HabitTracking onSelectHabit={setSelectedHabit} />

          <GraphDisplay
           username={user}
           selectedHabit={selectedHabit}
           view={viewMode}
          />


          
        </>
      )}
    </div>
  );
}

export default App;
