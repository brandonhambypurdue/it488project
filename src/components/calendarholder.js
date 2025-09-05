import React, { useEffect, useState } from 'react';
import axios from 'axios';
import TimeButtonGroup from './timetrack';
import RandomQuote from '../randomquote';

export default function CalendarHolder() {
  const [view, setView] = useState('daily');
  const [dayInfo, setDayInfo] = useState({});
  const days = [
    'monday','tuesday','wednesday',
    'thursday','friday','saturday','sunday'
  ];



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
   


  // Debug: confirm which view is active
  console.log('Current view:', view);

  return (
    <div className="calendarPage">
      <TimeButtonGroup view={view} onChange={setView} />

      <div className="calendarHolder">
        {view === 'daily' && (
          <div className="weekDaysHolder">
            {days.map(day => (
              <div key={day} className={day}>
                <h4>{day.charAt(0).toUpperCase() + day.slice(1)}</h4>
                <br />
                <span className="dayDescHolder">
                  {dayInfo[day] ?? 'Loading...'}
                    <button type='button' className='addDayInfo'>Add info</button>
                </span>
                
              </div>
            ))}
            <div className='randomQuote'><span><RandomQuote></RandomQuote></span></div>
          </div>
        )}

        {view === 'weekly' && (
          <div className="weeksHolder">
            <div className="week1"><h4>Week1</h4><br />
              <span className="weekdesc">This weeks information</span>
            </div>
            <div className="week2"><h4>Week2</h4><br />
              <span className="weekdesc">This weeks information</span>
            </div>
            <div className="week3"><h4>Week3</h4><br />
              <span className="weekdesc">This weeks information</span>
            </div>
            <div className="week4"><h4>Week4</h4><br />
              <span className="weekdesc">This weeks information</span>
            </div>
          </div>
        )}

        {view === 'monthly' && (
          <div className="monthsHolder">
            {[
              'January','February','March','April','May','June',
              'July','August','September','October','November','December'
            ].map((month, idx) => (
              <div key={month} className="Month">
                <h4>{month}</h4>
                <h5>Your Progress this month</h5>
                <div className="percentages">
                  <h5>0%</h5><h5>100%</h5>
                </div>
                <div className="progressBorder">
                  <div id={`progressBar${idx+1}`}></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}