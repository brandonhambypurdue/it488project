import React, { useEffect } from 'react';
import getRandomQuote from './randomquote';
import './CalendarHolder.css';
import { useState } from 'react';
import PopupModal from './PopupModal';

export default function DailyCardList({
  selectedHabit,
  getStreakBadge,
  dailyData,
  user,
  refreshData
}) {
  const habitLabels = {
    lets_break_a_habit: "Breaking Habit",
    self_reflection: "Reflection",
    journaling: "Journaling",
    meditation: "Meditation",
    hydration: "Hydration",
    cardio: "Cardio",
    stretching: "Stretching",
    study: "Study",
    sleep: "Sleep",
    hobby: "Hobby"
  };

  const habitUnits = {
    study: "hrs",
    sleep: "hrs",
    hobby: "hrs",
    meditation: "sessions",
    journaling: "entries",
    hydration: "cups",
    cardio: "sessions",
    stretching: "sessions",
    self_reflection: "entries",
    lets_break_a_habit: "days"
  };

  const habitsArray = Array.isArray(dailyData?.habits) ? dailyData.habits : [];

  const [showPopup, setShowPopup] = useState(false);
  const [activeDay, setActiveDay] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [quote, setQuote] = useState("");
  const [habitNoteCache, setHabitNoteCache] = useState({});

  useEffect(() => {
    setQuote(getRandomQuote());
  }, []);

 

  function capitalizeFirst(str) {
    return str ? str.charAt(0).toUpperCase() + str.slice(1) : "";
  }

  function getHabitNote(habit, value, day) {
    const cacheKey = `${habit}-${day}`;
    if (habitNoteCache[cacheKey]) return habitNoteCache[cacheKey];

    if (!habitNotes[habit]) return "✅ Keep it up!";
    if (value === "No data") return "⏳ No data logged yet.";

    const numericValue = typeof value === "number" ? value : parseFloat(value);
    if (isNaN(numericValue)) return "⏳ No data logged yet.";

    const thresholds = Object.keys(habitNotes[habit])
      .map(Number)
      .sort((a, b) => b - a);

    for (let threshold of thresholds) {
      if (numericValue >= threshold) {
        const messages = habitNotes[habit][String(threshold)];
        const selected = messages[Math.floor(Math.random() * messages.length)];
        setHabitNoteCache(prev => ({ ...prev, [cacheKey]: selected }));
        return selected;
      }
    }

    const fallback = "🚀 Keep going!";
    setHabitNoteCache(prev => ({ ...prev, [cacheKey]: fallback }));
    return fallback;
  }

  const habitNotes = {
    study: {
      5: ["📚 Study master! You crushed it!", "🎓 Peak focus achieved!"],
      3: ["✏️ Great study streak!", "📖 Solid academic effort!"],
      2: ["📘 Making progress!", "🧠 Good momentum!"],
      1: ["📉 A bit light today—refocus tomorrow."],
      0: ["⏳ No study logged—time to dive in!"]
    },
    sleep: {
      8: ["😴 Sleep champion! Fully recharged!", "🌙 Perfect rest!"],
      6: ["🛌 Well-rested and ready!", "💤 Solid sleep hours!"],
      4: ["🌘 Decent rest—keep it consistent."],
      2: ["⚠️ Running low on sleep—prioritize rest."],
      0: ["🌑 No sleep logged—take care of yourself!"]
    },
    hobby: {
      4: ["🎨 Creative powerhouse!", "🎯 Hobby time maxed out!"],
      3.5: ["🧩 Great personal time!", "🎮 Solid engagement!"],
      3: ["🎵 Nice balance of fun and focus."],
      1: ["📉 A bit light—make time for joy."],
      0: ["🕒 No hobby time logged—recharge with something fun!"]
    },
    meditation: {
      1: ["🧘 Perfect balance!", "🌿 Mindfulness mastered!", "⚡ Keep it routine", "🌱 Building awareness", "✨ Great consistency!"],
      0: ["🌑 Haven’t meditated yet — start small!"]
    },
    journaling: {
      1: ["📓 A few notes down", "💡 Some entries logged", "Great habit forming!", "📓 Daily reflections complete!"],
      0: ["🕒 Haven’t journaled yet — start today!"]
    },
    hydration: {
      5: ["💧 Hydration hero!"],
      3: ["🥤 Almost there!"],
      2: ["💦 Decent hydration"],
      1: ["🥵 Running low"],
      0: ["💧 Haven’t logged water yet"]
    },
    cardio: {
      1: ["💨 Strong effort!", "🏃 Consistent runner!"],
      0: ["🏃 Haven’t logged cardio yet", "🏃 Let’s get running"]
    },
    stretching: {
      1: ["💡 Some sessions done", "🙆 Solid routine!", "🤸 Flexibility master!"],
      0: ["🤸 Haven’t stretched yet", "🪑 Too much sitting?"]
    },
    self_reflection: {
      1: ["📝 Reflections logged", "💡 Reflective progress!", "🪞 Deep insights gained!"],
      0: ["🌑 No reflections yet"]
    },
    lets_break_a_habit: {
      1: ["🌱 Progress made", "⚡ Strong streak!"],
      0: ["🛑 Time to start breaking that habit!", "⚠️ Slipped a bit"]
    }
  };

  const formatHabitValue = (habitName, value) => {
    const numericValue = parseFloat(value) || 0;
    const unit = habitUnits[habitName] || "";
    return `${numericValue.toFixed(2)} ${unit}`.trim();
  };


const handleSubmit = async () => {
  try {
    // Map activeDay to Monday-based index (Monday = 0, Sunday = 6)
    const weekdayMap = [
      "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"
    ];
    const targetIndex = weekdayMap.indexOf(activeDay.toLowerCase());

    // Get today's date and convert JS weekday (Sunday = 0) to Monday-based index
    const today = new Date();
    const jsDay = today.getDay(); // 0 = Sunday, 1 = Monday, ...
    const currentIndex = (jsDay + 6) % 7; // Convert to Monday = 0

    // Get Monday of the current week
    const monday = new Date(today);
    monday.setDate(today.getDate() - currentIndex);

    // Add offset to get target day
    const targetDate = new Date(monday);
    targetDate.setDate(monday.getDate() + targetIndex -1);

    const formattedDate = targetDate.toISOString().split("T")[0]; // "YYYY-MM-DD"

 const payload = {
      username: user.username,
      date: formattedDate,
      habit: selectedHabit,
      hours: Number(inputValue),
    };

    console.log("Submitting payload:", payload);

    const response = await fetch("/api/hours/input", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("Submission failed:", result.error);
    } else {
      console.log("Submission successful:", result.status);
      setInputValue("");
      setShowPopup(false); // ✅ close modal
      if (typeof refreshData === "function") {
        refreshData(); // ✅ refresh habit data
      }
    }
  } catch (err) {
    console.error("Error submitting data:", err);
  }
};














  return (
    <div className="weekDaysHolder">
      {habitsArray.length === 0 ? (
        <p>Loading daily habits...</p>
      ) : (
        habitsArray.map((entry, index) => {
          const { day } = entry;
          const value = selectedHabit && entry[selectedHabit] !== undefined
            ? entry[selectedHabit]
            : "No data";

          const prevValue = index > 0 ? habitsArray[index - 1][selectedHabit] ?? null : null;

          return (
            <div key={day} className={`dayCard ${day.toLowerCase()}`}>
              <h4>{day}</h4>
              <div className="dayDescHolder">
                <p>
                  {selectedHabit
                    ? `${habitLabels[selectedHabit] || capitalizeFirst(selectedHabit.replace(/_/g, " "))}: ${value} ${habitUnits[selectedHabit] || ""}`
                    : "No data"}
                </p>

                {selectedHabit && (
                  <p className="motivationMsg">
                    {getHabitNote(selectedHabit, value, day)}
                  </p>
                )}

                <div className="cardFooter">
                  {getStreakBadge(habitsArray, index, selectedHabit)}
                  <button
                    type="button"
                    className="addDayInfo"
                    onClick={() => {
                      setActiveDay(day.toLowerCase());
                      setShowPopup(true);
                    }}
                  >
                    Add info
                  </button>
                </div>
              </div>
            </div>
          );
        })
      )}

      {selectedHabit && habitsArray.length > 0 && (() => {
        const bestDayEntry = habitsArray.reduce((best, h) =>
          h[selectedHabit] > (best[selectedHabit] || 0) ? h : best
        );

        const rawBestValue = bestDayEntry[selectedHabit] ?? 0;
        const rawAverageValue = habitsArray.reduce(
          (sum, h) => sum + (h[selectedHabit] || 0),
          0
        ) / habitsArray.length;

        return (
          <div className="dayCard_weekly-summary">
            <h4>Weekly Summary</h4>
            <div className="dayDescHolder">
              <p>
                ⭐ Best day: <strong>{bestDayEntry.day || "—"}</strong>{" "}
                {habitLabels[selectedHabit] || capitalizeFirst(selectedHabit.replace(/_/g, " "))}{" "}
                {formatHabitValue(selectedHabit, rawBestValue)}
              </p>
              <p>
                📊 Average: {formatHabitValue(selectedHabit, rawAverageValue)}


        </p>
      </div>
    </div>
  );
})()}









      <div className="randomQuote">
        <span>{quote}</span>
      </div>

      {showPopup && (
      <PopupModal isOpen={showPopup} onClose={() => setShowPopup(false)}>
  <h3>Enter info for {capitalizeFirst(activeDay)}</h3>
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

      )}
    </div>
  );
}



