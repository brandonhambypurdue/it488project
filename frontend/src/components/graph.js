import React from 'react';
import './ProgressPlot.css';

export default function ProgressGraph({ scores, selectedHabit }) {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  // Normalize day names for lookup
  const habitMap = scores.reduce((acc, entry) => {
    acc[entry.day.toLowerCase()] = entry;
    return acc;
  }, {});

  // Safely calculate max value
  const maxValue = Math.max(...scores.map(h => h[selectedHabit] || 0), 0);

  return (
    <div className='plotHolder'>
      <div className='progressBars'>
        {days.map((day) => {
          const habit = habitMap[day];
          const value = habit?.[selectedHabit] ?? 0;
          const height = `${(value / maxValue) * 17}vw`;

          return (
            <div key={day} className='barContainer'>
              <div className='barValue'>{value}</div>
              <div className='progressBar' style={{ height }} />
              <h5 className='dayLabel'>{day.charAt(0).toUpperCase() + day.slice(1)}</h5>
            </div>
          );
        })}
      </div>
    </div>
  );
}
