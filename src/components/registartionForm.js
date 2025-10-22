import React, { useEffect, useState } from 'react';
import './registrationForm.css';

export default function RegistrationForm({ onBackToLogin }) {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    username: '',
    password: '',
    confirm: '',
    terms: false,
  });

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const togglePassword = (field) => {
    const input = document.getElementById(field);
    input.type = input.type === 'password' ? 'text' : 'password';
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

const isPasswordComplex = (password) => {
  const complexityRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+=\[\]{}|\\:,.<>?/]).{8,}$/;
  const sqlUnsafeChars = /['";]/;
  return complexityRegex.test(password) && !sqlUnsafeChars.test(password);
};



 const isUsernameSafe = (username) => {
  const sqlUnsafeChars = /['";]/;
  return !sqlUnsafeChars.test(username) && !username.includes('--');
};



  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const { first_name, last_name, username, password, confirm, terms } = formData;

    if (!terms) return setErrorMsg('Please agree to the Terms to continue.');
    if (!isUsernameSafe(username)) return setErrorMsg('Username contains invalid characters.');
    if (!isPasswordComplex(password)) {
      return setErrorMsg(
        'Password must be at least 8 characters and include uppercase, lowercase, number, and special character (excluding SQL-sensitive characters).'
      );
    }
    if (password !== confirm) return setErrorMsg('Passwords do not match.');

    try {
      const res = await fetch('http://127.0.0.1:5000/api/register', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ first_name, last_name, username, password })
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ message: 'Registration failed.' }));
        throw new Error(data.message || 'Registration failed.');
      }

      setSuccessMsg('Account created! Go ahead and login and start tracking your habits good luck!!!');
      setFormData({
        first_name: '',
        last_name: '',
        username: '',
        password: '',
        confirm: '',
        terms: false,
      });
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  return (
    <div className="card" role="region" aria-labelledby="title">
      <div className="head">
        <h1 id="title">Create your Habit Tracker account</h1>
        <p className="lead">Log habits daily, and visualize progress!</p>
      </div>

      <form className="form" onSubmit={handleSubmit}>
        {errorMsg && <div className="msg error" role="alert">{errorMsg}</div>}
        {successMsg && <div className="msg success" role="status">{successMsg}</div>}

        <div className="row">
          <div>
            <label htmlFor="first_name">First name</label>
            <input
              id="first_name"
              name="first_name"
              type="text"
              placeholder="Jane"
              value={formData.first_name}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label htmlFor="last_name">Last name</label>
            <input
              id="last_name"
              name="last_name"
              type="text"
              placeholder="Doe"
              value={formData.last_name}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="username">Username</label>
          <input
            id="username"
            name="username"
            type="text"
            placeholder="janedoe123"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </div>

        <div className="row">
          <div className="pw-wrap">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="At least 8 characters"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <span className="pw-toggle" onClick={() => togglePassword('password')}>Show</span>
          </div>
          <div className="pw-wrap">
            <label htmlFor="confirm">Confirm password</label>
            <input
              id="confirm"
              name="confirm"
              type="password"
              value={formData.confirm}
              onChange={handleChange}
              required
            />
            <span className="pw-toggle" onClick={() => togglePassword('confirm')}>Show</span>
          </div>
        </div>

        <div className="checkbox">
          <input
            id="terms"
            name="terms"
            type="checkbox"
            checked={formData.terms}
            onChange={handleChange}
            required
          />
          <label htmlFor="terms">I agree to the Terms and Privacy Policy.</label>
        </div>

        <div className="actions">
          <button type="submit">Create account</button>
          <button
            type="button"
            className="secondary"
            onClick={() => setFormData({
              first_name: '',
              last_name: '',
              username: '',
              password: '',
              confirm: '',
              terms: false
            })}
          >
            Reset
          </button>
        </div>
      </form>

      <footer>
        <button className="toggleBtn" onClick={onBackToLogin}>
          ← Back to Login
        </button>
      </footer>
    </div>
  );
}




