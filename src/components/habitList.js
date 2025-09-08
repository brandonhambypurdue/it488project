import React from 'react';
import './HabitTracking.css'; // Optional: for styling

function HabitTracking({ onSelectHabit, selectedHabit }) {
  const habits = [
    { key: 'study', label: '📚 Studying' },
    { key: 'sleep', label: '😴 Sleeping' },
    { key: 'hobby', label: '🎨 Hobby' }
  ];

  return (
    <div className="habitTracking">
      <h4>Habits being tracked</h4>
      <div className="habits">
        {habits.map(habit => (
          <button
            key={habit.key}
            onClick={() => onSelectHabit(habit.key)}
            className={habit.key === selectedHabit ? 'active' : ''}
            aria-pressed={habit.key === selectedHabit}
          >
            {habit.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default HabitTracking;
