// src/App.js
import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import Signup from './Signup';
import Login from './Login';
import MemberDashboard from './MemberDashboard.jsx';
import TrainerDashboard from './TrainerDashboard.jsx';
import AdminDashboard from './AdminDashboard.jsx'; 
import LoadingSpinner from './LoadingSpinner';
import './LoadingSpinner.css';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

function App() {
  const [view, setView] = useState(null); // 'signup' or 'login'
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [transitioning, setTransitioning] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  //  Logout now calls backend too
  const handleLogout = useCallback(() => {
    setTransitioning(true);

    fetch('http://localhost:100/gymsphere-backend/logout.php', {
      method: 'POST',
      credentials: 'include',
    }).finally(() => {
      setUser(null);
      setView(null);
      localStorage.removeItem('user');

      setTimeout(() => {
        navigate('/');
        setTransitioning(false);
      }, 1000);
    });
  }, [navigate]);

  //  Session check every 1 minute
  useEffect(() => {
    const interval = setInterval(() => {
      fetch('http://localhost:100/gymsphere-backend/check-session.php', {
        method: 'GET',
        credentials: 'include',
      })
        .then((res) => res.json())
        .then((data) => {
          if (!data.loggedIn) {
            handleLogout();
          }
        })
        .catch((err) => console.error('Session check error:', err));
    }, 60000);

    return () => clearInterval(interval);
  }, [handleLogout]);

  //  On initial load, check localStorage
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      setUser(storedUser);
      if (location.pathname === '/') {
        if (storedUser.role === 'member') navigate('/member');
        else if (storedUser.role === 'trainer') navigate('/trainer');
        else if (storedUser.role === 'admin') navigate('/admin'); 
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
      if (userData.role === 'member') navigate('/member');
      else if (userData.role === 'trainer') navigate('/trainer');
      else if (userData.role === 'admin') navigate('/admin'); 
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
            {/* 🏠 Landing Page */}
            <Route
              path="/"
              element={
                <div className="container mt-5 text-center">
                  <img
                    src="/gs_logo.png"
                    alt="GymSphere Logo"
                    style={{ height: '220px', width:'250px',marginBottom: '10px' }}
                  />
                  <h1 className="mb-3 heading-font text-white">WELCOME TO GYMSPHERE</h1>
                  <p className="lead text-white">Smarter Way TO Manager Your Gym</p>

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

            {/* 🛡️ Role-based Dashboards */}
            <Route
              path="/member"
              element={
                <ProtectedRoute user={user} allowedRole="member">
                  <MemberDashboard username={user?.username} userId={user?.id} onLogout={handleLogout} />
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
            <Route
              path="/admin" 
              element={
                <ProtectedRoute user={user} allowedRole="admin">
                  <AdminDashboard username={user?.username} onLogout={handleLogout} />
                </ProtectedRoute>
              }
            />

            {/*  Catch All */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        )}
      </div>
    </div>
  );
}

export default App;
