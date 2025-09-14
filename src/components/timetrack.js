import React from 'react';

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
