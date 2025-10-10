import React from 'react';
import './ProgressPlot.css';

export default function ProgressGraph({ data, selectedHabit }) {
  const { labels = [], values = [] } = data || {};
  const maxValue = Math.max(...values, 1);
  const avg = values.reduce((a, b) => a + b, 0) / values.length;

  const getBarColor = (val) => {
    const ratio = val / maxValue;
    if (ratio <= 0.5) {
      const g = Math.round(255 * (ratio / 0.5));
      return `rgb(255, ${g}, 0)`; // red → yellow
    } else {
      const r = Math.round(255 * (1 - (ratio - 0.5) / 0.5));
      return `rgb(${r}, 255, 0)`; // yellow → green
    }
  };

  const bestValue = Math.max(...values);
  const trendArrows = values.map((val, i) => {
    if (i === 0) return '';
    const prev = values[i - 1];
    if (val > prev) return '⬆️';
    if (val < prev) return '⬇️';
    return '➡️';
  });

  function capitalizeFirst(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : "";
}



  return (
    <div className='plotHolder'>
      <h4>Daily Progress for {capitalizeFirst(selectedHabit)}</h4>

      {/* 📊 Average Line */}
      <div
  className='averageLine'
  style={{ bottom: `${(avg / maxValue) * 100}%` }}
  title={`📊 Daily Avg: ${avg.toFixed(1)} hrs`}
>
  <span className='averageLabel'>{avg.toFixed(1)}</span>
</div>



      <div className='progressBars'>
        {labels.map((label, i) => {
          const value = values[i] ?? 0;
          const height = `${(value / maxValue) * 17}vw`;
          const color = getBarColor(value);
          const isBest = value === bestValue;

          return (
            <div key={label} className='barContainer'>
              {/* ⬆️⬇️➡️ Trend Arrow */}
              <div className='trendArrow'>{trendArrows[i]}</div>

              {/* Bar Value */}
              <div className='barValue'>{value}</div>

              {/* Bar anchored to bottom */}
              <div className='barAnchor'>
                <div
                  className={`progressBar ${isBest ? 'bestWeek' : ''}`}
                  style={{ height, backgroundColor: color }}
                  title={isBest ? `🏆 Best day: ${value} hrs!` : `${label}: ${value} hrs`}
                />
              </div>

              {/* Day Label */}
              <h5 className='dayLabel'>{label}</h5>
            </div>
          );
        })}
      </div>
    </div>
  );
}

