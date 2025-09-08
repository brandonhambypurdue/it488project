import React from 'react';
import './ProgressPlot.css';

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];


function ProgressPlot({ scores, selectedHabit }) {
  // Extract scores for the selected habit
  const habitScores = scores.map(day => {
    const value = day[selectedHabit];
    return typeof value === 'number' ? value : 0;
  });

  const maxScore = Math.max(...habitScores, 1);

  // Fallback if no data is available
  if (!habitScores.some(score => score > 0)) {
    return (
      <div className="plotHolder">
        <p className="noDataMessage">
          No data available for <strong>{selectedHabit}</strong> this week.
        </p>
      </div>
    );
  }


  return (
    <div className="plotHolder">
      <div className="plotArea">
        <div className="productionBarBorder"></div>
        <div className="productionLabels">
          <h5>Improving</h5>
          <h5>Declining</h5>
        </div>
        <div className="productionBar"></div>

        {habitScores.map((score, i) => {
          const leftPct = (i / (habitScores.length - 1)) * 100;
          const bottomPct = (score / maxScore) * 100;

          // Color intensity based on score
          const intensity = Math.floor((score / maxScore) * 255);
          const pointColor = `rgb(${255 - intensity}, ${intensity}, 150)`;

          return (
            <div
              key={i}
              className="plotPoint"
              style={{
                left: `${leftPct}%`,
                bottom: `${bottomPct}%`,
                backgroundColor: pointColor
              }}
              title={`${days[i]}: ${score} hrs`}
            >
              <div className="pointValue">{score}</div>
              <div className="pointDay">{days[i]}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ProgressPlot;

