import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import ProgressGraph from './graph';
import ManualGraph from './WeeklyProgressgraph';
import MonthlyProgressGraph from './MonthlyProgressGraph';
import './ProgressPlot.css';



export default function GraphDisplay({
  username,
  password,
  selectedHabit,
  view,
  monthlyTotals,
  SetWeeklySummary,
  setWeekTotals
}) {
  const [habitData, setHabitData] = useState([]);

  // 🔎 Fetch data directly from backend (like Postman)
  useEffect(() => {
    axios.post("http://localhost:5000/api/monthly", { username })
      .then(res => {
        // console.log("📦 Raw API response:", res.data);
        if (res.data.success) {
          // console.log("📊 Habits array:", res.data.habits);
          setHabitData(res.data.habits);
        }
      })
      .catch(err => {
        console.error("❌ API error:", err);
      });
  }, [username]);

  // ✅ Compute weekly totals from fetched data
  const weekTotals = useMemo(() => {
    if (!habitData || habitData.length === 0) return [0, 0, 0, 0, 0];

    const totals = [0, 0, 0, 0, 0];
    const habitKey = selectedHabit?.toLowerCase();

    for (const row of habitData) {
      const d = row.day;
      if (!d) continue;

      const value = Number(row[habitKey] ?? 0);
      // console.log(`Day ${d} | ${habitKey} =`, row[habitKey], "→ parsed:", value);

      const weekIndex = Math.floor((d - 1) / 7);
      if (weekIndex >= 0 && weekIndex < 5) {
        totals[weekIndex] += value;
      }
    }



    // console.log("✅ Computed weekTotals:", totals);
    return totals;
  }, [habitData, selectedHabit]);

  return (
    <div className="graphDisplay">
      {view === 'daily' && (
        <ProgressGraph scores={habitData} selectedHabit={selectedHabit} />
      )}
      {view === 'weekly' && (
        <ManualGraph habitData={habitData}
        selectedHabit={selectedHabit} />
      )}
      {view === 'monthly' && (
        <MonthlyProgressGraph monthlyTotals={monthlyTotals} selectedHabit={selectedHabit} />
      )}
    </div>
  );
}









