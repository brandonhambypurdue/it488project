
import React from 'react';
import './LogoutButton.css'
const LogoutButton = ({ onLogout }) => {
  return (
    <button onClick={onLogout} className="logoutBtn">
      Log Out
    </button>
  );
};

export default LogoutButton;