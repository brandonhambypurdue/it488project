import React, { useMemo } from 'react';
import './ProgressPlot.css';

export default function ManualGraph({ habitData, selectedHabit }) {
  const habitKey = selectedHabit?.toLowerCase();

  // 🔎 Collapse daily values into 5 weekly totals
  const weekTotals = useMemo(() => {
    if (!habitData || habitData.length === 0) return [0, 0, 0, 0, 0];

    const totals = [0, 0, 0, 0, 0];
    for (const row of habitData) {
      const d = row.day;
      if (!d) continue;

      const value = Number(row[habitKey] ?? 0);
      const weekIndex = Math.floor((d - 1) / 7); // 0–4
      if (weekIndex >= 0 && weekIndex < 5) {
        totals[weekIndex] += value;
      }
    }
    return totals;
  }, [habitData, habitKey]);

  const maxValue = Math.max(...weekTotals, 1);

  const getBarColor = (val) => {
    const ratio = val / maxValue;
    if (ratio <= 0.5) {
      const g = Math.round(255 * (ratio / 0.5));
      return `rgb(255, ${g}, 0)`;
    } else {
      const r = Math.round(255 * (1 - (ratio - 0.5) / 0.5));
      return `rgb(${r}, 255, 0)`;
    }
  };

  return (
    <div className="plotHolder">
      <h3>{selectedHabit} Weekly Progress</h3>

      <div className="progressBars">
        {weekTotals.map((val, index) => {
          const height = `${(val / maxValue) * 15}vw`;
          const color = getBarColor(val);
          return (
            <div key={index} className="barContainer">
              <div className="barValue">{val}</div>
              <div
                className="progressBar"
                style={{ height, backgroundColor: color }}
                title={`Week ${index + 1}: ${val}`}
              />
              <h5 className="dayLabel">Week {index + 1}</h5>
            </div>
          );
        })}
      </div>
    </div>
  );
}

