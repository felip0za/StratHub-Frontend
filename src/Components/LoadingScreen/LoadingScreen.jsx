import React from "react";
import "./LoadingScreen.css";

function LoadingScreen() {
  return (
    <div className="loading-overlay">
      <div className="spinner"></div>
      <p className="loading-text">Carregando...</p>
    </div>
  );
}

export default LoadingScreen;
