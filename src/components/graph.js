import React, { useMemo } from 'react';
import './ProgressPlot.css';

export default function ProgressGraph({ scores = [], selectedHabit }) {
  const toKey = str => String(str || '').trim().toLowerCase().replace(/\s+/g, '_');
  const selKey = toKey(selectedHabit);

  const days = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];

  const rowToDate = (r) => {
    const id = Number(r.day_id);
    if (Number.isFinite(id) && id >= 10_000_000) {
      const s = String(id);
      return new Date(`${s.slice(0,4)}-${s.slice(4,6)}-${s.slice(6,8)}`);
    }
    const m = Number(r.month);
    const d = Number(r.day_of_month ?? r.day);
    if (Number.isFinite(m) && Number.isFinite(d)) {
      const y = new Date().getFullYear();
      return new Date(y, m - 1, d);
    }
    return null;
  };

  const weekdayFromDate = (date) => {
    const monIdx = (date.getDay() + 6) % 7;
    return days[monIdx];
  };

  const selectedHabitMap = useMemo(() => {
    const map = {};
    for (const row of scores) {
      const dt = rowToDate(row);
      const dayKey = dt ? weekdayFromDate(dt) : null;
      if (!dayKey) continue;

      const value = row[selKey];
      if (value === null || value === undefined) continue;

      const prev = map[dayKey];
      if (!prev || dt > prev.__date) {
        map[dayKey] = { __date: dt, value };
      }
    }
    return map;
  }, [scores, selKey]);

  const maxValue = Math.max(...days.map(day => selectedHabitMap[day]?.value ?? 0), 1);

  // 🔥 Color gradient based on value
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

  return (
    <div className='plotHolder'>
      <h4>Daily Progress for {selectedHabit}</h4>
      <div className='progressBars'>
        {days.map((day) => {
          const value = selectedHabitMap[day]?.value ?? 0;
          const height = `${(value / maxValue) * 17}vw`;
          const color = getBarColor(value);

          return (
            <div key={day} className='barContainer'>
              <div className='barValue'>{value}</div>
              <div
                className='progressBar'
                style={{ height, backgroundColor: color }}
                title={`${day}: ${value}`}
              />
              <h5 className='dayLabel'>
                {day.charAt(0).toUpperCase() + day.slice(1)}
              </h5>
            </div>
          );
        })}
      </div>
    </div>
  );
}

