// src/LoadingSpinner.js
import React from 'react';
import './LoadingSpinner.css';

function LoadingSpinner() {
  return (
    <div className="loading-spinner-container">
      <img
        src="/dumbbell.png"
        alt="Loading..."
        className="dumbbell-spinner"
      />
    </div>
  );
}

export default LoadingSpinner;
