// src/Login.js
import React, { useState } from 'react';

function Login({ onLoginSuccess }) {
  const [form, setForm] = useState({
    username: '',
    password: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch('http://localhost:100/gymsphere-backend/login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      alert(data.message);

      if (data.success && onLoginSuccess) {
        onLoginSuccess(data.user); // You can store user data in parent or context
      }
    } catch (err) {
      alert('Login failed. Please try again.');
    }
  };

  return (
    <div>
      <h2 className="text-center mb-4" style={{ fontFamily: 'Bebas Neue', fontSize: '2rem' }}>Login</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3 text-start">
          <label className="form-label fw-bold">Username</label>
          <input
            type="text"
            name="username"
            className="form-control"
            placeholder="Enter username"
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3 text-start">
          <label className="form-label fw-bold">Password</label>
          <input
            type="password"
            name="password"
            className="form-control"
            placeholder="Enter password"
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" className="btn btn-primary w-100">
          Login
        </button>
      </form>
    </div>
  );
}

export default Login;
