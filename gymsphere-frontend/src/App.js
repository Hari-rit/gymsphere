// src/App.js
import React, { useState } from 'react';
import './App.css';
import Signup from './Signup';
import Login from './Login';
import MemberDashboard from './MemberDashboard';
import TrainerDashboard from './TrainerDashboard';
import { Routes, Route, useNavigate } from 'react-router-dom';

function App() {
  const [view, setView] = useState(null); // 'signup' or 'login'
  const [user, setUser] = useState(null); // Store user data
  const navigate = useNavigate();

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    if (userData.role === 'member') {
      navigate('/member');
    } else if (userData.role === 'trainer') {
      navigate('/trainer');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setView(null);
    navigate('/');
  };

  const backgroundStyle = {
    backgroundImage: 'url("/gym-bg.png")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundAttachment: 'fixed',
    minHeight: '100vh',
  };

  return (
    <div style={backgroundStyle}>
      <div className="overlay">
        <Routes>
          <Route
            path="/"
            element={
              <div className="container mt-5 text-center">
                <img
                  src="/logo192.png"
                  alt="GymSphere Logo"
                  style={{ height: '60px', marginBottom: '10px' }}
                />
                <h1 className="mb-3 heading-font text-white">WELCOME TO GYMSPHERE</h1>
                <p className="lead text-white">Your AI-powered gym ecosystem starts here.</p>

                <div className="d-flex justify-content-center gap-3 mt-4 responsive-buttons">
                  <button
                    className={`btn ${view === 'signup' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setView('signup')}
                  >
                    Signup
                  </button>
                  <button
                    className={`btn ${view === 'login' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setView('login')}
                  >
                    Login
                  </button>
                </div>

                {view && (
                  <div className="d-flex justify-content-center mt-4">
                    <div className="card p-4 shadow" style={{ maxWidth: '500px', width: '100%' }}>
                      {view === 'signup' && <Signup />}
                      {view === 'login' && <Login onLogin={handleLoginSuccess} />}
                    </div>
                  </div>
                )}
              </div>
            }
          />

          <Route
            path="/member"
            element={<MemberDashboard username={user?.username} onLogout={handleLogout} />}
          />
          <Route
            path="/trainer"
            element={<TrainerDashboard username={user?.username} onLogout={handleLogout} />}
          />
        </Routes>
      </div>
    </div>
  );
}

export default App;
