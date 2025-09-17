import React, { useState } from 'react';
import axios from 'axios';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [password, setPassword] = useState('');


 const handleLogin = async (e) => {
  e.preventDefault();
  try {
    const res = await axios.post('http://localhost:5000/api/login', {
      username,
      password
    });

    if (res.data.success) {
      onLogin(username); // You could also pass res.data.habits if needed
    } else {
      setError(res.data.message || "Login failed.");
    }
  } catch (err) {
    setError("Server error or invalid credentials.");
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
  <input
    type="password"
    placeholder="Password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    required
  />
  <button type="submit">Login</button>
  {error && <p style={{ color: 'red' }}>{error}</p>}
</form>

    </div>
  );
}

export default Login;