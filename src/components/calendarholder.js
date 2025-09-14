import React, { useEffect, useState } from 'react';
import axios from 'axios';
import TimeButtonGroup from './timetrack';
import RandomQuote from './randomquote';
import './CalendarHolder.css'

export default function CalendarHolder({
  username,
  selectedHabit,
  onHabitsFetched,
  view,
  onViewChange
}) {

  
  const [dayInfo, setDayInfo] = useState({});
  const [habits, setHabits] = useState([]);

  const days = [
    'monday', 'tuesday', 'wednesday',
    'thursday', 'friday', 'saturday', 'sunday'
  ];

  // Ping Flask to confirm connection
  useEffect(() => {
    fetch("http://localhost:5000/api/ping")
      .then(res => res.json())
      .then(data => console.log(data.message));
  }, []);

  // Fetch day descriptions
  useEffect(() => {
    async function fetchDayInfo() {
      try {
        const infoMap = {};
        for (const day of days) {
          const { data } = await axios.get(`http://localhost:5000/info/${day}`);
          infoMap[day] = data.description;
        }
        setDayInfo(infoMap);
      } catch (err) {
        console.error('Error fetching day info:', err);
      }
    }
    fetchDayInfo();
  }, []);

  // Fetch habit data for the logged-in user
  useEffect(() => {
    async function fetchHabits() {
      try {
        const res = await axios.get(`http://localhost:5000/api/habits/${username}`);
        setHabits(res.data.habits);
        onHabitsFetched(res.data.habits);
      } catch (err) {
        console.error("Error fetching habits:", err);
      }
    }

    if (username) {
      fetchHabits();
    }
  }, [username]);

  // Map habits by day for easy lookup
  const habitMap = habits.reduce((acc, entry) => {
    acc[entry.day.toLowerCase()] = entry;
    return acc;
  }, {});

  return (
    <div className="calendarPage">
      <TimeButtonGroup view={view} onChange={onViewChange} />


      <div className="calendarHolder">
        {view === 'daily' && (
          <div className="weekDaysHolder">
            {days.map(day => {
              const habit = habitMap[day];
              const value = habit ? habit[selectedHabit] : null;

              return (
                <div key={day} className={day}>
                  <h4>{day.charAt(0).toUpperCase() + day.slice(1)}</h4>
                  <span className="dayDescHolder">
                     {value !== null ? (
                      <p>{selectedHabit.charAt(0).toUpperCase() + selectedHabit.slice(1)}: {value} hrs</p>
                    ) : (
                      <p>No data</p>
                    )}
                    <button type="button" className="addDayInfo">Add info</button>
                  </span>
                  <div className="habitValue">
                   
                  </div>
                </div>
              );
            })}
            <div className="randomQuote">
              <span><RandomQuote /></span>
            </div>
          </div>
        )}

        {view === 'weekly' && (
          <div className="weeksHolder">
            {[1, 2, 3, 4].map(week => (
              <div key={week} className={`week${week}`}>
                <h4>Week {week}</h4>
                <span className="weekdesc">This week's information</span>
              </div>
            ))}
          </div>
        )}

        {view === 'monthly' && (
          <div className="monthsHolder">
            {[
              'January', 'February', 'March', 'April', 'May', 'June',
              'July', 'August', 'September', 'October', 'November', 'December'
            ].map((month, idx) => (
              <div key={month} className="Month">
                <h4>{month}</h4>
                <h5>Your Progress this month</h5>
                <div className="percentages">
                  <h5>0%</h5><h5>100%</h5>
                </div>
                <div className="progressBorder">
                  <div id={`progressBar${idx + 1}`}></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

