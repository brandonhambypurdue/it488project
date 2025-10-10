import React, { useState } from 'react';
import axios from 'axios';
import RegistrationForm from './registartionForm'; // 👈 import your registration form

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showRegister, setShowRegister] = useState(false); // 👈 toggle state

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await axios.post('http://localhost:5000/api/login', {
        username,
        password,
      });

      console.log("✅ /api/login response:", res.data);

      if (res.data.success && res.data.username) {
        onLogin(res.data.username, password);
      } else {
        setError(res.data.message || "Login failed.");
      }
    } catch (err) {
      setError("Server error or invalid credentials.");
      console.error("Login error:", err.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='background'>
    <div className="loginWrapper">
      {showRegister ? (
  <>
    <RegistrationForm onBackToLogin={() => setShowRegister(false)} />
  </>

      ) : (
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
          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
          {error && <p style={{ color: 'red' }}>{error}</p>}

          {/* 👇 Add registration toggle */}
          <button
            type="button"
            className="toggleBtn"
            onClick={() => setShowRegister(true)}
          >
            Create Account
          </button>
        </form>
      )}
    </div>
    </div>
  );
}

export default Login;