import React from 'react';
import './CalendarHolder.css';

export default function MonthsHolder({ monthlyTotals = {}, selectedHabit }) {
  const months = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December'
  ];

  // Habit-specific monthly goals
  const habitGoals = {
    hobby: 40,
    study: 80,
    sleep: 250,
    meditation: 20,
    journaling: 10,
    self_reflection: 15,
    stretching: 15,
    cardio: 15,
    hydration: 90,
    lets_break_a_habit: 150, // special case
    default: 150
  };
  const habitUnits = {
  meditation: "sessions",
  journaling: "entries",
  self_reflection: "reflections",
  stretching: "sessions",
  cardio: "workouts",
  hydration: "glasses",
  lets_break_a_habit: "days",
  default: "hrs"
};



  const goal = habitGoals[selectedHabit] || habitGoals.default;
  const yearlyGoal = goal * 12;

  // Habit-specific motivational notes
  const habitNotes = {
    meditation: { 100: ["🧘 Perfect balance!", "🌿 Mindfulness mastered!"], 80: ["✨ Great consistency!"], 60: ["🌱 Building awareness"], 40: ["⚡ Try to make it routine"], 0: ["🌑 Haven’t meditated yet — start small!"] },
    journaling: { 100: ["📓 Daily reflections complete!"], 80: ["📝 Great habit forming!"], 60: ["💡 Some entries logged"], 40: ["📓 A few notes down"], 0: ["🕒 Haven’t journaled yet — start today!"] },
    hydration: { 100: ["💧 Hydration hero!"], 80: ["🥤 Almost there!"], 60: ["💦 Decent hydration"], 40: ["🥵 Running low"], 0: ["💧 Haven’t logged water yet"] },
    cardio: { 100: ["🏃 Consistent runner!"], 80: ["💨 Strong effort!"], 60: ["🚶 Decent activity"], 40: ["🛑 Low cardio logged"], 0: ["🏃 Haven’t logged cardio yet"] },
    stretching: { 100: ["🤸 Flexibility master!"], 80: ["🙆 Solid routine!"], 60: ["💡 Some sessions done"], 40: ["🪑 Too much sitting?"], 0: ["🤸 Haven’t stretched yet"] },
    self_reflection: { 100: ["🪞 Deep insights gained!"], 80: ["💡 Reflective progress!"], 60: ["📝 Some reflections logged"], 40: ["🪞 A few reflections"], 0: ["🌑 No reflections yet"] },
    lets_break_a_habit: { 100: ["🛑 Habit broken!"], 80: ["⚡ Strong streak!"], 60: ["🌱 Progress made"], 40: ["⚠️ Slipped a bit"], 0: ["🛑 Time to start breaking that habit!"] }
  };

  // Habit-specific badges
  const habitBadges = {
    meditation: { 100: "🧘 Zen Master", 150: "🌿 Enlightened", 200: "🏅 Mindfulness Legend" },
    journaling: { 100: "📓 Storyteller", 150: "✍️ Wordsmith", 200: "🏅 Master Chronicler" },
    hydration: { 100: "💧 Hydration Hero", 150: "🌊 Water Warrior", 200: "🏅 Ocean Spirit" },
    cardio: { 100: "🏃 Consistent Runner", 150: "🔥 Endurance Beast", 200: "🏅 Marathon Mindset" },
    stretching: { 100: "🤸 Flexibility Champ", 150: "🧘 Mobility Master", 200: "🏅 Yoga Legend" },
    self_reflection: { 100: "🪞 Insightful Thinker", 150: "✨ Self-Aware", 200: "🏅 Philosopher" },
    lets_break_a_habit: { 100: "🛑 Habit Crusher", 150: "💪 Discipline Master", 200: "🏅 Freedom Achieved" }
  };

  const randomPick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  const getNote = (habit, percent) => {
    const notes = habitNotes[habit] || {};
    if (percent >= 100 && notes[100]) return randomPick(notes[100]);
    if (percent >= 80 && notes[80]) return randomPick(notes[80]);
    if (percent >= 60 && notes[60]) return randomPick(notes[60]);
    if (percent >= 40 && notes[40]) return randomPick(notes[40]);
    return notes[0] ? randomPick(notes[0]) : "Keep going!";
  };

  const getBadge = (habit, percent) => {
    const badges = habitBadges[habit] || {};
    if (percent >= 200 && badges[200]) return badges[200];
    if (percent >= 150 && badges[150]) return badges[150];
    if (percent >= 100 && badges[100]) return badges[100];
    return null;
  };

  const getColor = (percent) => {
    if (percent >= 100) return "#00bcd4";
    if (percent >= 75) return "#4caf50";
    if (percent >= 25) return "#ffeb3b";
    return "#f44336";
  };

  const totalsArray = months.map((_, idx) =>
    monthlyTotals[String(idx+1).padStart(2,"0")]?.[selectedHabit] || 0
  );
  const maxTotal = Math.max(...totalsArray);
  const bestMonthIndex = totalsArray.indexOf(maxTotal);

  const getTrend = (hours, prev) => {
    if (prev === undefined) return "";
    if (hours > prev) return `📈 +${hours - prev} hrs`;
    if (hours < prev) return `📉 -${prev - hours} hrs`;
    return "➡️ same as last month";
  };

  const getTrendMessage = (hours, prev) => {
    if (prev === undefined) return "🌱 First month logged!";
    if (hours > prev) return "📈 You improved over last month!";
    if (hours < prev) return "📉 A small dip — bounce back stronger!";
    return "➡️ Steady progress, keep it up!";
  };

  const yearlyTotal = totalsArray.reduce((a,b)=>a+b,0);
  const yearlyPercent = Math.round((yearlyTotal / yearlyGoal) * 100);

  return (
  <div className="monthsHolder">
    {months.map((month, idx) => {
      const hours = totalsArray[idx];
      const percent = Math.round((hours / goal) * 100);
      const badge = getBadge(selectedHabit, percent);

      return (
        <div
          key={month}
          className={`Month ${idx === bestMonthIndex ? "bestMonth" : ""}`}
          style={idx === bestMonthIndex ? { border: "3px solid gold" } : {}}
        >
          <h4>{month} {idx === bestMonthIndex && "👑"}</h4>
          <h5>Your Progress this month</h5>

          <div className="percentages">
            <h5>{percent}%</h5><h5>100%</h5>
          </div>

          <div className="progressBorder">
            <div
              className="progressFill"
              style={{
                width: `${Math.min(percent, 100)}%`,
                backgroundColor: getColor(percent),
                transition: "width 0.4s ease",
                boxShadow: percent > 100 ? "0 0 10px #00bcd4" : "none"
              }}
            />
          </div>

          <div className="monthStats">
          ⏱ {hours} {habitUnits[selectedHabit] || "hrs"} / {goal} {habitUnits[selectedHabit] || "hrs"} {getTrend(hours, totalsArray[idx-1])}
          </div>


          <div className="monthNote">
            {getNote(selectedHabit, percent)} <br />
            {getTrendMessage(hours, totalsArray[idx-1])}
          </div>

          {badge && (
            <div className="monthBadge">{badge}</div>
          )}
        </div>
      );
    })}

    {/* Yearly summary card */}
    <div className="Month">
      <h4>📊 Yearly Progress</h4>
      <h5>Total across all months</h5>

      <div className="percentages">
        <h5>{yearlyPercent}%</h5><h5>100%</h5>
      </div>

      <div className="progressBorder">
        <div
          className="progressFill"
          style={{
            width: `${Math.min(yearlyPercent, 100)}%`,
            backgroundColor: getColor(yearlyPercent),
            transition: "width 0.4s ease"
          }}
        />
      </div>

      <div className="monthStats">
      ⏱ {yearlyTotal} {habitUnits[selectedHabit] || "hrs"} / {yearlyGoal} {habitUnits[selectedHabit] || "hrs"}
      </div>


      <div className="monthNote">
        {yearlyPercent >= 100
          ? "🏆 You’ve hit your yearly goal!"
          : "🚀 Keep pushing toward your goal!"}
      </div>
    </div>
  </div>
);
}
