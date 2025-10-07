

import React from 'react';
import './PopupModal.css';

export default function PopupModal({ isOpen, onClose, children }) {
  if (!isOpen) return null;

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <button className="close-btn" onClick={onClose}>Close</button>
        {children}
      </div>
    </div>
  );
}



