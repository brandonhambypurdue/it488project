import React from 'react';
import './ProgressPlot.css';

export default function MonthlyProgressGraph({ habits = [], selectedHabit }) {
  const dayOrder = [
    'Sunday', 'Monday', 'Tuesday', 'Wednesday',
    'Thursday', 'Friday', 'Saturday'
  ];

  // Sort habits by day order
  const sortedHabits = habits
    .filter(entry => dayOrder.includes(entry.day))
    .sort((a, b) => dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day));

  // Map each day to a point
  const dataPoints = sortedHabits.map((entry, index) => ({
    x: index + 1,
    y: entry[selectedHabit] ?? 0,
    label: entry.day
  }));

  const maxY = Math.max(...dataPoints.map(p => p.y), 1); // avoid divide-by-zero

  // SVG dimensions
  const width = 1100;
  const height = 600;
  const padding = 40;

  // Scale points to fit SVG
  const scaledPoints = dataPoints.map(p => ({
    x: padding + ((p.x - 1) / (dataPoints.length - 1)) * (width - 2 * padding),
    y: height - padding - (p.y / maxY) * (height - 2 * padding),
    label: p.label,
    value: p.y
  }));

  // Build path string for the line
  const path = scaledPoints
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`)
    .join(' ');

  return (
    <div className="plotHolder">
      <svg width={width} height={height} className="lineGraph">
        {/* Line connecting points */}
        <path d={path} stroke="#4caf50" strokeWidth="2" fill="none" />

        {/* Circles at each point */}
        {scaledPoints.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={4} fill="#2196f3" />
        ))}

        {/* Day labels below each point */}
        {scaledPoints.map((p, i) => (
          <text key={`label-${i}`} x={p.x} y={height - 10} fontSize="10" textAnchor="middle">
            {p.label}
          </text>
        ))}

        {/* Value labels above each point */}
        {scaledPoints.map((p, i) => (
          <text key={`value-${i}`} x={p.x} y={p.y - 10} fontSize="10" textAnchor="middle">
            {p.value}
          </text>
        ))}
      </svg>
    </div>
  );
}
