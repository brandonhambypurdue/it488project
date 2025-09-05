import React, { useState, useEffect } from 'react';

const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

function ProgressPlot() {
  // Start with zeros so points sit on the baseline
  const [scores, setScores] = useState(Array(7).fill(0));

  useEffect(() => {
    fetch('http://localhost:5000/graph-data')
      .then(res => res.json())
      .then(data => {
        // Keep seven entries; fill missing with 0
        const merged = Array(7).fill(0).map((_, i) => data[i] ?? 0);
        setScores(merged);
      })
      .catch(err => {
        console.error('Fetch error:', err);
        // leave zeros if error
      });
  }, []);

  // Prevent division by zero
  const maxScore = Math.max(...scores, 1);

  return (
    <div className="plotHolder">
      <div className="plotArea">
        <div className='productionBarBorder'></div>
        <div className='productionLabels'><h5>Improving</h5><h5>Declining</h5></div>
        <div className='productionBar'></div>
        
        {scores.map((score, i) => {
          // horizontal position: evenly spaced across 0–100%
          const leftPct = (i / (scores.length - 1)) * 100;

          // vertical position: score/max → 0–100%
          const bottomPct = (score / maxScore) * 100;

          return (
            <div
              key={i}
              className="plotPoint"
              style={{
                left: `${leftPct}%`,
                bottom: `${bottomPct}%`
              }}
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