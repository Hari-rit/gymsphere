// src/App.js
import React, { useState } from 'react';
import './App.css';
import Signup from './Signup';
import Login from './Login';

function App() {
  const [view, setView] = useState(null); // Form hidden initially

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
        <div className="container mt-5 text-center">
          {/* Logo */}
          <img
            src="/logo192.png"
            alt="GymSphere Logo"
            style={{ height: '60px', marginBottom: '10px' }}
          />

          {/* Heading */}
          <h1 className="mb-3 heading-font text-white">WELCOME TO GYMSPHERE</h1>
          <p className="lead text-white">Your AI-powered gym ecosystem starts here.</p>

          {/* Toggle Buttons */}
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

          {/* Form Display */}
          {view && (
            <div className="d-flex justify-content-center mt-4">
              <div className="card p-4 shadow" style={{ maxWidth: '500px', width: '100%' }}>
                {view === 'signup' && <Signup />}
                {view === 'login' && <Login />}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
