import React, { useState } from 'react';
import axios from 'axios';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.get(`http://localhost:5000/api/habits/${username}`)
;
      if (res.data.habits) {
        onLogin(username); // Pass username to parent
      } else {
        setError("No habits found for this user.");
      }
    } catch (err) {
      setError("User not found or server error.");
      console.error("Login error:", err);
    }
  };

  return (
     <div className="loginWrapper">

    <form onSubmit={handleLogin} className="loginForm">
      <h2>Login</h2>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
      />
      <button type="submit">Login</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </form>
    </div>
  );
}

export default Login;