// src/App.js
import React, { useState, useEffect } from 'react';
import './App.css';
import Signup from './Signup';
import Login from './Login';
import MemberDashboard from './MemberDashboard.jsx';
import TrainerDashboard from './TrainerDashboard.jsx';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';

function App() {
  const [view, setView] = useState(null); // 'signup' or 'login'
  const [user, setUser] = useState(null); // Store user data
  const navigate = useNavigate();
  const location = useLocation();

  // Load user from localStorage on app start
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      setUser(storedUser);
      if (location.pathname === '/') {
        if (storedUser.role === 'member') {
          navigate('/member');
        } else if (storedUser.role === 'trainer') {
          navigate('/trainer');
        }
      }
    }
  }, [location.pathname, navigate]);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData)); // Persist login
    if (userData.role === 'member') {
      navigate('/member');
    } else if (userData.role === 'trainer') {
      navigate('/trainer');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setView(null);
    localStorage.removeItem('user'); // Clear saved login
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
