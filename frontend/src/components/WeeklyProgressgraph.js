import React from 'react';
import './ProgressPlot.css';

export default function WeeklyProgressGraph({ scores, selectedHabit }) {
  // Group scores by week number
  const weekMap = scores.reduce((acc, entry) => {
    const week = entry.week || 1; // default to week 1 if missing
    const value = entry[selectedHabit] ?? 0;

    if (!acc[week]) acc[week] = 0;
    acc[week] += value;

    return acc;
  }, {});

  // Ensure we have 4 weeks, even if some are missing
  const weekTotals = [1, 2, 3, 4].map(week => weekMap[week] || 0);
  const maxValue = Math.max(...weekTotals, 1); // avoid divide-by-zero

  return (
    <div className='plotHolder'>
      <div className='progressBars'>
        {weekTotals.map((total, index) => {
          const height = `${(total / maxValue) * 15}vw`;
          return (
            <div key={index} className='barContainer'>
              <div className='barValue'>{total}</div>
              <div className='progressBar' style={{ height }} />
              <h5 className='dayLabel'>Week {index + 1}</h5>
            </div>
          );
        })}
      </div>
    </div>
  );
}
