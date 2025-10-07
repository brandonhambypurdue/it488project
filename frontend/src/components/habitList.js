// habitList.js
import React, { useState, useEffect } from 'react';
import './HabitTracking.css';
import AddButton from './AddButton';

const STORAGE_KEY = 'myapp_habits_v1';

// Only keys that exist as columns in your DB:
const ALLOWED_KEYS = new Set([
  'study',
  'sleep',
  'hobby',
  'meditation',
  'journaling',
  'self_reflection',
  'stretching',
  'hydration',
  'lets_break_a_habit',
]);

function HabitTracking({ onSelectHabit, selectedHabit }) {
  // Default (built-in) habits
  const defaultHabits = [
    { key: 'study', label: '📚 Studying', builtin: true },
    { key: 'sleep', label: '😴 Sleeping', builtin: true },
    { key: 'hobby', label: '🎨 Hobby', builtin: true },
  ];

  const [habits, setHabits] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultHabits;
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) && parsed.length ? parsed : defaultHabits;
    } catch {
      return defaultHabits;
    }
  });

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
    } catch (err) {
      console.warn('Failed to save habits', err);
    }
  }, [habits]);

  // Ensure something is selected on first render / after changes
  useEffect(() => {
    if (!selectedHabit && habits.length > 0) {
      onSelectHabit?.(habits[0].key);
    } else if (
      selectedHabit &&
      !habits.some((h) => h.key === selectedHabit)
    ) {
      // selected habit was removed, pick a fallback
      onSelectHabit?.(habits[0]?.key ?? null);
    }
  }, [habits, selectedHabit, onSelectHabit]);

  // Add habit (validated, idempotent)
  const addHabit = (key, label) => {
    // Normalize optional: convert spaces to underscores + lowercase
    const normalizedKey = String(key).trim().toLowerCase().replace(/\s+/g, '_');

    if (!ALLOWED_KEYS.has(normalizedKey)) {
      alert(
        `"${key}" isn’t a supported habit key.\n\nAllowed:\n` +
          Array.from(ALLOWED_KEYS).join(', ')
      );
      return;
    }

    setHabits((prev) => {
      if (prev.some((h) => h.key === normalizedKey)) return prev;
      const next = [...prev, { key: normalizedKey, label, builtin: false }];
      // If nothing selected yet, select the newly added one
      if (!selectedHabit) onSelectHabit?.(normalizedKey);
      return next;
    });
  };

  // Remove habit by key (and select fallback if needed)
  const removeHabit = (key) => {
    setHabits((prev) => {
      const next = prev.filter((h) => h.key !== key);
      if (selectedHabit === key) {
        onSelectHabit?.(next[0]?.key ?? null);
      }
      return next;
    });
  };

  return (
    <div className="habitTracking" tabIndex={0} aria-label="Habits being tracked">
      <AddButton onAddHabit={addHabit} />
      <h4>Habits being tracked</h4>

      <div className="habits">
        {habits.map((habit) => (
          <div key={habit.key} className="habit-row">
            <button
              id="habit-option-btn"
              className={habit.key === selectedHabit ? 'habit-btn active' : 'habit-btn'}
              onClick={() => onSelectHabit?.(habit.key)}
              aria-pressed={habit.key === selectedHabit}
              title={`Select ${habit.label}`}
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
