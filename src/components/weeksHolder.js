import React from 'react';

export default function WeeksHolder({ weekTotals = [], weekData = [], selectedHabit }) {
  const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

  // Habit-specific weekly goals
  const habitGoals = {
    study: 20,
    sleep: 35,
    hobby:10 , 
    meditation: 4,          // ~1 session every other day
    journaling: 5,          // ~5 entries/week
    self_reflection: 3,     // ~3 reflections/week
    stretching: 5,          // ~5 sessions/week
    cardio: 4,              // ~3 workouts/week
    hydration: 28,          // ~4 glasses/day * 7 days
    lets_break_a_habit: 7,  // ~7 days streak
    default: 10             // fallback (hours)
  };

  // Habit-specific units
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
  const unit = habitUnits[selectedHabit] || habitUnits.default;

  // Habit-specific weekly messages
  const habitWeekMessages = {
    hydration: {
      high: ["💧 Fully hydrated this week!", "🚰 Excellent water intake!"],
      mid: ["🥤 Good hydration!", "🌊 Keep sipping!"],
      low: ["⚠️ Drink more water", "🥵 Running low on hydration"],
      none: ["💧 No water logged yet"]
    },
    cardio: {
      high: ["🔥 Amazing workouts!", "🏃 You crushed cardio this week!"],
      mid: ["💪 Solid effort!", "⚡ Keep moving!"],
      low: ["🚶 Some activity logged", "✨ Try to add more sessions"],
      none: ["🏃 No cardio logged yet"]
    },
    journaling: {
      high: ["📓 Daily reflections complete!", "✍️ Great writing streak!"],
      mid: ["📝 Good journaling habit!", "📖 Keep writing your journey!"],
      low: ["💡 A few entries logged", "⚡ Try to write more often"],
      none: ["🕒 No journaling yet"]
    },
    meditation: {
      high: ["🧘 Deep focus this week!", "🌿 Mindfulness mastered!"],
      mid: ["✨ Great consistency!", "🕊️ Calm and steady!"],
      low: ["🌱 A few sessions in", "💡 Keep practicing!"],
      none: ["🌑 No meditation logged yet"]
    },
    stretching: {
      high: ["🤸 Flexibility master!", "🧘 Great mobility!"],
      mid: ["🙆 Solid routine!", "⚡ Keep stretching!"],
      low: ["💡 Some sessions done", "🌱 Build consistency"],
      none: ["🤸 Haven’t stretched yet"]
    },
    self_reflection: {
      high: ["🪞 Deep insights gained!", "✨ Great self-awareness!"],
      mid: ["💡 Reflective progress!", "🌱 Growing awareness!"],
      low: ["📝 A few reflections", "⚡ Keep going inward"],
      none: ["🌑 No reflections yet"]
    },
    lets_break_a_habit: {
      high: ["🛑 Habit broken all week!", "🎉 Freedom achieved!"],
      mid: ["⚡ Strong streak!", "💪 Keep resisting!"],
      low: ["🌱 Progress made", "🚀 Stay disciplined!"],
      none: ["🛑 Time to start breaking that habit!"]
    }
  };

  const getWeekMessage = (habit, total, goal) => {
    const percent = (total / goal) * 100;
    const messages = habitWeekMessages[habit];

    if (!messages) {
      // fallback generic
      if (total >= 30) return { emoji: "🔥", text: "Crushing it this week!" };
      if (total >= 20) return { emoji: "👍", text: "Solid effort!" };
      if (total > 0) return { emoji: "📈", text: "Progress made" };
      return { emoji: "😴", text: "No data yet" };
    }

    if (percent >= 100) return { emoji: "🏆", text: pickRandom(messages.high) };
    if (percent >= 50) return { emoji: "👍", text: pickRandom(messages.mid) };
    if (percent > 0)   return { emoji: "📈", text: pickRandom(messages.low) };
    return { emoji: "😴", text: pickRandom(messages.none) };
  };

  const getWeekInsights = (days = [], total) => {
    const bestDay = days.reduce(
      (max, d) => (d.value > max.value ? d : max),
      { day: null, value: 0 }
    );
    return {
      bestDay:
        bestDay.day && bestDay.value > 0
          ? `🏆 Peak: ${bestDay.day} (${bestDay.value} ${unit})`
          : null,
    };
  };

  const getTrendArrow = (total, prevWeek, index) => {
    if (index === 0) return "";
    if (total > prevWeek) return `📈 (+${total - prevWeek} ${unit} vs last week)`;
    if (total < prevWeek) return `📉 (-${prevWeek - total} ${unit} vs last week)`;
    return "➡️ (same as last week)";
  };

  // Adaptive motivational messages
  const MESSAGES = {
    firstWeek: ["✨ First week logged — great start!", "🌱 Every journey begins with a single step.", "🚀 Off to a strong start!"],
    momentum: ["🚀 You’re building momentum!", "🔥 Two weeks of growth — keep it rolling!", "📈 Consistency is paying off!"],
    dip: ["💡 Don’t worry, bounce back next week.", "🌊 Progress has ups and downs — you’ve got this.", "🔄 Small dip, but the trend is still yours to shape."],
    steady: ["✨ Keep steady, consistency is key!", "⚖️ Balance is progress too.", "🌟 Another solid week in the books."]
  };

  const getAdaptiveMessage = (totals, index) => {
    if (index === 0) return pickRandom(MESSAGES.firstWeek);
    const thisWeek = totals[index];
    const prevWeek = totals[index - 1];
    const twoWeeksAgo = totals[index - 2];
    if (thisWeek > prevWeek && prevWeek > (twoWeeksAgo ?? -Infinity)) return pickRandom(MESSAGES.momentum);
    if (thisWeek < prevWeek) return pickRandom(MESSAGES.dip);
    return pickRandom(MESSAGES.steady);
  };

  const getAverageMessage = (avg) => {
    if (avg >= goal) return pickRandom(["🏆 Elite consistency — you’re smashing it!", "🔥 Outstanding weekly average!"]);
    if (avg >= goal * 0.6) return pickRandom(["💪 Solid weekly average — you’re on track!", "👍 Great balance, keep pushing forward!"]);
    if (avg > 0) return pickRandom(["🌱 Every step adds up — keep building!", "📈 Small wins create big change."]);
    return "😴 No data yet — time to start logging!";
  };

  // Ensure 5 weeks are always rendered
  const paddedTotals = [...weekTotals];
  while (paddedTotals.length < 5) paddedTotals.push(0);

  const maxTotal = Math.max(...paddedTotals);
  const bestWeekIndex = paddedTotals.indexOf(maxTotal);

  const nonZeroWeeks = paddedTotals.filter((v) => v > 0);
  const avgValue =
    nonZeroWeeks.length > 0
      ? (nonZeroWeeks.reduce((a, b) => a + b, 0) / nonZeroWeeks.length).toFixed(1)
      : 0;



    return (
    <div className="weeksHolder">
      {paddedTotals.map((total, index) => {
        const { emoji, text } = getWeekMessage(selectedHabit, total, goal);
        const insights = getWeekInsights(weekData[index] || [], total);
        const prevWeek = paddedTotals[index - 1] || 0;
        const trend = getTrendArrow(total, prevWeek, index);
        const adaptiveMsg = getAdaptiveMessage(paddedTotals, index);

        return (
          <div
            key={index}
            className={`weekCard week${index + 1} ${index === bestWeekIndex ? "bestWeek" : ""}`}
            style={index === bestWeekIndex ? { border: "3px solid gold" } : {}}
          >
            <h4>
              Week {index + 1} {index === bestWeekIndex && <span>👑</span>}
            </h4>
            <div className="weekdesc">
              <div className="emoji">{emoji}</div>
              <div className="message">{text}</div>
              <div className="hours">
                ⏱ {total} {unit} {trend}
              </div>

              {insights.bestDay && <div>{insights.bestDay}</div>}
              <div className="motivation">{adaptiveMsg}</div>

              {/* ✅ Daily breakdown */}
              <div className="dailyBreakdown">
                {weekData[index]?.length > 0 ? (
                  weekData[index].map((d, i) => (
                    <div key={i} className="dayStat">
                      {d.day}: {d.value} {unit}
                    </div>
                  ))
                ) : (
                  <div className="dayStat"></div>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {/* 📊 Average card */}
      <div className="averageCard" style={{ border: "2px solid #888" }}>
        <h4>📊 Average</h4>
        <div className="weekdesc">
          <div className="emoji">📊</div>
          <div className="message">Your baseline trend</div>
          <div className="hours">{avgValue} {unit}/week</div>
          <div className="motivation">{getAverageMessage(avgValue)}</div>
        </div>
      </div>
    </div>
  );
}


