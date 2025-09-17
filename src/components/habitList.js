import React from 'react';
import './HabitTracking.css'; // Optional: for styling

function HabitTracking({ onSelectHabit, selectedHabit }) {
  const habits = [
    { key: 'study', label: '📚 Studying' },
    { key: 'sleep', label: '😴 Sleeping' },
    { key: 'hobby', label: '🎨 Hobby' }
  ];
  console.log('Selected Habit:', selectedHabit);
console.log('Habit Data:', habits);


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


/*import React from 'react';

export default function TimeButtonGroup({ view, onChange }) {
  return (
    <div className="btn-group" role="group" aria-label="Time selection">
      <button
        type="button"
        className={`btn ${view === 'daily' ? 'active' : ''}`}
        onClick={() => onChange('daily')}
      >
        Daily
      </button>
      <button
        type="button"
        className={`btn ${view === 'weekly' ? 'active' : ''}`}
        onClick={() => onChange('weekly')}
      >
        Weekly
      </button>
      <button
        type="button"
        className={`btn ${view === 'monthly' ? 'active' : ''}`}
        onClick={() => onChange('monthly')}
      >
        Monthly
      </button>
    </div>
  );
}
*/