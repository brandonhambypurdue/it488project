import React, { useState, useEffect } from 'react';
import './HabitTracking.css';
import AddButton from './AddButton';

const STORAGE_KEY = 'myapp_habits_v1';

function HabitTracking({ onSelectHabit, selectedHabit }) {
  const defaultHabits = [
    { key: 'study', label: '📚 Studying', builtin: true },
    { key: 'sleep', label: '😴 Sleeping', builtin: true },
    { key: 'hobby', label: '🎨 Hobby', builtin: true }
  ];

  const [habits, setHabits] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultHabits;
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return defaultHabits;
      return parsed;
    } catch {
      return defaultHabits;
    }
  });

  // Persist whenever habits change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
    } catch (err) {
      console.warn('Failed to save habits', err);
    }
  }, [habits]);

  // Add habit (idempotent)
  const addHabit = (key, label) => {
    setHabits(prev => {
      if (prev.some(h => h.key === key)) return prev;
      return [...prev, { key, label, builtin: false }];
    });
  };

  // Remove habit by key
  const removeHabit = (key) => {
    setHabits(prev => prev.filter(h => h.key !== key));
    // if removed habit was selected, clear selection
    if (selectedHabit === key) {
      onSelectHabit && onSelectHabit(null);
    }
  };

  return (
    <div className="habitTracking" tabIndex={0} aria-label="Habits being tracked">
      <AddButton onAddHabit={addHabit} />
      <h4>Habits being tracked</h4>

     <div className="habits">
  {habits.map(habit => (
    <div key={habit.key} className="habit-row">
      <button id='habit-option-btn'
        className={habit.key === selectedHabit ? 'habit-btn active' : 'habit-btn'}
        onClick={() => onSelectHabit && onSelectHabit(habit.key)}
        aria-pressed={habit.key === selectedHabit}
      >
        {habit.label}
      </button>

      {!habit.builtin && (
        <button
          className="remove-btn"
          onClick={() => {
            if (window.confirm(`Remove "${habit.label}"?`)) removeHabit(habit.key);
          }}
          aria-label={`Remove ${habit.label}`}
          title="Remove habit"
        >
          ✖
        </button>
      )}
    </div>
  ))}
</div>



      
    </div>
  );
}

export default HabitTracking;
