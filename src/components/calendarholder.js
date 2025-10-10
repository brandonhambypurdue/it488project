import React, { useState, useEffect,useMemo } from "react";
import axios from "axios";
import TimeButtonGroup from "./timetrack";
import RandomQuote from "./randomquote";
import PopupModal from "./PopupModal";
import "./CalendarHolder.css";
import "./PopupModal.css";
import DailyCardList from "./DailyCardList";
import WeeksHolder from "./weeksHolder";
import MonthsHolder from "./monthlyholder";


export default function CalendarHolder({
  user,
  selectedHabit,
  view,
  onViewChange,
  setDailyData,
  setWeekTotals,
  setMonthlyTotals,
  dailyData,
  weekTotals,
  monthlyTotals
}) {
  const [showPopup, setShowPopup] = useState(false);
  const [activeDay, setActiveDay] = useState("monday");
  const [inputValue, setInputValue] = useState("");
  const [weekData, setWeekData] = useState([]);

  // ✅ Fetch daily habits from API
  const fetchDailyDataChild = async () => {
    try {
      const res = await fetch(`/api/habits/${user.username}`);
      const data = await res.json();
      setDailyData(data.habits || []);
    } catch (err) {
      console.error("❌ Failed to fetch daily habits:", err);
    }
  };

  useEffect(() => {
    if (user?.username) {
      fetchDailyDataChild();
    }
  }, [user]);

  // ✅ Fetch weekly totals
  useEffect(() => {
    if (view === "weekly" && user?.username) {
      fetch(`http://localhost:5000/api/weekly?username=${user.username}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && Array.isArray(data.weekly)) {
            const totals = data.weekly.map(week => week[selectedHabit] || 0);
            setWeekTotals(totals);
            setWeekData(data.weekly);
          }
        });
    }
  }, [view, user, selectedHabit, setWeekTotals]);

  // ✅ Fetch monthly totals
  useEffect(() => {
    if (view === "monthly" && user?.username) {
      fetch(`http://localhost:5000/api/monthly?username=${user.username}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setMonthlyTotals(data.monthly);
          }
        });
    }
  }, [view, user, setMonthlyTotals]);

  // ✅ Motivational message logic
  const getCardMessage = (habit, value, prevValue) => {
    if (value === "No data" || value === null) return `🌱 Log your ${habit} today!`;
    if (prevValue !== null && prevValue !== "No data") {
      if (value > prevValue) return `📈 You improved by ${value - prevValue} hrs vs yesterday!`;
      if (value < prevValue) return `📉 ${prevValue - value} less hrs than yesterday.`;
    }
    if (value >= 8) return `💖 Amazing ${habit} session!`;
    if (value >= 4) return `💪 Solid effort on ${habit}`;
    return `✨ Every bit counts`;
  };

  // ✅ Streak badge logic
  const getStreakBadge = (habitArray, index, habitKey) => {
    let streak = 0;
    for (let i = index; i >= 0; i--) {
      const entry = habitArray[i];
      if (entry && entry[habitKey] > 0) {
        streak++;
      } else {
        break;
      }
    }
    if (streak === 0) return <span className="streakBadge grey">🌱 Start today</span>;
    return <span className="streakBadge">🔥 {streak}-day streak!</span>;
  };

  // ✅ Render
  return (
    <div className="calendarPage">
      <TimeButtonGroup view={view} onChange={onViewChange} />

      <div className="calendarHolder">
        {view === "daily" && (
          <DailyCardList
            selectedHabit={selectedHabit}
            getCardMessage={getCardMessage}
            getStreakBadge={getStreakBadge}
            setActiveDay={setActiveDay}
            setShowPopup={setShowPopup}
            inputValue={inputValue}
            setInputValue={setInputValue}
            showPopup={showPopup}
            dailyData={dailyData}
            user={user}
            refreshData={fetchDailyDataChild}
          />
        )}

        {view === "weekly" && (
          <WeeksHolder
            selectedHabit={selectedHabit}
            weekTotals={weekTotals}
          />
        )}

        {view === "monthly" && (
          <div className="monthsHolder">
            <MonthsHolder
              monthlyTotals={monthlyTotals}
              selectedHabit={selectedHabit}
            />
          </div>
        )}
      </div>
    </div>
  );
}


