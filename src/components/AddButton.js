import React, { useState } from 'react';


export default function AddButton({ onAddHabit }) {


  const [isOpen, setIsOpen] = useState(false);

  const handleAdd = (key, label) => {
    if (typeof onAddHabit === 'function') {
      onAddHabit(key, label);
      setIsOpen(false); // close after adding
    } else {
      console.warn('onAddHabit is not a function', onAddHabit);
    }
  };

  return (
    <div className="dropdown">
      <div
        className="dropbtn"
        role="button"
        tabIndex={0}
        onClick={() => setIsOpen(prev => !prev)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setIsOpen(prev => !prev); }}
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        Add Habit ▾
       
      </div>

      {isOpen && (
        <div className="dropdown-content" role="menu">
          <div className="group" role="group" aria-label="Mental Health habits">
            <div className="group-title">Mental Health habits</div>
            <div className="option" role="menuitem" tabIndex={0} onClick={() => handleAdd('meditation', '🧘 Meditation')}>Meditation</div>
            <div className="option" role="menuitem" tabIndex={0} onClick={() => handleAdd('journaling', '📓 Journaling')}>Journaling</div>
            <div className="option" role="menuitem" tabIndex={0} onClick={() => handleAdd('reflection', '🪞 Self reflection')}>Self reflection</div>
          </div>

          <div className="group" role="group" aria-label="Physical Health habits">
            <div className="group-title">Physical Health habits</div>
            <div className="option" role="menuitem" tabIndex={0} onClick={() => handleAdd('stretching', '🤸 Stretching')}>Stretching</div>
            <div className="option" role="menuitem" tabIndex={0} onClick={() => handleAdd('cardio', '🏃 Cardio')}>Cardio</div>
            <div className="option" role="menuitem" tabIndex={0} onClick={() => handleAdd('hydration', '💧 Hydration')}>Hydration</div>
          </div>

       

          <div className="group">
            <div className="group-title">Lets break a habit</div>
            <div className="option" role="menuitem" tabIndex={0} onClick={() => handleAdd('break', '🛑 Break Habit')}>Break Habit</div>
          </div>
        </div>
      )}
    </div>
  );
}
