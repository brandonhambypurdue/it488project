import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import TimeButtonGroup from './timetrack';
import RandomQuote from './randomquote';
import PopupModal from './PopupModal';
import './CalendarHolder.css';
import './PopupModal.css';
import WeeksHolder from './weeksHolder';
import MonthsHolder from './monthlyholder';

export default function CalendarHolder({
  user,
  selectedHabit,      // <-- MUST be a key like 'study' from HabitTracking
  onHabitsFetched,
  onCredentials,       // ✅ new: bubble credentials up
  onMonthlyTotals,     // ✅ new: bubble yearly totals up
  view,
  onViewChange,
  weekTotals,
  weeklySummary,
  habitData
}) {
  const { username, password } = user || {};
  const [habits, setHabits] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [activeDay, setActiveDay] = useState('monday');
  const [inputValue, setInputValue] = useState('');
  const [monthlyTotals, setMonthlyTotals] = useState({});

  // -----------------------
  // Helpers
  // -----------------------
  const days = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
  const toKey = (str) => String(str || '').trim().toLowerCase().replace(/\s+/g, '_');
  const selKey = toKey(selectedHabit);

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

  const getDayKey = (row) => {
    if (typeof row.day === 'string') return row.day.toLowerCase();
    const dt = rowToDate(row);
    return dt ? weekdayFromDate(dt).toLowerCase() : null;
  };

  const getRowValue = (row, key) => {
    if (!row || !key) return null;
    const nested = row.habits && Object.prototype.hasOwnProperty.call(row.habits, key)
      ? row.habits[key]
      : undefined;
    const flat = Object.prototype.hasOwnProperty.call(row, key) ? row[key] : undefined;
    const val = nested !== undefined ? nested : flat;
    return val !== undefined ? val : null;
  };

  const getDateFromDayName = (dayName) => {
    const today = new Date();
    const todayIndex = (today.getDay() + 6) % 7;
    const targetIndex = days.indexOf(dayName.toLowerCase());
    const diff = targetIndex - todayIndex;
    const d = new Date(today);
    d.setDate(today.getDate() + diff);
    return d;
  };
  const getMonthName = (dayName) =>
    getDateFromDayName(dayName).toLocaleString('default', { month: 'long' });
  const getDayNumber = (dayName) => getDateFromDayName(dayName).getDate();

  // -----------------------
  // Fetch habits
  // -----------------------
  const fetchHabits = async () => {
    try {
      const res = await axios.post('http://localhost:5000/api/login', { username, password });
      const raw = Array.isArray(res.data?.habits) ? res.data.habits : [];

      const normalized = raw.map(r => {
        const flatRow = {};
        if (r.day && typeof r.day === 'object') {
          flatRow.day_id = Number(r.day.day_id);
          flatRow.day_of_month = r.day.day_of_month;
        }
        for (const key of Object.keys(r)) {
          const val = r[key];
          if (key === 'day') continue;
          if (val && typeof val === 'object' && 'habit' in val) {
            flatRow[key] = val.habit;
          } else {
            flatRow[key] = val;
          }
        }
        return flatRow;
      });

      setHabits(normalized);

      // ✅ Bubble up habits
      onHabitsFetched?.(normalized);

      // ✅ Bubble up credentials
      onCredentials?.({ username, password });

    } catch (err) {
      console.error('❌ fetch error:', err);
      setHabits([]);
    }
  };

  useEffect(() => {
    if (username && password) fetchHabits();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username, password]);

  // -----------------------
  // Yearly totals
  // -----------------------
  useEffect(() => {
    const fetchYearly = async () => {
      try {
        const res = await axios.post("http://localhost:5000/api/yearly", { username });
        if (res.data.success) {
          setMonthlyTotals(res.data.monthly_totals);
          // ✅ Bubble up yearly totals
          onMonthlyTotals?.(res.data.monthly_totals);
        }
      } catch (err) {
        console.error("❌ Error fetching yearly data:", err);
      }
    };
    if (username) fetchYearly();
  }, [username, onMonthlyTotals]);

  // -----------------------
  // Build selectedHabitMap
  // -----------------------
  const selectedHabitMap = useMemo(() => {
    const map = {};
    for (const row of habits) {
      const dayKey = getDayKey(row);
      if (!dayKey) continue;
      const value = getRowValue(row, selKey);
      if (value === null) continue;
      const dt = rowToDate(row) ?? new Date(0);
      const prev = map[dayKey];
      if (!prev || dt > prev.__date) {
        map[dayKey] = { __date: dt, row, value };
      }
    }
    return map;
  }, [habits, selKey]);

  // -----------------------
  // Streaks, badges, etc.
  // -----------------------
  const computeStreak = (day, map) => {
    const idx = days.indexOf(day);
    let streak = 0;
    for (let i = idx; i >= 0; i--) {
      const entry = map[days[i]];
      if (entry?.value > 0) streak++;
      else break;
    }
    return streak;
  };

  const getChangeVsYesterday = (day, map) => {
    const idx = days.indexOf(day);
    if (idx <= 0) return null;
    const today = map[day]?.value ?? 0;
    const yesterday = map[days[idx - 1]]?.value ?? 0;
    return today - yesterday;
  };

  const getBadge = (hours, streak, change) => {
    if (hours >= 6) return "🥇 Great job";
    if (streak >= 5) return "🔥 5‑day streak!";
    if (change > 0) return "📈 Improved from yesterday";
    return null;
  };

  const getNextStep = (hours) => {
    if (hours < 2) return "💡 Try adding 30 mins tomorrow";
    if (hours < 4) return "➡️ Aim for 1 more hour tomorrow";
    return "🏆 Keep steady, consistency is key!";
  };







    // console.log('🧠 selectedHabitMap:', selectedHabitMap);

  // -----------------------
  // Render one daily card
  // -----------------------


  
const renderDay = (day) => {
  const entry = selectedHabitMap[day];
  const value = entry?.value ?? 0;

  const streak = computeStreak(day, selectedHabitMap);
  const change = getChangeVsYesterday(day, selectedHabitMap);
  const badge = getBadge(value, streak, change);
  const nextStep = getNextStep(value);

  const prettyLabel = selKey
    ? selKey.replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase())
    : 'Habit';

  return (
    <div key={day} className={`dayCard ${day}`}>
      <h4>{day.charAt(0).toUpperCase() + day.slice(1)}</h4>
      <div className="dayDescHolder">
        <p>
          <strong>Date:</strong> {getMonthName(day)} {getDayNumber(day)}
          <br />
          {value ? `${prettyLabel}: ${value} hrs` : "No data"}
        </p>

        {/* 🔹 New insights */}
        {change !== null && (
          <div className="change">
            {change > 0 ? `📊 +${change} hrs vs yesterday` :
             change < 0 ? `📉 ${change} hrs vs yesterday` :
             "➡️ Same as yesterday"}
          </div>
        )}
        {streak > 1 && <div className="streak">🔥 {streak}-day streak</div>}
        {badge && <div className="badge">{badge}</div>}
        <div className="nextStep">{nextStep}</div>

        <button
          type="button"
          className="addDayInfo"
          onClick={() => { setActiveDay(day); setShowPopup(true); }}
        >
          Add info
        </button>
      </div>
    </div>
  );
};

