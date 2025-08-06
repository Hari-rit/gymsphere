// src/Signup.js
import React, { useState } from 'react';
import LoadingSpinner from './LoadingSpinner'; // 👈 Add this line

function Signup() {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    role: 'member',
  });

  const [message, setMessage] = useState(null);
  const [type, setType] = useState('');
  const [loading, setLoading] = useState(false); // 👈 New loading state

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // 👈 Start loading

    try {
      const res = await fetch('http://localhost:100/gymsphere-backend/signup.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (data.success) {
        setMessage(data.message);
        setType('success');
        setForm({
          username: '',
          email: '',
          password: '',
          role: 'member',
        });
      } else {
        setMessage(data.message);
        setType('danger');
      }
    } catch (err) {
      setMessage('Something went wrong. Please try again.');
      setType('danger');
    } finally {
      setLoading(false); // 👈 Stop loading
    }
  };

  return (
    <div>
      <h2 className="text-center mb-4" style={{ fontFamily: 'Bebas Neue', fontSize: '2rem' }}>Signup</h2>

      {message && (
        <div className={`alert alert-${type}`} role="alert">
          {message}
        </div>
      )}

      {loading ? (
        <LoadingSpinner />
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="mb-3 text-start">
            <label className="form-label fw-bold">Username</label>
            <input
              type="text"
              name="username"
              value={form.username}
              className="form-control"
              placeholder="Enter username"
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3 text-start">
            <label className="form-label fw-bold">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              className="form-control"
              placeholder="Enter email"
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3 text-start">
            <label className="form-label fw-bold">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              className="form-control"
              placeholder="Enter password"
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3 text-start">
            <label className="form-label fw-bold">Role</label>
            <select
              name="role"
              value={form.role}
              className="form-select"
              onChange={handleChange}
            >
              <option value="member">Member</option>
              <option value="trainer">Trainer</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary w-100">
            Register
          </button>
        </form>
      )}
    </div>
  );
}

export default Signup;
