import React, { useEffect, useState, useMemo } from 'react';
import ProgressGraph from './graph';
import ManualGraph from './WeeklyProgressgraph';
import MonthlyProgressGraph from './MonthlyProgressGraph';
import './ProgressPlot.css';

export default function GraphDisplay({
  username,
  password,
  selectedHabit,
  view,
  dailyData,
  weekTotals,
  monthlyTotals
}) {
  // 🔎 Log incoming data for debugging
  useEffect(() => {
   
  }, [dailyData, weekTotals, monthlyTotals, selectedHabit, view]);

  // 🔹 Shape daily data
const shapedDaily = useMemo(() => {
  const safeData = Array.isArray(dailyData?.habits) ? dailyData.habits : [];
  return {
    labels: safeData.map((row, i) => row.day ?? `Day ${row.day_id ?? i + 1}`),
    values: safeData.map(row => Number(row[selectedHabit] ?? 0))
  };
}, [dailyData, selectedHabit]);



//shape weekly data
const shapedWeekly = useMemo(() => {
  const safeWeeks = Array.isArray(weekTotals) ? weekTotals : [];
  return {
    labels: safeWeeks.map((_, i) => `Week ${i + 1}`),
    values: safeWeeks
  };
}, [weekTotals]);

//shape monthly data
const shapedMonthly = useMemo(() => {
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const safeMonthly = monthlyTotals || {};
  return {
    labels: months,
    values: months.map((_, idx) =>
      safeMonthly[String(idx + 1).padStart(2, "0")]?.[selectedHabit] || 0
    )
  };
}, [monthlyTotals, selectedHabit]);




  return (
    <div className="graphDisplay">
      {view === 'daily' && (
        <ProgressGraph data={shapedDaily} selectedHabit={selectedHabit} />
      )}
      {view === 'weekly' && (
        <ManualGraph data={shapedWeekly} selectedHabit={selectedHabit} />
      )}
      {view === 'monthly' && (
        <MonthlyProgressGraph data={shapedMonthly} monthlyTotals={monthlyTotals} selectedHabit={selectedHabit} />
      )}
    </div>
  );
}

