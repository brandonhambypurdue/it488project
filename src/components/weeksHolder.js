import React from 'react';


export default function WeeksHolder({ weekTotals = [], weekData = [] }) {
  const getWeekMessage = (hours) => {
    if (hours >= 40) return { emoji: "🔥", text: "Crushing it this week!" };
    if (hours >= 30) return { emoji: "👍", text: "Solid effort!" };
    if (hours >= 20) return { emoji: "💪", text: "Keep Going" };
    if (hours > 0) return { emoji: "📈", text: "Progress made" };
    return { emoji: "😴", text: "No data yet" };
  };

  const getWeekInsights = (days = [], total) => {
    const bestDay = days.reduce(
      (max, d) => (d.value > max.value ? d : max),
      { day: null, value: 0 }
    );
    const consistency = days.filter(d => d.value > 0).length;
    const streak = total >= 30 ? "🔥 Streak: 30+ hrs this week" : null;

    return {
      bestDay: bestDay.day ? `🏆 Peak: ${bestDay.day} (${bestDay.value} hrs)` : null,
      consistency: `📅 Logged ${consistency}/7 days`,
      streak
    };
  };

  const getMotivation = (hours, prevWeek) => {
    if (hours > prevWeek) return "🥇 Let's keep improving";
    if (hours < prevWeek) return "💡 Try adding 15 mins/day to beat last week.";
    return "✨ Keep steady, consistency is key!";
  };

  // 🔹 Ensure 5 weeks are always rendered
  const paddedTotals = [...weekTotals];
  while (paddedTotals.length < 5) paddedTotals.push(0);

  return (
    <div className="weeksHolder">
      {paddedTotals.map((total, index) => {
        const { emoji, text } = getWeekMessage(total);
        const insights = getWeekInsights(weekData[index] || [], total);
        const motivation = getMotivation(total, paddedTotals[index - 1] || 0);

        return (
          <div key={index} className={`weekCard week${index + 1}`}>
            <h4>Week {index + 1}</h4>
            <div className="weekdesc">
              <div className="emoji">{emoji}</div>
              <div className="message">{text}</div>
              <div className="hours">⏱ {total} hrs</div>

              {insights.bestDay && <div>{insights.bestDay}</div>}
              <div>{insights.consistency}</div>
              {insights.streak && <div>{insights.streak}</div>}
              <div className="motivation">{motivation}</div>

              {/* ✅ Daily breakdown */}
              <div className="dailyBreakdown">
                {weekData[index]?.map((d, i) => (
                  <div key={i} className="dayStat">
                    {d.day}: {d.value} hrs
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

