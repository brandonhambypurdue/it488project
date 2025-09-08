import './App.css';
import './components/displayDateTime.js';
import React, { useState, useEffect } from 'react';
import TimeButtonGroup from './components/timetrack.js';
import AddButton from './components/additionButton.js';
import CalendarHolder from './components/calendarholder.js';
import HabitTracking from './components/habitList.js';
import ProgressGraph from './components/graph.js';
import Login from './components/loginPop.js';


function App() {
const [showSettings, setShowSettings] = useState(false);


  // Tracks logged-in user
  const [user, setUser] = useState(null);

  // Tracks which habit is selected (default: studying)
  const [selectedHabit, setSelectedHabit] = useState('studying');

  // Stores full habit data for the logged-in user
  const [habitData, setHabitData] = useState([]);

  // Optional: Persist login across refreshes
useEffect(() => {
  const savedUser = localStorage.getItem('username');
  if (savedUser) setUser(savedUser);
}, []);


  const handleLogin = (username) => {
    localStorage.setItem('username', username);
    setUser(username);
  };
  

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

          <AddButton />

          <CalendarHolder
            username={user}
            selectedHabit={selectedHabit}
            onHabitsFetched={setHabitData}
          />

          <HabitTracking onSelectHabit={setSelectedHabit} />
        
          <ProgressGraph
            scores={habitData}
            selectedHabit={selectedHabit}
          />
          
    
        </>
        
        
      )}
    </div>
  );
}
export default App;