import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProgressGraph from './graph';
import WeeklyProgressGraph from './WeeklyProgressgraph';
import MonthlyProgressGraph from './MonthlyProgressGraph';
import TimeButtonGroup from './timetrack';
import './ProgressPlot.css';

export default function GraphDisplay({ username, selectedHabit, view }) {


  const [habitData, setHabitData] = useState([]);

  useEffect(() => {
    async function fetchHabits() {
      try {
        const res = await axios.get(`http://localhost:5000/api/habits/${username}`);
        setHabitData(res.data.habits);
      } catch (err) {
        console.error("Error fetching habits:", err);
      }
    }

    if (username) {
      fetchHabits();
    }
  }, [username]);

  return (
    
    <div className="graphDisplay">
     

     {view === 'daily' && <ProgressGraph scores={habitData} selectedHabit={selectedHabit} />}
{view === 'weekly' && <WeeklyProgressGraph scores={habitData} selectedHabit={selectedHabit} />}
{view === 'monthly' && (
  <MonthlyProgressGraph habits={habitData} selectedHabit={selectedHabit} />
)}

    </div>
  );
}
