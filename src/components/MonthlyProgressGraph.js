import React, { useMemo } from "react";
import "./ProgressPlot.css";

export default function YearlyProgressGraph({ monthlyTotals = {}, selectedHabit }) {
  // Build 12 data points (Jan–Dec)
  const dataPoints = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const monthKey = String(i + 1).padStart(2, "0");
      return {
        x: i + 1,
        y: monthlyTotals[monthKey]?.[selectedHabit] || 0,
        label: new Date(2025, i).toLocaleString("default", { month: "short" }),
      };
    });
  }, [monthlyTotals, selectedHabit]);

  const maxY = Math.max(...dataPoints.map((p) => p.y), 1);
  const avg = dataPoints.reduce((a, b) => a + b.y, 0) / dataPoints.length;

  const width = 1100;
  const height = 600;
  const padding = 60;

  // ✅ Option 1: add extra vertical padding
  const topPad = padding * 2;     // extra space at top
  const bottomPad = padding * 2;  // extra space at bottom

  // Scaling helpers
  const scaleX = (i) => padding + (i / 11) * (width - 2 * padding);
  const scaleY = (val) =>
    height - bottomPad - (val / maxY) * (height - topPad - bottomPad);

  // Scale points
  const scaledPoints = dataPoints.map((p, i) => ({
    x: scaleX(i),
    y: scaleY(p.y),
    label: p.label,
    value: p.y,
  }));

  // Smooth line path using quadratic curves
  const path = scaledPoints.reduce((acc, p, i, arr) => {
    if (i === 0) return `M ${p.x},${p.y}`;
    const prev = arr[i - 1];
    const midX = (prev.x + p.x) / 2;
    return acc + ` Q ${midX},${prev.y} ${p.x},${p.y}`;
  }, "");

  const maxVal = Math.max(...scaledPoints.map((p) => p.value));
  const minVal = Math.min(...scaledPoints.map((p) => p.value));

  return (
    <div className="plotHolder">
      <h3>Yearly Progress for {selectedHabit}</h3>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        className="lineGraph"
      >
        {/* Axes */}
        <line
          x1={padding}
          y1={height - bottomPad}
          x2={width - padding}
          y2={height - bottomPad}
          stroke="#ccc"
        />
        <line
          x1={padding}
          y1={topPad}
          x2={padding}
          y2={height - bottomPad}
          stroke="#ccc"
        />

        {/* Horizontal gridlines + Y labels */}
        {Array.from({ length: 5 }, (_, i) => {
          const yVal = (i / 4) * maxY;
          const y = scaleY(yVal);
          return (
            <g key={i}>
              <line
                x1={padding}
                x2={width - padding}
                y1={y}
                y2={y}
                stroke="#eee"
              />
              <text
                x={padding - 10}
                y={y + 4}
                fontSize="10"
                textAnchor="end"
                fill="#666"
              >
                {Math.round(yVal)}
              </text>
            </g>
          );
        })}

        {/* Average line */}
        <line
          x1={padding}
          x2={width - padding}
          y1={scaleY(avg)}
          y2={scaleY(avg)}
          stroke="orange"
          strokeDasharray="4"
        />
        <text
          x={width - padding + 5}
          y={scaleY(avg) + 4}
          fontSize="10"
          fill="orange"
        >
          Avg {avg.toFixed(1)}
        </text>

        {/* Line path */}
        <path d={path} stroke="#4caf50" strokeWidth="3" fill="none" />

        {/* Points */}
        {scaledPoints.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={6}
            fill={
              p.value === maxVal
                ? "green"
                : p.value === minVal
                ? "red"
                : "#2196f3"
            }
          >
            <title>{`${p.label}: ${p.value}`}</title>
          </circle>
        ))}

        {/* Month labels */}
        {scaledPoints.map((p, i) => (
          <text
            key={`label-${i}`}
            x={p.x}
            y={height - bottomPad + 20}
            fontSize="12"
            textAnchor="middle"
          >
            {p.label}
          </text>
        ))}

        {/* Value labels above points */}
        {scaledPoints.map((p, i) => (
          <text
            key={`value-${i}`}
            x={p.x}
            y={p.y - 10}
            fontSize="10"
            textAnchor="middle"
            fill="#333"
          >
            {p.value}
          </text>
        ))}
      </svg>
    </div>
  );
}