// inside CalendarHolder after fetchHabits




  // -----------------------
  // Submit (modal) — writes ONLY the selected habit
  // -----------------------
  const handleSubmit = async () => {
    const key = selKey;
    if (!key) {
      alert('Please select a habit first.');
      return;
    }
    try {
      const numeric = parseFloat(inputValue);
      const valueToSend = Number.isFinite(numeric) ? numeric : 0;

      // Write ONLY the selected habit to backend
      await axios.post('http://localhost:5000/api/input', {
        username,
        day_id: parseInt(getDateFromDayName(activeDay).toISOString().slice(0,10).replace(/-/g,''), 10),
        month: getMonthName(activeDay), // if your backend expects number, switch to numeric month here
        day: getDayNumber(activeDay),
        habits: { [key]: valueToSend },
      });

      setShowPopup(false);
      setInputValue('');
      await fetchHabits();
    } catch (err) {
      console.error('Error submitting habit info:', err);
    }
  };

  // -----------------------
  // UI
  // -----------------------
  return (
    <div className="calendarPage">
      <TimeButtonGroup view={view} onChange={onViewChange} />

      <div className="calendarHolder">
        {view === 'daily' && (
          <div className="weekDaysHolder">
            {days.map(renderDay)}
            <div className="randomQuote">
              <span><RandomQuote /></span>
            </div>
          </div>
        )}

  {view === 'weekly' && (
  <WeeksHolder  
    selectedHabit={selectedHabit} 
    habitData={habitData} 
    weekTotals={weekTotals}
  />
)}





        {view === 'monthly' && (
          <div className="monthsHolder">
            <MonthsHolder monthlyTotals={monthlyTotals} selectedHabit={selKey}></MonthsHolder>
          </div>
        )}
      </div>

      <PopupModal isOpen={showPopup} onClose={() => setShowPopup(false)}>
        <h3>Enter info for {activeDay.charAt(0).toUpperCase() + activeDay.slice(1)}</h3>
        <input
          className="inputDayInfo"
          type="number"
          placeholder="Hours / count"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <button className="enterInfo-btn" onClick={handleSubmit}>
          Submit
        </button>
      </PopupModal>
    </div>
  );
}
