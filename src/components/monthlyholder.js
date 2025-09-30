import React from 'react';
import './CalendarHolder.css';

export default function MonthsHolder({ monthlyTotals = {}, selectedHabit }) {
  const months = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December'
  ];

  const goal = 150;

  const getNote = (percent) => {
    if (percent >= 200) return "🚀 You doubled your goal!";
    if (percent >= 150) return "🔥 Crushing expectations!";
    if (percent >= 100) return "✅ Goal achieved!";
    if (percent >= 75) return "💪 Great job!";
    if (percent >= 50) return "👍 Solid effort!";
    if (percent >= 25) return "⚡ Keep pushing!";
    return "👀 Let’s get started!";
  };

  const getColor = (percent) => {
    if (percent >= 100) return "#00bcd4"; // teal for overflow
    if (percent >= 75) return "#4caf50";  // green
    if (percent >= 25) return "#ffeb3b";  // yellow
    return "#f44336";                     // red
  };

  const getBadge = (percent) => {
    if (percent >= 200) return "🏅 Legend Mode";
    if (percent >= 150) return "🥇 Overachiever";
    if (percent >= 125) return "🎯 Goal Surpassed";
    if (percent >= 100) return "✅ Goal Hit";
    return null;
  };

  return (
    <div className="monthsHolder">
      {months.map((month, idx) => {
        const monthKey = String(idx + 1).padStart(2, "0");
        const hours = monthlyTotals[monthKey]?.[selectedHabit] || 0;
        const percent = Math.round((hours / goal) * 100);
        const badge = getBadge(percent);

        return (
          <div key={month} className="Month">
            <h4>{month}</h4>
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
                  transition: "width 0.4s ease"
                }}
              />
            </div>

            <div className="monthStats">
              ⏱ {hours} hrs / {goal} hrs
            </div>

            <div className="monthNote">
              {getNote(percent)}
            </div>

            {badge && (
              <div className="monthBadge">
                {badge}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

