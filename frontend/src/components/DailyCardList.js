import React, { useEffect } from 'react';
import RandomQuote from './randomquote';
import './CalendarHolder.css';

export default function DailyCardList({
  selectedHabit,
  getStreakBadge,
  setActiveDay,
  setShowPopup,
  dailyData
}) {
  const habitsArray = Array.isArray(dailyData?.habits) ? dailyData.habits : [];

  useEffect(() => {
    // console.log("📦 Raw habitsArray:", habitsArray);
    // console.log("🎯 selectedHabit:", selectedHabit);
  }, [habitsArray, selectedHabit]);



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
    1: ["🧘 Perfect balance!", "🌿 Mindfulness mastered!","⚡ Keep it routine","🌱 Building awareness","✨ Great consistency!"],
    0: ["🌑 Haven’t meditated yet — start small!"]
  },
  journaling: {

    1: ["📓 A few notes down","💡 Some entries logged","Great habit forming!","📓 Daily reflections complete!"],
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
   
    1: ["💨 Strong effort!","🏃 Consistent runner!"],
    0: ["🏃 Haven’t logged cardio yet","🏃 Lets get running"]
  },
  stretching: {
    
    1: ["💡Some sessions done","🙆 Solid routine!","🤸 Flexibility master!"],
    0: ["🤸 Haven’t stretched yet","🪑 Too much sitting?"]
  },
  self_reflection: {
 
    1: ["📝 reflections logged","💡 Reflective progress!","🪞 Deep insights gained!"],
    0: ["🌑 No reflections yet"]
  },
  lets_break_a_habit: {
    
    1: ["🌱 Progress made","⚡ Strong streak!"],
    0: ["🛑 Time to start breaking that habit!","⚠️ Slipped a bit"]
  }
};
function getHabitNote(habit, value) {
  if (!habitNotes[habit]) return "✅ Keep it up!";
  if (value === "No data") return "⏳ No data logged yet.";

  const numericValue = typeof value === "number" ? value : parseFloat(value);
  if (isNaN(numericValue)) return "⏳ No data logged yet.";

  const thresholds = Object.keys(habitNotes[habit])
    .map(Number)
    .sort((a, b) => b - a);

//   console.log(`🔍 Checking thresholds for ${habit}:`, thresholds);
// console.log(`🔍 Value: ${numericValue}`);

for (let threshold of thresholds) {
  if (numericValue >= threshold) {
    const messages = habitNotes[habit][String(threshold)];
    // console.log(`✅ Matched threshold ${threshold}:`, messages);
    return messages[Math.floor(Math.random() * messages.length)];
  }
}



  
  return "🚀 Keep going!";
}



  return (
    <div className="weekDaysHolder">
      {/* 🔄 Daily Cards */}
      {habitsArray.length === 0 ? (
        <p>Loading daily habits...</p>
      ) : (
        habitsArray.map((entry, index) => {
          const { day, study, sleep, hobby } = entry;
          const value = selectedHabit && entry[selectedHabit] !== undefined
            ? entry[selectedHabit]
            : "No data";

            // console.log(`📊 ${day} - ${selectedHabit}:`, value, typeof value);


          const prevValue = index > 0 ? habitsArray[index - 1][selectedHabit] ?? null : null;

          return (
            <div key={day} className={`dayCard ${day.toLowerCase()}`}>
              <h4>{day}</h4>
              <div className="dayDescHolder">
                <p>{selectedHabit ? `${selectedHabit}: ${value}` : "No data"}</p>

                {selectedHabit && (
                  <p className="motivationMsg">
                    {getHabitNote(selectedHabit, value)}

                  </p>
                )}

                <div className="cardFooter">
                  {getStreakBadge(habitsArray, index, selectedHabit)}
                </div>

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
          );
        })
      )}

      {/* 📊 Weekly Summary Card */}
      {selectedHabit && habitsArray.length > 0 && (
        <div className="dayCard weekly-summary">
          <h4>Weekly Summary</h4>
          <div className="dayDescHolder">
            <p>
              ⭐ Best day:{" "}
              {
                habitsArray.reduce((best, h) =>
                  h[selectedHabit] > (best[selectedHabit] || 0) ? h : best
                ).day
              }{" "}
              (
              {
                habitsArray.reduce((best, h) =>
                  h[selectedHabit] > (best[selectedHabit] || 0) ? h : best
                )[selectedHabit]
              }{" "}
              {selectedHabit})
            </p>
            <p>
              📊 Average:{" "}
              {(
                habitsArray.reduce((sum, h) => sum + (h[selectedHabit] || 0), 0) /
                habitsArray.length
              ).toFixed(1)}{" "}
              hrs
            </p>
          </div>
        </div>
      )}

      {/* 💬 Motivational Quote */}
      <div className="randomQuote">
        <span>
          <RandomQuote />
        </span>
      </div>
    </div>
  );
}

