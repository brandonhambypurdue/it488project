

import React from 'react';
import './PopupModal.css';
import ReactDOM from 'react-dom';




export default function PopupModal({ isOpen, onClose, children }) {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="popup-overlay">
      <div className="popup-content">
        <button className="close-btn" onClick={onClose}>Close</button>
        {children}
      </div>
    </div>,
    document.body // 👈 renders outside normal layout flow
  );
}





