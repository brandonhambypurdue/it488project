import React from 'react';
import './ProgressPlot.css';

export default function ManualGraph({ data, selectedHabit }) {
  const maxValue = Math.max(...data.values, 1);
  const avg = data.values.reduce((a, b) => a + b, 0) / data.values.length;
  const bestValue = Math.max(...data.values);

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
  function capitalizeFirst(str) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : "";
}
function formatHabitLabel(str) {
  const labelMap = {
    self_reflection: "Self Reflection",
    lets_break_a_habit: "Breaking a Habit"
  };

  if (!str) return "";

  return labelMap[str] || capitalizeFirst(str.replace(/_/g, " "));
}


  return (
    <div className="plotHolder">
       <h4>Daily Progress for {formatHabitLabel(selectedHabit)}</h4>

      {/* 📊 Average Line with Label */}
      <div
        className="weeklyAverageLine"
        style={{ bottom: `${(avg / maxValue) * 74}%` }}
        title={`📊 Weekly Avg: ${avg.toFixed(1)} hrs`}
      >
        <span className="averageLabel">Your average {avg.toFixed(1)}</span>
      </div>

      <div className="progressBars">
        {data.values.map((val, index) => {
          const height = `${(val / maxValue) * 15}vw`;
          const color = getBarColor(val);
          const isBest = val === bestValue;

          return (
            <div key={index} className="barContainer">
              <div className="barValue">{val}</div>
              <div
                className={`progressBar ${isBest ? 'bestWeek' : ''}`}
                style={{ height, backgroundColor: color }}
                title={isBest ? `🏆 Best week: ${val} hrs!` : `${data.labels[index]}: ${val} hrs`}
              />
              <h5 className="dayLabel">{data.labels[index]}</h5>
            </div>
          );
        })}
      </div>
    </div>
  );
}

