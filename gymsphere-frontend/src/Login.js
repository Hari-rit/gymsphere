// src/Login.js
import React, { useState } from 'react';
import LoadingSpinner from './LoadingSpinner';
import { useNavigate } from 'react-router-dom';

function Login({ onLogin }) {
  const [form, setForm] = useState({
    username: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('http://localhost:100/gymsphere-backend/login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      });

      const data = await res.json();
      alert(data.message);

      if (data.success) {
        const { role, username, id } = data.user;

        //  Pass user data up to parent if needed
        if (onLogin) onLogin(data.user);

        //  Store session in sessionStorage
        sessionStorage.setItem('username', username);
        sessionStorage.setItem('role', role);
        sessionStorage.setItem('userId', id);

        //  Redirect by role
        if (role === 'admin') {
          navigate('/admin');
        } else if (role === 'trainer') {
          navigate('/trainer');
        } else {
          navigate('/member');
        }
      }
    } catch (err) {
      alert('Login failed. Please try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2
        className="text-center mb-4"
        style={{ fontFamily: 'Bebas Neue', fontSize: '2rem' }}
      >
        Login
      </h2>

      {loading ? (
        <LoadingSpinner />
      ) : (
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
      )}
    </div>
  );
}

export default Login;
