// src/App.js
import React, { useState, useEffect } from 'react';
import './App.css';
import Signup from './Signup';
import Login from './Login';
import MemberDashboard from './MemberDashboard.jsx';
import TrainerDashboard from './TrainerDashboard.jsx';
import LoadingSpinner from './LoadingSpinner';
import './LoadingSpinner.css';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

function App() {
  const [view, setView] = useState(null); // 'signup' or 'login'
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Page load
  const [transitioning, setTransitioning] = useState(false); // Login/Logout transition
  const navigate = useNavigate();
  const location = useLocation();

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
    setLoading(false);
  }, [location.pathname, navigate]);

  const handleLoginSuccess = (userData) => {
    setTransitioning(true);
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));

    setTimeout(() => {
      setTransitioning(false);
      if (userData.role === 'member') {
        navigate('/member');
      } else if (userData.role === 'trainer') {
        navigate('/trainer');
      }
    }, 1000);
  };

  const handleLogout = () => {
    setTransitioning(true);
    setUser(null);
    setView(null);
    localStorage.removeItem('user');
    setTimeout(() => {
      navigate('/');
      setTransitioning(false);
    }, 1000);
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
        {loading || transitioning ? (
          <LoadingSpinner />
        ) : (
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

            {/* 🛡️ Protected Routes */}
            <Route
              path="/member"
              element={
                <ProtectedRoute user={user} allowedRole="member">
                  <MemberDashboard username={user?.username} onLogout={handleLogout} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/trainer"
              element={
                <ProtectedRoute user={user} allowedRole="trainer">
                  <TrainerDashboard username={user?.username} onLogout={handleLogout} />
                </ProtectedRoute>
              }
            />

            {/* 🔁 Fallback route to redirect unknown paths to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        )}
      </div>
    </div>
  );
}

export default App;
